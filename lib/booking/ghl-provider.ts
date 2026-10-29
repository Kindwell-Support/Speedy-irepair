import "server-only";
import { leadSourceFor, type Attribution } from "@/lib/attribution";
import { serverEnv } from "@/lib/env.server";
import { GhlError, ghl, toE164 } from "@/lib/ghl/client";
import { FIELD_IDS, LEAD_STATUS, LOCATION, TAGS, type FieldName } from "@/lib/ghl/fields";
import { attempt } from "@/lib/ghl/retry";
import {
  CONSENT_VERSION,
  type CompleteInput,
  type IntakeField,
  type Slot,
  type StartInput,
} from "@/lib/repair-schemas";
import { BOOKING_WINDOW_DAYS, SHOP_TIME_ZONE, shopDateISO } from "@/lib/repair-time";
import { ISSUE_OTHER } from "@/lib/repair-catalog";
import { SlotUnavailableError, type BookingProvider, type IntakeSession } from "./provider";

/**
 * GoHighLevel backend (API v2). GHL is the only destination for repair leads; nothing here touches Sanity.
 *
 * Step 2 upserts the contact by phone (the location's duplicate rule is phone first, then email), records SMS
 * consent and attribution, tags it intake-started and opens an opportunity at "Intake Started". Steps 3–5 write
 * each answer straight to its custom field. Step 7 fills in name and email, swaps intake-started for
 * intake-complete, and either books the appointment (stage Booked) or leaves it for a call (stage New Lead).
 * Every write goes through attempt(): failures are logged, retried after the response, and never shown to the
 * customer.
 */
const env = serverEnv;
const DUR_CACHE_S = 60 * 60;
const DEFAULT_SLOT_MINUTES = 30;

type CustomFieldValue = { id: string; value?: unknown };
interface Contact {
  id: string;
  customFields?: CustomFieldValue[];
}
interface Opportunity {
  id: string;
  pipelineStageId?: string;
}

/** Custom field writes in GHL's shape, skipping empty values so they never blank out what's there. */
const fields = (values: Partial<Record<FieldName, string | undefined>>) =>
  (Object.entries(values) as [FieldName, string | undefined][])
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => ({ id: FIELD_IDS[k], field_value: v }));

const fieldFor: Record<IntakeField, FieldName> = {
  brand: "brand",
  model: "model",
  issue: "issue",
  problemDetails: "problemDetails",
};

function attributionFields(a: Attribution) {
  return {
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
    landingPage: a.landingPage,
  };
}

function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

const isSlotTaken = (err: unknown) =>
  err instanceof GhlError &&
  err.status >= 400 &&
  err.status < 500 &&
  /slot|no longer available|not available/i.test(err.message);

// --- GHL calls -----------------------------------------------------------------------------------------------

async function upsertContact(body: Record<string, unknown>): Promise<Contact> {
  const res = await ghl<{ contact: Contact }>("POST", "/contacts/upsert", {
    locationId: env.ghlLocationId,
    ...body,
  });
  return res.contact;
}

const updateContact = (contactId: string, body: Record<string, unknown>) =>
  ghl("PUT", `/contacts/${contactId}`, body);
const addTags = (contactId: string, tags: string[]) =>
  ghl("POST", `/contacts/${contactId}/tags`, { tags });
const removeTags = (contactId: string, tags: string[]) =>
  ghl("DELETE", `/contacts/${contactId}/tags`, { tags });
const addNote = (contactId: string, body: string) =>
  ghl("POST", `/contacts/${contactId}/notes`, { body });
const moveOpportunity = (id: string, pipelineStageId: string, name?: string) =>
  ghl("PUT", `/opportunities/${id}`, { pipelineStageId, ...(name ? { name } : {}) });
const setFields = (contactId: string, values: Partial<Record<FieldName, string | undefined>>) =>
  updateContact(contactId, { customFields: fields(values) });

/** First-touch attribution: Lead Source is only written when the contact doesn't have one yet. */
async function setLeadSourceIfEmpty(contactId: string, attribution: Attribution) {
  const { contact } = await ghl<{ contact: Contact }>("GET", `/contacts/${contactId}`);
  const current = contact.customFields?.find((f) => f.id === FIELD_IDS.leadSource)?.value;
  if (typeof current === "string" && current.trim()) return;
  await setFields(contactId, { leadSource: leadSourceFor(attribution) });
}

/**
 * The contact's unfinished intake (an open opportunity still at "Intake Started"), or a new one. Opportunities
 * further along (submitted, booked, in repair) are left alone, so a second repair gets its own card.
 */
async function ensureOpportunity(contactId: string, name: string): Promise<string> {
  const params = new URLSearchParams({
    location_id: env.ghlLocationId,
    pipeline_id: env.ghlPipelineId,
    contact_id: contactId,
    status: "open",
  });
  const { opportunities } = await ghl<{ opportunities: Opportunity[] }>(
    "GET",
    `/opportunities/search?${params}`,
  );
  const unfinished = opportunities.find((o) => o.pipelineStageId === env.ghlStageIntakeStarted);
  if (unfinished) return unfinished.id;
  const { opportunity } = await ghl<{ opportunity: Opportunity }>("POST", "/opportunities/", {
    locationId: env.ghlLocationId,
    pipelineId: env.ghlPipelineId,
    pipelineStageId: env.ghlStageIntakeStarted,
    contactId,
    name,
    status: "open",
  });
  return opportunity.id;
}

async function slotMinutes(): Promise<number> {
  try {
    const { calendar } = await ghl<{
      calendar: { slotDuration?: number; slotDurationUnit?: string };
    }>("GET", `/calendars/${env.ghlCalendarId}`, undefined, {
      revalidate: DUR_CACHE_S,
    });
    const n = calendar.slotDuration ?? DEFAULT_SLOT_MINUTES;
    return calendar.slotDurationUnit === "hours" ? n * 60 : n;
  } catch {
    return DEFAULT_SLOT_MINUTES;
  }
}

async function bookAppointment(contactId: string, input: CompleteInput, slotStart: string) {
  const end = new Date(
    new Date(slotStart).getTime() + (await slotMinutes()) * 60_000,
  ).toISOString();
  const res = await ghl<{ id?: string; event?: { id?: string } }>(
    "POST",
    "/calendars/events/appointments",
    {
      calendarId: env.ghlCalendarId,
      locationId: env.ghlLocationId,
      contactId,
      startTime: slotStart,
      endTime: end,
      title: `${input.issue}: ${input.brand} ${input.model}`.trim(),
      appointmentStatus: "confirmed",
    },
  );
  return { id: res.id ?? res.event?.id ?? null, start: new Date(slotStart).toISOString(), end };
}

// --- Steps ---------------------------------------------------------------------------------------------------

/** Step 2. Throws only if the contact upsert itself fails; everything after it is attempted independently. */
async function startCore(input: StartInput): Promise<IntakeSession> {
  const phone = toE164(input.phone);
  const contact = await upsertContact({
    phone,
    ...(input.email ? { email: input.email } : {}),
    source: "Website repair widget",
    customFields: fields({
      deviceType: input.device,
      location: LOCATION,
      leadStatus: LEAD_STATUS.intakeStarted,
      smsConsentAt: shopDateISO(),
      ...attributionFields(input.attribution),
    }),
  });
  const id = contact.id;
  const log = { contactId: id, phone };
  const [opportunityId] = await Promise.all([
    attempt("ensureOpportunity", log, () =>
      ensureOpportunity(id, `${input.device} repair (${phone})`),
    ),
    attempt("setLeadSource", { ...log, attribution: input.attribution }, () =>
      setLeadSourceIfEmpty(id, input.attribution),
    ),
    attempt("addTag intake-started", log, () => addTags(id, [TAGS.started])),
    attempt("addNote consent", log, () =>
      addNote(
        id,
        `SMS consent given via website widget, ${new Date().toISOString()}, consent text ${CONSENT_VERSION}`,
      ),
    ),
  ]);
  return { contactId: id, opportunityId: opportunityId ?? null };
}

/** Step 7. Throws SlotUnavailableError for a taken slot, and (only when there's no session) a failed upsert. */
async function completeCore(session: IntakeSession | null, input: CompleteInput) {
  const s = session ?? (await startCore(input));
  const id = s.contactId;
  const log = {
    contactId: id,
    phone: toE164(input.phone),
    name: input.name,
    slotStart: input.slotStart,
  };
  const oppName = `${input.name}: ${input.brand} ${input.model} – ${input.issue}`;

  await Promise.all([
    attempt("updateContact details", log, () =>
      updateContact(id, {
        ...splitName(input.name),
        ...(input.email ? { email: input.email } : {}),
        // Steps 3–5 already wrote these; repeated so the contact is complete even if those writes were lost.
        customFields: fields({
          deviceType: input.device,
          brand: input.brand,
          model: input.model,
          issue: input.issue,
          problemDetails: input.issue === ISSUE_OTHER ? input.issueDetails : undefined,
        }),
      }),
    ),
    attempt("setLeadSource", log, () => setLeadSourceIfEmpty(id, input.attribution)),
  ]);

  const opportunityId =
    s.opportunityId ??
    (await attempt("ensureOpportunity", log, () => ensureOpportunity(id, oppName)));

  const markBooked = () =>
    Promise.all([
      opportunityId
        ? attempt("moveOpportunity Booked", log, () =>
            moveOpportunity(opportunityId, env.ghlStageBooked, oppName),
          )
        : undefined,
      attempt("setLeadStatus Booked", log, () => setFields(id, { leadStatus: LEAD_STATUS.booked })),
    ]);
  const markSubmitted = () =>
    Promise.all([
      opportunityId
        ? attempt("moveOpportunity New Lead", log, () =>
            moveOpportunity(opportunityId, env.ghlStageNewLead, oppName),
          )
        : undefined,
      attempt("setLeadStatus Submitted", log, () =>
        setFields(id, { leadStatus: LEAD_STATUS.submitted }),
      ),
    ]);

  // Set once the result is decided; a booking that only succeeds on a background retry then moves the card itself.
  let responded = false;
  let appointment: Awaited<ReturnType<typeof bookAppointment>> | undefined;
  if (input.slotStart) {
    const slotStart = input.slotStart;
    try {
      appointment = await attempt(
        "bookAppointment",
        log,
        async () => {
          const booked = await bookAppointment(id, input, slotStart);
          if (responded) await markBooked();
          return booked;
        },
        isSlotTaken,
      );
    } catch (err) {
      if (isSlotTaken(err)) throw new SlotUnavailableError();
      throw err;
    }
  }
  responded = true;

  // Tags are swapped whatever happened above, including a failed booking or Lead Status write.
  await Promise.all([
    attempt("removeTag intake-started", log, () => removeTags(id, [TAGS.started])),
    attempt("addTag intake-complete", log, () => addTags(id, [TAGS.complete])),
    appointment ? markBooked() : markSubmitted(),
  ]);

  return {
    reference: appointment?.id ?? null,
    appointment: appointment ? { start: appointment.start, end: appointment.end } : null,
  };
}

export const ghlProvider: BookingProvider = {
  async startIntake(input) {
    return (
      (await attempt(
        "startIntake",
        { phone: toE164(input.phone), email: input.email, device: input.device },
        () => startCore(input),
      )) ?? null
    );
  },

  async updateField(session, field, value) {
    await attempt(`updateField ${field}`, { contactId: session.contactId, value }, () =>
      setFields(session.contactId, { [fieldFor[field]]: value }),
    );
  },

  async getFreeSlots() {
    const now = Date.now();
    const params = new URLSearchParams({
      startDate: String(now),
      endDate: String(now + BOOKING_WINDOW_DAYS * 86_400_000),
      timezone: SHOP_TIME_ZONE,
    });
    const [minutes, res] = await Promise.all([
      slotMinutes(),
      ghl<Record<string, { slots?: string[] } | string>>(
        "GET",
        `/calendars/${env.ghlCalendarId}/free-slots?${params}`,
      ),
    ]);
    const days: Record<string, Slot[]> = {};
    for (const [date, day] of Object.entries(res)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof day !== "object" || !day.slots?.length)
        continue;
      days[date] = day.slots.map((start) => ({
        start,
        end: new Date(new Date(start).getTime() + minutes * 60_000).toISOString(),
        available: true,
      }));
    }
    return days;
  },

  async completeIntake(session, input) {
    if (session) return completeCore(session, input);
    // Step 2 never reached GHL, so this has to create the lead too. If even that fails, retry it all later.
    const result = await attempt(
      "completeIntake (no session)",
      { ...input, token: undefined },
      () => completeCore(null, input),
      (err) => err instanceof SlotUnavailableError,
    );
    return result ?? { reference: null, appointment: null };
  },
};

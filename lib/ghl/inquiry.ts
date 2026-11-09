import "server-only";
import { leadSourceFor, type Attribution } from "@/lib/attribution";
import { serverEnv } from "@/lib/env.server";
import { ghl, isRetriable, toE164 } from "@/lib/ghl/client";
import {
  BUYBACK_PIPELINE,
  FIELD_IDS,
  INQUIRY_PIPELINE,
  INTERNET_AVAILABILITY_TAGS,
  INTERNET_OPTIONS,
  INTERNET_PIPELINE,
  LEAD_STATUS,
  LEAD_STATUS_ACTIVE,
  LOCATION,
  STAGE_QUOTE_REQUESTED,
  STAGE_QUOTE_SHOWN,
  TAGS,
  type FieldName,
} from "@/lib/ghl/fields";
import { ownerForUpsert, pickOwner } from "@/lib/ghl/owner";
import { attempt } from "@/lib/ghl/retry";
import { CONSENT_VERSION } from "@/lib/repair-schemas";
import { shopDateISO } from "@/lib/repair-time";
import type { InternetInput, QuoteInput, TradeInInput } from "@/lib/forms/schemas";
import type { QuotePrice } from "@/lib/repair-prices";
import { checkAvailability } from "@/lib/internet-availability/check";
import type { AvailabilityResult } from "@/lib/internet-availability/config";

interface InquiryInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
  attribution?: Attribution;
}

interface Contact {
  id: string;
  assignedTo?: string | null;
  customFields?: { id: string; value?: unknown }[];
}

/** One website form's lead: who sent it, which pipeline it lands in, and what goes in the card name and note. */
interface FormLead {
  name: string;
  /** Quote forms can leave this out; they always have a phone. */
  email?: string;
  phone?: string;
  attribution: Attribution;
  source: string;
  tag: string;
  /** More tags, e.g. the home internet availability result. */
  extraTags?: string[];
  /** reuseFrom: only an open card at one of these stages is reused, otherwise a new card opens. Without it, any open card is. */
  pipeline: { id: string; stageNew: string; reuseFrom?: readonly string[] };
  cardName: string;
  note: string;
  /** Extra contact fields, for forms that collect what the Repair Intake fields hold. */
  contactFields?: Partial<Record<FieldName, string>>;
  /** Lead Status to set, unless the contact has a repair under way. */
  leadStatus?: string;
  /** GHL's own contact address fields, for forms that collect one. */
  address?: { address1: string; city: string; state: string; postalCode: string };
}

/**
 * A website form to GHL. Name, email and phone go on the contact; what was asked goes in a contact note, because
 * no custom field fits it (quotes also fill the Repair Intake fields). A contact has one open card in the form's
 * pipeline, and a repeat submission moves it back to the first stage. Every step before the note is safe to repeat
 * and the note comes last, so a retry can't post it twice.
 */
async function send({ name, email, phone, attribution, source, tag, extraTags = [], pipeline, cardName, note, contactFields = {}, leadStatus, address }: FormLead) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const customFields = [
    { id: FIELD_IDS.location, field_value: LOCATION },
    { id: FIELD_IDS.utmSource, field_value: attribution.utmSource },
    { id: FIELD_IDS.utmMedium, field_value: attribution.utmMedium },
    { id: FIELD_IDS.utmCampaign, field_value: attribution.utmCampaign },
    { id: FIELD_IDS.landingPage, field_value: attribution.landingPage },
    ...(Object.entries(contactFields) as [FieldName, string][]).map(([k, v]) => ({ id: FIELD_IDS[k], field_value: v })),
  ].filter((f) => f.field_value);

  const upserted = await ghl<{ contact: { id: string } }>("POST", "/contacts/upsert", {
    locationId: serverEnv.ghlLocationId,
    firstName,
    ...(rest.length ? { lastName: rest.join(" ") } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone: toE164(phone) } : {}),
    ...address,
    source,
    customFields,
    ...(await ownerForUpsert(email ? { email } : { number: toE164(phone ?? "") })),
  });
  const id = upserted.contact.id;

  await ghl("POST", `/contacts/${id}/tags`, { tags: [tag, ...extraTags] });

  // First touch, as on /repair: a Lead Source or owner the contact already has is left alone.
  const { contact } = await ghl<{ contact: Contact }>("GET", `/contacts/${id}`);
  const owner = contact.assignedTo || pickOwner();
  const current = (field: string) => contact.customFields?.find((f) => f.id === field)?.value;
  const fields = [
    ...(!current(FIELD_IDS.leadSource) ? [{ id: FIELD_IDS.leadSource, field_value: leadSourceFor(attribution) }] : []),
    ...(leadStatus && !LEAD_STATUS_ACTIVE.includes(String(current(FIELD_IDS.leadStatus)))
      ? [{ id: FIELD_IDS.leadStatus, field_value: leadStatus }]
      : []),
  ];
  const update = {
    ...(!contact.assignedTo && owner ? { assignedTo: owner } : {}),
    ...(fields.length ? { customFields: fields } : {}),
  };
  if (Object.keys(update).length) await ghl("PUT", `/contacts/${id}`, update);

  const params = new URLSearchParams({
    location_id: serverEnv.ghlLocationId,
    pipeline_id: pipeline.id,
    contact_id: id,
    status: "open",
  });
  const { opportunities } = await ghl<{ opportunities: { id: string; pipelineStageId?: string }[] }>(
    "GET",
    `/opportunities/search?${params}`,
  );
  const { reuseFrom } = pipeline;
  const open = reuseFrom
    ? opportunities.find((o) => o.pipelineStageId && reuseFrom.includes(o.pipelineStageId))
    : opportunities[0];
  if (open) {
    await ghl("PUT", `/opportunities/${open.id}`, {
      pipelineStageId: pipeline.stageNew,
      ...(reuseFrom ? { name: cardName } : {}),
    });
  } else {
    try {
      await ghl("POST", "/opportunities/", {
        locationId: serverEnv.ghlLocationId,
        pipelineId: pipeline.id,
        pipelineStageId: pipeline.stageNew,
        contactId: id,
        ...(owner ? { assignedTo: owner } : {}),
        name: cardName,
        status: "open",
      });
    } catch (err) {
      // GHL refuses a second card when "Allow duplicate opportunities" is off: bring back the one it has instead.
      if (isRetriable(err) || !opportunities[0]) throw err;
      await ghl("PUT", `/opportunities/${opportunities[0].id}`, { pipelineStageId: pipeline.stageNew, name: cardName });
    }
  }

  await ghl("POST", `/contacts/${id}/notes`, { body: note });
  return true;
}

/** Contact form to General Inquiries. Never throws. True when GHL has the message; otherwise it's being retried in the background, or logged. */
export const sendInquiry = (inquiry: InquiryInput) => {
  const { message, attribution = {}, ...input } = inquiry;
  return attempt("contact inquiry", inquiry, () =>
    send({
      ...input,
      attribution,
      source: "Website contact form",
      tag: TAGS.contactForm,
      pipeline: INQUIRY_PIPELINE,
      cardName: `${input.name.trim()}: website inquiry`,
      note: `Website contact form:\n\n${message}`,
    }),
  );
};

/**
 * Instant quote form to the repair pipeline. `prices` are what the widget showed from the CMS price list: any at all
 * and the card goes to Quote Shown with them in the note, none and it's a Quote Requested for staff to price.
 * Never throws; true as for sendInquiry.
 */
export const sendQuote = (quote: QuoteInput, prices: QuotePrice[] = []) => {
  const { deviceType, brand, model, issue, details, attribution = {}, ...input } = quote;
  const shown = prices.length > 0;
  return attempt("instant quote", quote, () =>
    send({
      ...input,
      attribution,
      source: "Website quote form",
      tag: shown ? TAGS.quoteShown : TAGS.quoteForm,
      // A repair that's already moved on, e.g. Booked, keeps its card and the quote gets its own.
      pipeline: {
        id: serverEnv.ghlPipelineId,
        stageNew: shown ? STAGE_QUOTE_SHOWN : STAGE_QUOTE_REQUESTED,
        reuseFrom: [serverEnv.ghlStageIntakeStarted, STAGE_QUOTE_REQUESTED, STAGE_QUOTE_SHOWN],
      },
      contactFields: {
        deviceType,
        brand,
        model: model.trim(),
        issue,
        problemDetails: details?.trim() ?? "",
        smsConsentAt: shopDateISO(),
      },
      leadStatus: shown ? LEAD_STATUS.quoteShown : LEAD_STATUS.quoteRequested,
      cardName: `${input.name.trim()}: ${brand} ${model.trim()} quote`,
      note: [
        "Website quote form:",
        "",
        `Device: ${deviceType}`,
        `Brand: ${brand}`,
        `Model: ${model.trim()}`,
        `Issue: ${issue}`,
        ...(shown ? ["", "Price shown on the website:", ...prices.map((p) => `- ${p.label}: ${p.price}`)] : []),
        ...(details?.trim() ? ["", details.trim()] : []),
        "",
        `SMS consent given via website quote form, ${new Date().toISOString()}, consent text ${CONSENT_VERSION}`,
      ].join("\n"),
    }),
  );
};

/** Trade-in form to Device Buyback. Never throws; true as for sendInquiry. */
export const sendTradeIn = (tradeIn: TradeInInput) => {
  const { deviceType, brand, model, condition, details, attribution = {}, ...input } = tradeIn;
  return attempt("trade-in", tradeIn, () =>
    send({
      ...input,
      attribution,
      source: "Website trade-in form",
      tag: TAGS.tradeInForm,
      pipeline: BUYBACK_PIPELINE,
      cardName: `${input.name.trim()}: ${brand} ${model.trim()} buyback`,
      note: [
        "Website trade-in form:",
        "",
        `Device: ${deviceType}`,
        `Brand: ${brand}`,
        `Model: ${model.trim()}`,
        `Condition: ${condition}`,
        ...(details?.trim() ? ["", details.trim()] : []),
      ].join("\n"),
    }),
  );
};

const yesNo = (v: boolean | null) => (v ? "yes" : "no");

/** Tags for the availability result: each provider found, or "no coverage", or "couldn't check". */
function availabilityTags(a: AvailabilityResult): string[] {
  if (a.status === "unknown") return [INTERNET_AVAILABILITY_TAGS.unknown];
  if (a.status === "none") return [INTERNET_AVAILABILITY_TAGS.none];
  return [
    ...(a.spectrum ? [INTERNET_AVAILABILITY_TAGS.spectrum] : []),
    ...(a.att ? [INTERNET_AVAILABILITY_TAGS.att] : []),
    ...(a.attFiber ? [INTERNET_AVAILABILITY_TAGS.attFiber] : []),
  ];
}

/** The availability line in the lead note. */
const availabilityNote = (a: AvailabilityResult) =>
  a.status === "unknown"
    ? "Availability check: couldn't check this address automatically. Please check it by hand."
    : `Availability check (FCC map data for the area, confirm on the call): Spectrum ${yesNo(a.spectrum)}, AT&T ${yesNo(a.att)}${a.attFiber ? " (Fiber)" : ""}`;

/**
 * Home internet address check to Home Internet Leads. Never throws; true as for sendInquiry. The availability
 * result comes from the form (it checked after the address step); if it's missing the server checks now.
 */
export const sendInternet = async (lead: InternetInput) => {
  const { street, unit, city, state, zip, homeType, situation, timing, currentProvider, referredBy, availability, attribution = {}, ...input } = lead;
  const address1 = [street.trim(), unit?.trim()].filter(Boolean).join(", ");
  const full = `${address1}, ${city.trim()}, ${state.toUpperCase()} ${zip}`;
  const result = availability ?? (await checkAvailability({ street, city, state, zip }));
  return attempt("home internet", lead, () =>
    send({
      ...input,
      attribution,
      source: "Website home internet form",
      tag: TAGS.internetForm,
      extraTags: availabilityTags(result),
      pipeline: INTERNET_PIPELINE,
      address: { address1, city: city.trim(), state: state.toUpperCase(), postalCode: zip },
      contactFields: {
        homeType: INTERNET_OPTIONS.homeType[homeType],
        internetNeed: INTERNET_OPTIONS.internetNeed[situation],
        internetTiming: INTERNET_OPTIONS.internetTiming[timing],
        currentProvider: currentProvider?.trim() ?? "",
        smsConsentAt: shopDateISO(),
      },
      cardName: `${input.name.trim()}: home internet, ${zip}`,
      note: [
        "Website home internet form:",
        "",
        `Address: ${full}`,
        `Home: ${homeType}`,
        `Need: ${situation}`,
        `Timing: ${timing}`,
        ...(currentProvider?.trim() ? [`Current provider: ${currentProvider.trim()}`] : []),
        `Referred by: ${referredBy?.trim() || "not given"}`,
        "",
        availabilityNote(result),
        "",
        `SMS consent given via website home internet form, ${new Date().toISOString()}, consent text ${CONSENT_VERSION}`,
      ].join("\n"),
    }),
  );
};

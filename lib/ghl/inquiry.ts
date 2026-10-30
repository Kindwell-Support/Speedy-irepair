import "server-only";
import { leadSourceFor, type Attribution } from "@/lib/attribution";
import { serverEnv } from "@/lib/env.server";
import { ghl, toE164 } from "@/lib/ghl/client";
import { BUYBACK_PIPELINE, FIELD_IDS, INQUIRY_PIPELINE, LOCATION, TAGS } from "@/lib/ghl/fields";
import { ownerForUpsert, pickOwner } from "@/lib/ghl/owner";
import { attempt } from "@/lib/ghl/retry";
import type { TradeInInput } from "@/lib/forms/schemas";

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
  email: string;
  phone?: string;
  attribution: Attribution;
  source: string;
  tag: string;
  pipeline: { id: string; stageNew: string };
  cardName: string;
  note: string;
}

/**
 * A website form to GHL. Name, email and phone go on the contact; what was asked goes in a contact note, because
 * no custom field fits it and the Repair Intake fields belong to repairs. A contact has one open card in the form's
 * pipeline, and a repeat submission moves it back to the first stage. Every step before the note is safe to repeat
 * and the note comes last, so a retry can't post it twice.
 */
async function send({ name, email, phone, attribution, source, tag, pipeline, cardName, note }: FormLead) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const customFields = [
    { id: FIELD_IDS.location, field_value: LOCATION },
    { id: FIELD_IDS.utmSource, field_value: attribution.utmSource },
    { id: FIELD_IDS.utmMedium, field_value: attribution.utmMedium },
    { id: FIELD_IDS.utmCampaign, field_value: attribution.utmCampaign },
    { id: FIELD_IDS.landingPage, field_value: attribution.landingPage },
  ].filter((f) => f.field_value);

  const upserted = await ghl<{ contact: { id: string } }>("POST", "/contacts/upsert", {
    locationId: serverEnv.ghlLocationId,
    firstName,
    ...(rest.length ? { lastName: rest.join(" ") } : {}),
    email,
    ...(phone ? { phone: toE164(phone) } : {}),
    source,
    customFields,
    ...(await ownerForUpsert({ email })),
  });
  const id = upserted.contact.id;

  await ghl("POST", `/contacts/${id}/tags`, { tags: [tag] });

  // First touch, as on /repair: a Lead Source or owner the contact already has is left alone.
  const { contact } = await ghl<{ contact: Contact }>("GET", `/contacts/${id}`);
  const owner = contact.assignedTo || pickOwner();
  const update = {
    ...(!contact.assignedTo && owner ? { assignedTo: owner } : {}),
    ...(!contact.customFields?.some((f) => f.id === FIELD_IDS.leadSource && f.value)
      ? { customFields: [{ id: FIELD_IDS.leadSource, field_value: leadSourceFor(attribution) }] }
      : {}),
  };
  if (Object.keys(update).length) await ghl("PUT", `/contacts/${id}`, update);

  const params = new URLSearchParams({
    location_id: serverEnv.ghlLocationId,
    pipeline_id: pipeline.id,
    contact_id: id,
    status: "open",
  });
  const { opportunities } = await ghl<{ opportunities: { id: string }[] }>(
    "GET",
    `/opportunities/search?${params}`,
  );
  if (opportunities[0]) {
    await ghl("PUT", `/opportunities/${opportunities[0].id}`, { pipelineStageId: pipeline.stageNew });
  } else {
    await ghl("POST", "/opportunities/", {
      locationId: serverEnv.ghlLocationId,
      pipelineId: pipeline.id,
      pipelineStageId: pipeline.stageNew,
      contactId: id,
      ...(owner ? { assignedTo: owner } : {}),
      name: cardName,
      status: "open",
    });
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

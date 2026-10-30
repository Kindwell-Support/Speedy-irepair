import "server-only";
import { leadSourceFor, type Attribution } from "@/lib/attribution";
import { serverEnv } from "@/lib/env.server";
import { ghl, toE164 } from "@/lib/ghl/client";
import { FIELD_IDS, INQUIRY_PIPELINE, LOCATION, TAGS } from "@/lib/ghl/fields";
import { ownerForUpsert, pickOwner } from "@/lib/ghl/owner";
import { attempt } from "@/lib/ghl/retry";

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

/**
 * Contact form to GHL. Name, email and phone go on the contact; the message goes in a contact note, because no
 * custom field fits it and Problem Details belongs to repairs. A contact has one open card in General Inquiries,
 * and a repeat message moves it back to New. Every step before the note is safe to repeat and the note comes last,
 * so a retry can't post it twice.
 */
async function send({ name, email, phone, message, attribution = {} }: InquiryInput) {
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
    source: "Website contact form",
    customFields,
    ...(await ownerForUpsert({ email })),
  });
  const id = upserted.contact.id;

  await ghl("POST", `/contacts/${id}/tags`, { tags: [TAGS.contactForm] });

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
    pipeline_id: INQUIRY_PIPELINE.id,
    contact_id: id,
    status: "open",
  });
  const { opportunities } = await ghl<{ opportunities: { id: string }[] }>(
    "GET",
    `/opportunities/search?${params}`,
  );
  if (opportunities[0]) {
    await ghl("PUT", `/opportunities/${opportunities[0].id}`, {
      pipelineStageId: INQUIRY_PIPELINE.stageNew,
    });
  } else {
    await ghl("POST", "/opportunities/", {
      locationId: serverEnv.ghlLocationId,
      pipelineId: INQUIRY_PIPELINE.id,
      pipelineStageId: INQUIRY_PIPELINE.stageNew,
      contactId: id,
      ...(owner ? { assignedTo: owner } : {}),
      name: `${name.trim()}: website inquiry`,
      status: "open",
    });
  }

  await ghl("POST", `/contacts/${id}/notes`, { body: `Website contact form:\n\n${message}` });
  return true;
}

/** Never throws. True when GHL has the message; otherwise it's being retried in the background, or logged. */
export const sendInquiry = (input: InquiryInput) =>
  attempt("contact inquiry", input, () => send(input));

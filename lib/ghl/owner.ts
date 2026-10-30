import "server-only";
import { serverEnv } from "@/lib/env.server";
import { ghl } from "@/lib/ghl/client";

/**
 * A new lead's owner: one of GHL_OWNER_USER_IDS, chosen at random so a team shares leads evenly over time.
 * Undefined when none are set, and leads are then left unassigned.
 */
export function pickOwner(): string | undefined {
  const ids = serverEnv.ghlOwnerUserIds;
  return ids[Math.floor(Math.random() * ids.length)];
}

/**
 * The owner to send with a contact upsert, so a new contact has one before any workflow sees it. Empty when the
 * existing contact already has an owner (the upsert would replace it) or the lookup fails (ensureOwner catches up).
 */
export async function ownerForUpsert(match: { email: string } | { number: string }) {
  const owner = pickOwner();
  if (!owner) return {};
  try {
    const params = new URLSearchParams({ locationId: serverEnv.ghlLocationId, ...match });
    const { contact } = await ghl<{ contact?: { assignedTo?: string | null } | null }>(
      "GET",
      `/contacts/search/duplicate?${params}`,
    );
    return contact?.assignedTo ? {} : { assignedTo: owner };
  } catch {
    return {};
  }
}

/** The contact's owner. One it already has is kept; otherwise one is picked and assigned. */
export async function ensureOwner(contactId: string): Promise<string | undefined> {
  const { contact } = await ghl<{ contact: { assignedTo?: string | null } }>("GET", `/contacts/${contactId}`);
  if (contact.assignedTo) return contact.assignedTo;
  const owner = pickOwner();
  if (owner) await ghl("PUT", `/contacts/${contactId}`, { assignedTo: owner });
  return owner;
}

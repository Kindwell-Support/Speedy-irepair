import "server-only";
import type {
  CompleteInput,
  IntakeField,
  IntakeResult,
  Slot,
  StartInput,
} from "@/lib/repair-schemas";
import type { IntakeSession } from "./session";

export type { CompleteInput, IntakeField, IntakeResult, IntakeSession, Slot, StartInput };

/**
 * The backend behind /repair. Route handlers (app/api/repair/*) talk to this interface only, through the `booking`
 * export in lib/booking/index.ts: GoHighLevel when it's configured, the mock otherwise.
 * Server-only: the widget reaches it through the API routes, never by import.
 *
 * Nothing here blocks the customer on a CRM failure: startIntake, updateField and completeIntake log, retry in the
 * background and carry on. The only errors they surface are a slot that's been taken (SlotUnavailableError).
 */
export interface BookingProvider {
  /** Step 2: contact, consent and opportunity. Null when the CRM couldn't be reached (it's retried). */
  startIntake(input: StartInput): Promise<IntakeSession | null>;
  /** Steps 3–5: writes one answer to the contact as soon as it's chosen. */
  updateField(session: IntakeSession, field: IntakeField, value: string): Promise<void>;
  /** Free slots for the next BOOKING_WINDOW_DAYS, keyed by shop date. Throws when they can't be loaded. */
  getFreeSlots(): Promise<Record<string, Slot[]>>;
  /** Step 7: details, tags, and the appointment or "we'll call you". Throws SlotUnavailableError when the slot has gone. */
  completeIntake(session: IntakeSession | null, input: CompleteInput): Promise<IntakeResult>;
}

/** Thrown by completeIntake when the chosen slot is no longer free; the route answers 409. */
export class SlotUnavailableError extends Error {
  constructor() {
    super("That time is no longer available.");
    this.name = "SlotUnavailableError";
  }
}

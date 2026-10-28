import "server-only";
import type { BookingInput, BookingResult, LeadInput, Slot } from "@/lib/repair-schemas";

export type { BookingInput, BookingResult, LeadInput, Slot };

/**
 * The booking backend behind /repair. Route handlers (app/api/repair/*) talk to this interface only, through the
 * `booking` export in lib/booking/index.ts, so swapping the mock for GoHighLevel is a one-line change there.
 * Server-only: the widget reaches it through the API routes, never by import.
 */
export interface BookingProvider {
  /** Every slot on a YYYY-MM-DD date (shop time), taken ones marked unavailable. [] when the shop is closed. */
  getAvailableSlots(dateISO: string): Promise<Slot[]>;
  /** Records the visitor as a lead once they've given contact details, before they pick a time. */
  createLead(data: LeadInput): Promise<{ leadId: string }>;
  /** Books the slot against the lead. Throws SlotUnavailableError if the slot has gone. */
  completeBooking(data: BookingInput): Promise<BookingResult>;
}

/** Thrown by completeBooking when the chosen slot is no longer free; the route answers 409. */
export class SlotUnavailableError extends Error {
  constructor() {
    super("That time is no longer available.");
    this.name = "SlotUnavailableError";
  }
}

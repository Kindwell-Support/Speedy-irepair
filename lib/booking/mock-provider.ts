import "server-only";
import { randomUUID } from "node:crypto";
import {
  BOOKING_WINDOW_DAYS,
  addDaysISO,
  shopDateISO,
  shopTimeToUtc,
  weekdayOf,
} from "@/lib/repair-time";
import { SlotUnavailableError, type BookingProvider, type Slot } from "./provider";

/**
 * Stub backend for local development without GHL credentials: no CRM, no calendar. 45-minute slots Monday–Saturday,
 * first at 10:00 and last starting at 17:15 shop time at the latest, Sundays closed, past times today dropped. About
 * 1 in 5 slots is taken; the pick is seeded by date and time so a day looks the same on every load. Leads and
 * bookings are only logged.
 */
const SLOT_MINUTES = 45;
const FIRST_START = 10 * 60; // 10:00
const LAST_START = 17 * 60 + 15; // 17:15
const TAKEN_RATE = 0.2;
const DELAY_MS = 400;

const wait = () => new Promise((r) => setTimeout(r, DELAY_MS));
const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** FNV-1a → [0, 1): a stable "random" number per key. */
function seeded(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
  return (h >>> 0) / 0x100000000;
}

/** Free slots only, like GHL's free-slots endpoint. */
function slotsFor(dateISO: string, now = Date.now()): Slot[] {
  if (weekdayOf(dateISO) === 0 || dateISO < shopDateISO(new Date(now))) return [];
  const slots: Slot[] = [];
  for (let m = FIRST_START; m <= LAST_START; m += SLOT_MINUTES) {
    const start = shopTimeToUtc(dateISO, hhmm(m));
    if (start.getTime() <= now || seeded(`${dateISO}T${hhmm(m)}`) < TAKEN_RATE) continue;
    slots.push({
      start: start.toISOString(),
      end: new Date(start.getTime() + SLOT_MINUTES * 60_000).toISOString(),
      available: true,
    });
  }
  return slots;
}

export const mockProvider: BookingProvider = {
  async startIntake(input) {
    await wait();
    const session = {
      contactId: `mock-contact-${randomUUID()}`,
      opportunityId: `mock-opp-${randomUUID()}`,
    };
    console.log("[booking:mock] startIntake", { ...session, ...input });
    return session;
  },

  async updateField(session, field, value) {
    console.log("[booking:mock] updateField", { contactId: session.contactId, field, value });
  },

  async getFreeSlots() {
    await wait();
    const today = shopDateISO();
    const days: Record<string, Slot[]> = {};
    for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
      const date = addDaysISO(today, i);
      const slots = slotsFor(date);
      if (slots.length) days[date] = slots;
    }
    return days;
  },

  async completeIntake(session, input) {
    await wait();
    let appointment = null;
    if (input.slotStart) {
      const start = new Date(input.slotStart).toISOString();
      const slot = slotsFor(shopDateISO(new Date(start))).find((s) => s.start === start);
      if (!slot) throw new SlotUnavailableError();
      appointment = { start: slot.start, end: slot.end };
    }
    const reference = appointment ? `mock-booking-${randomUUID()}` : null;
    console.log("[booking:mock] completeIntake", { session, reference, ...input });
    return { reference, appointment };
  },
};

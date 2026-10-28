import "server-only";
import { randomUUID } from "node:crypto";
import { shopDateISO, shopTimeToUtc, weekdayOf } from "@/lib/repair-time";
import { SlotUnavailableError, type BookingProvider, type Slot } from "./provider";

/**
 * Stub backend: no CRM, no calendar. 45-minute slots Monday–Saturday, first at 10:00 and last starting at 17:15
 * shop time at the latest, Sundays closed, past times today dropped. About 1 in 5 slots shows as taken; the pick is
 * seeded by date and time so a day looks the same on every load. Leads and bookings are only logged.
 */
const SLOT_MINUTES = 45;
const FIRST_START = 10 * 60; // 10:00
const LAST_START = 17 * 60 + 15; // 17:15
const TAKEN_RATE = 0.2;
const DELAY_MS = 400;

const wait = () => new Promise((r) => setTimeout(r, DELAY_MS));
const hhmm = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** FNV-1a → [0, 1): a stable "random" number per key. */
function seeded(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
  return (h >>> 0) / 0x100000000;
}

function slotsFor(dateISO: string, now = Date.now()): Slot[] {
  if (weekdayOf(dateISO) === 0 || dateISO < shopDateISO(new Date(now))) return [];
  const slots: Slot[] = [];
  for (let m = FIRST_START; m <= LAST_START; m += SLOT_MINUTES) {
    const start = shopTimeToUtc(dateISO, hhmm(m));
    if (start.getTime() <= now) continue;
    slots.push({
      start: start.toISOString(),
      end: new Date(start.getTime() + SLOT_MINUTES * 60_000).toISOString(),
      available: seeded(`${dateISO}T${hhmm(m)}`) >= TAKEN_RATE,
    });
  }
  return slots;
}

export const mockProvider: BookingProvider = {
  async getAvailableSlots(dateISO) {
    await wait();
    return slotsFor(dateISO);
  },

  async createLead(data) {
    await wait();
    const leadId = `mock-lead-${randomUUID()}`;
    console.log("[booking:mock] createLead", { leadId, ...data });
    return { leadId };
  },

  async completeBooking(data) {
    await wait();
    const slot = slotsFor(data.date).find((s) => s.start === new Date(data.slotStart).toISOString());
    if (!slot?.available) throw new SlotUnavailableError();
    const bookingId = `mock-booking-${randomUUID()}`;
    console.log("[booking:mock] completeBooking", { bookingId, ...data });
    return { bookingId, leadId: data.leadId, start: slot.start, end: slot.end };
  },
};

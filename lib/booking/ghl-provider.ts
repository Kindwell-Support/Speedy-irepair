import "server-only";
import type { BookingProvider } from "./provider";

/**
 * GoHighLevel backend: PLACEHOLDER, not wired up. lib/booking/index.ts still exports the mock.
 *
 * When the GHL sub-account is ready:
 *   1. Set GHL_PRIVATE_TOKEN, GHL_LOCATION_ID, GHL_CALENDAR_ID, GHL_PIPELINE_ID and GHL_PIPELINE_STAGE_ID
 *      (see .env.example) and read them through a server-only env helper.
 *   2. Fill in the three methods below against the GHL API (https://services.leadconnectorhq.com,
 *      `Authorization: Bearer <private integration token>`, `Version` header).
 *   3. In lib/booking/index.ts, export `ghlProvider` as `booking` instead of `mockProvider`.
 * The widget and the API routes need no changes: they only see the BookingProvider interface.
 */
export const ghlProvider: BookingProvider = {
  async getAvailableSlots(_dateISO) {
    // TODO(GHL): GET /calendars/{GHL_CALENDAR_ID}/free-slots for that day (startDate/endDate as epoch ms,
    // timezone America/New_York). Map each free slot to { start, end, available: true }; GHL only returns free
    // slots, so taken ones simply don't appear. Return [] when the calendar has none.
    throw new Error("ghlProvider.getAvailableSlots is not implemented yet");
  },

  async createLead(_data) {
    // TODO(GHL): upsert the contact (POST /contacts/upsert with locationId, name, phone, email, and tags/custom
    // fields for device, brand, model and issue), then create an opportunity in GHL_PIPELINE_ID at
    // GHL_PIPELINE_STAGE_ID. Return the contact id as leadId.
    throw new Error("ghlProvider.createLead is not implemented yet");
  },

  async completeBooking(_data) {
    // TODO(GHL): POST /calendars/events/appointments with calendarId, locationId, contactId (= data.leadId),
    // startTime/endTime from data.slotStart, and a title such as "Screen repair: iPhone 15". Throw
    // SlotUnavailableError (./provider) when GHL rejects the slot as taken, so the route answers 409. Optionally
    // move the opportunity to a "Booked" stage. Return { bookingId: appointment id, leadId, start, end }.
    throw new Error("ghlProvider.completeBooking is not implemented yet");
  },
};

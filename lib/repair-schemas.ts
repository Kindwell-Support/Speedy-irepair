import { z } from "zod";
import { DEVICES, ISSUE_OTHER, issuesFor } from "./repair-catalog";
import { isDateISO } from "./repair-time";

/**
 * Repair intake contracts. The SAME schemas validate in the widget (components/repair-intake) and in the route
 * handlers (app/api/repair/*), and the types here are what lib/booking providers take and return. Client-safe:
 * the widget imports this file, never lib/booking.
 */

// Same rules as the site's other forms (lib/forms/schemas.ts), but all three are required to book.
const contactFields = {
  name: z.string().trim().min(1, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(32)
    .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").max(254),
};

const deviceFields = {
  device: z.enum(DEVICES, { error: "Choose your device" }),
  /** Catalog brand, or the visitor's own words when they picked "Other / not listed". */
  brand: z.string().trim().min(1, "Tell us the brand").max(80),
  model: z.string().trim().min(1, "Tell us the model").max(120),
  issue: z.string().trim().min(1, "Choose what's wrong").max(60),
  /** Required when the issue is "Other". */
  issueDetails: z.string().trim().max(500).optional(),
};

const dateISO = z.string().refine(isDateISO, "Use a YYYY-MM-DD date");

function checkIssue(v: { device: (typeof DEVICES)[number]; issue: string; issueDetails?: string }, ctx: z.RefinementCtx) {
  if (!issuesFor(v.device).includes(v.issue)) ctx.addIssue({ code: "custom", path: ["issue"], message: "Choose what's wrong" });
  if (v.issue === ISSUE_OTHER && !v.issueDetails) ctx.addIssue({ code: "custom", path: ["issueDetails"], message: "Tell us what's wrong" });
}

export const repairContactSchema = z.object(contactFields);

export const leadInputSchema = z.object({ ...deviceFields, ...contactFields }).superRefine(checkIssue);

export const bookingInputSchema = z
  .object({
    ...deviceFields,
    ...contactFields,
    leadId: z.string().trim().min(1).max(100),
    date: dateISO,
    /** ISO instant of the chosen slot, exactly as /api/repair/slots returned it. */
    slotStart: z.iso.datetime(),
  })
  .superRefine(checkIssue);

export const slotsQuerySchema = z.object({ date: dateISO });

export type RepairContact = z.infer<typeof repairContactSchema>;
export type LeadInput = z.infer<typeof leadInputSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;

export interface Slot {
  /** ISO instants (UTC). Format for display with formatSlotTime (lib/repair-time.ts). */
  start: string;
  end: string;
  available: boolean;
}

export interface BookingResult {
  bookingId: string;
  leadId: string;
  start: string;
  end: string;
}

type ApiError = { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
export type SlotsResponse = { ok: true; date: string; slots: Slot[] } | ApiError;
export type LeadResponse = { ok: true; leadId: string } | ApiError;
export type BookResponse = { ok: true; booking: BookingResult } | ApiError;

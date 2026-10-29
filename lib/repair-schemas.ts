import { z } from "zod";
import { ALL_ISSUES, DEVICES, ISSUE_OTHER, issuesFor } from "./repair-catalog";

/**
 * Repair intake contracts. The SAME schemas validate in the widget (components/repair-intake) and in the route
 * handlers (app/api/repair/*), and the types here are what lib/booking providers take and return. Client-safe:
 * the widget imports this file, never lib/booking.
 */

/** Shown under the phone field. Bump CONSENT_VERSION whenever the wording changes; it's recorded on the contact. */
export const CONSENT_TEXT =
  "By continuing you agree to receive texts about your repair. Reply STOP to opt out.";
export const CONSENT_VERSION = "v1";

const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(32)
  .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number");
/** Optional everywhere: "" means not given. */
const email = z
  .string()
  .trim()
  .max(254)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Please enter a valid email");
const name = z.string().trim().min(1, "Please enter your name").max(120);
const device = z.enum(DEVICES, { error: "Choose your device" });

const attribution = z.object({
  utmSource: z.string().trim().max(200).optional(),
  utmMedium: z.string().trim().max(200).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(2000).optional(),
  landingPage: z.string().trim().max(500).optional(),
});

const deviceFields = {
  device,
  /** Catalog brand, or the visitor's own words when they picked "Other / not listed". */
  brand: z.string().trim().min(1, "Tell us the brand").max(80),
  model: z.string().trim().min(1, "Tell us the model").max(120),
  issue: z.string().trim().min(1, "Choose what's wrong").max(60),
  /** Required when the issue is "Other". */
  issueDetails: z.string().trim().max(500).optional(),
};

function checkIssue(
  v: { device: (typeof DEVICES)[number]; issue: string; issueDetails?: string },
  ctx: z.RefinementCtx,
) {
  if (!issuesFor(v.device).includes(v.issue))
    ctx.addIssue({ code: "custom", path: ["issue"], message: "Choose what's wrong" });
  if (v.issue === ISSUE_OTHER && !v.issueDetails)
    ctx.addIssue({ code: "custom", path: ["issueDetails"], message: "Tell us what's wrong" });
}

/** Step 2 form (widget-side). */
export const phoneStepSchema = z.object({ phone, email });
/** Step 7 form (widget-side). */
export const detailsStepSchema = z.object({ name, email });

/** POST /api/repair/lead: step 2 creates the contact and opportunity. */
export const startInputSchema = z.object({
  device,
  phone,
  email,
  attribution: attribution.default({}),
});

export const INTAKE_FIELDS = ["brand", "model", "issue", "problemDetails"] as const;
export type IntakeField = (typeof INTAKE_FIELDS)[number];

/** PATCH /api/repair/lead: steps 3–5 write each answer as it's chosen. */
export const fieldInputSchema = z
  .object({
    token: z.string().min(1).max(1000),
    field: z.enum(INTAKE_FIELDS),
    value: z.string().trim().min(1).max(500),
  })
  .refine((v) => v.field !== "issue" || ALL_ISSUES.includes(v.value), {
    path: ["value"],
    message: "Unknown issue",
  });

/** POST /api/repair/book: step 7 sends every answer, so it can rebuild the lead if step 2 never reached GHL. */
export const completeInputSchema = z
  .object({
    ...deviceFields,
    phone,
    email,
    name,
    /** The signed session from step 2, or null when step 2 couldn't reach GHL. */
    token: z.string().max(1000).nullable(),
    /** ISO instant of the chosen slot exactly as /api/repair/slots returned it; null = "we'll call you". */
    slotStart: z.iso.datetime({ offset: true }).nullable(),
    attribution: attribution.default({}),
  })
  .superRefine(checkIssue);

export type StartInput = z.infer<typeof startInputSchema>;
export type CompleteInput = z.infer<typeof completeInputSchema>;

export interface Slot {
  /** ISO instants. Format for display with formatSlotTime (lib/repair-time.ts). */
  start: string;
  end: string;
  available: boolean;
}

/** What the customer sees on the confirmation. `appointment` is null when no time was booked. */
export interface IntakeResult {
  reference: string | null;
  appointment: { start: string; end: string } | null;
}

type ApiError = { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
/** token is null when GHL couldn't be reached; the widget carries on and step 7 creates the lead instead. */
export type StartResponse = { ok: true; token: string | null } | ApiError;
export type FieldResponse = { ok: true } | ApiError;
/** Every day in the booking window that has slots, keyed YYYY-MM-DD (shop time). */
export type SlotsResponse = { ok: true; days: Record<string, Slot[]> } | ApiError;
export type CompleteResponse = { ok: true; result: IntakeResult } | ApiError;

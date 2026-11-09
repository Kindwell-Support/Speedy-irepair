import { z } from "zod";
import { DEVICES } from "@/lib/repair-catalog";
import { attribution } from "@/lib/repair-schemas";
import { AVAILABILITY_STATUSES } from "@/lib/internet-availability/config";

/**
 * Shared form schemas: the SAME schema validates on the client (before submit) and the server
 * (app/api/forms/[type]/route.ts). Spec 4.1 F1, F2, F4, F5, plus the home internet address check.
 */
export const FORM_TYPES = ["quote", "tradein", "contact", "newsletter", "internet"] as const;
export type FormTypeKey = (typeof FORM_TYPES)[number];

const name = z.string().trim().min(1, "Please enter your name").max(120);
const email = z.string().trim().email("Please enter a valid email").max(254);
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(32)
  .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number");

/** Spam-protection fields sent with every form (see lib/forms/spam.ts). */
export const spamFields = z.object({
  /** Honeypot: must stay empty. Rendered visually hidden with tabIndex -1 and autocomplete off. */
  company_website: z.string().max(0).optional().default(""),
  /** ms timestamp when the form was first rendered/interacted with (minimum fill time check). */
  startedAt: z.number().int().positive(),
  /** Cloudflare Turnstile token, only when the Turnstile flag is on. */
  turnstileToken: z.string().optional(),
  pagePath: z.string().max(200).optional(),
});

/** F1 Instant Quote (spec 2.6, REQ-061..065): lead capture, no prices. */
export const quoteSchema = z.object({
  deviceType: z.enum(DEVICES, { error: "Choose your device type" }),
  // Any brand from lib/repair-catalog, or the visitor's own words for one it doesn't list.
  brand: z.string({ error: "Choose the brand" }).trim().min(1, "Choose the brand").max(120),
  model: z.string().trim().min(1, "Tell us the model, e.g. iPhone 13").max(120),
  issue: z.string({ error: "Choose what's wrong" }).trim().min(1, "Choose what's wrong").max(60),
  details: z.string().trim().max(2000).optional(),
  name,
  phone,
  email,
  attribution: attribution.optional(),
});

/** F5 Trade-in (spec 2.5, REQ-058): Device Type → Brand → Model → Condition → contact. */
export const tradeInSchema = z.object({
  deviceType: z.enum(["Phone", "Tablet", "Smartwatch", "Laptop", "Other"], { error: "Choose your device type" }),
  // Any brand from lib/trade-in-catalog, or the visitor's own words for one it doesn't list.
  brand: z.string({ error: "Choose the brand" }).trim().min(1, "Choose the brand").max(120),
  model: z.string().trim().min(1, "Tell us the model, e.g. Galaxy S22").max(120),
  condition: z.enum(["Like new", "Good", "Fair", "Cracked / damaged", "Not working"], { error: "Choose its condition" }),
  details: z.string().trim().max(2000).optional(),
  name,
  phone,
  email,
  attribution: attribution.optional(),
});

/** F4 Contact (REQ-100). */
export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  message: z.string().trim().min(1, "Please enter a message").max(4000),
  attribution: attribution.optional(),
});

export const HOME_TYPES = ["House", "Townhome", "Condo", "Apartment"] as const;
export const INTERNET_SITUATIONS = ["Moving in", "Switching provider", "New service"] as const;
export const INTERNET_TIMING = ["ASAP", "Within 2 weeks", "Within a month", "Just looking"] as const;

/** Home internet address check (/home-internet): where, what kind of home, when, and who to call back. */
export const internetSchema = z.object({
  street: z.string().trim().min(3, "Enter your street address").max(160),
  unit: z.string().trim().max(40).optional(),
  city: z.string().trim().min(1, "Enter your city").max(80),
  state: z.string().trim().length(2, "Use the 2-letter state, e.g. OH"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
  homeType: z.enum(HOME_TYPES, { error: "Choose your type of home" }),
  situation: z.enum(INTERNET_SITUATIONS, { error: "Choose what you need" }),
  timing: z.enum(INTERNET_TIMING, { error: "Choose when you need it" }),
  currentProvider: z.string().trim().max(80).optional(),
  name,
  phone,
  email,
  /** Who sent them our way, so the shop can credit that person for the sale. */
  referredBy: z.string().trim().max(80).optional(),
  attribution: attribution.optional(),
  /** The address check's result from /api/internet/availability, for the GHL tags. Missing = the server checks itself. */
  availability: z
    .object({
      status: z.enum(AVAILABILITY_STATUSES),
      spectrum: z.boolean().nullable(),
      att: z.boolean().nullable(),
      attFiber: z.boolean(),
    })
    .optional(),
});

/** F2 Newsletter (REQ-037). */
export const newsletterSchema = z.object({ email });

export const formSchemas = {
  quote: quoteSchema,
  tradein: tradeInSchema,
  contact: contactSchema,
  newsletter: newsletterSchema,
  internet: internetSchema,
} as const satisfies Record<FormTypeKey, z.ZodType>;

export type QuoteInput = z.infer<typeof quoteSchema>;
export type TradeInInput = z.infer<typeof tradeInSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type InternetInput = z.infer<typeof internetSchema>;
export type FormPayloads = {
  quote: QuoteInput;
  tradein: TradeInInput;
  contact: ContactInput;
  newsletter: NewsletterInput;
  internet: InternetInput;
};

/** API response shape for every form route. */
export type FormResponse =
  | { ok: true; stored: boolean; notified: boolean; staging: boolean }
  | { ok: false; error: "validation"; fieldErrors: Record<string, string[] | undefined> }
  | { ok: false; error: "spam" | "rate_limited" | "server" | "not_configured"; message: string };

export function isFormType(value: string): value is FormTypeKey {
  return (FORM_TYPES as readonly string[]).includes(value);
}

/**
 * GHL contact custom fields (folder "Repair Intake"), pipelines and the exact dropdown values the intake writes.
 * Every account-specific value (field, pipeline and stage IDs, the location label) comes from a GHL_* env var; see
 * .env.example. Check them, and every dropdown value below, against the live account with:
 *   npx tsx --env-file=.env.local scripts/ghl-check.ts
 * which also prints the account's IDs as ready-to-paste .env lines.
 * GHL silently drops a dropdown value it doesn't recognise, so a renamed option loses data without an error.
 * An empty var is caught by missingGhlVars (lib/env.server.ts): GHL calls refuse to run, the site stays up.
 * No secrets here (no server-only import), so the check script can load it outside Next.
 * process.env is read by literal name, as Next.js needs.
 */
export const FIELD_IDS = {
  deviceType: process.env.GHL_FIELD_DEVICE_TYPE ?? "",
  brand: process.env.GHL_FIELD_BRAND ?? "",
  model: process.env.GHL_FIELD_MODEL ?? "",
  issue: process.env.GHL_FIELD_ISSUE ?? "",
  problemDetails: process.env.GHL_FIELD_PROBLEM_DETAILS ?? "",
  location: process.env.GHL_FIELD_LOCATION ?? "",
  leadSource: process.env.GHL_FIELD_LEAD_SOURCE ?? "",
  leadStatus: process.env.GHL_FIELD_LEAD_STATUS ?? "",
  utmSource: process.env.GHL_FIELD_UTM_SOURCE ?? "",
  utmMedium: process.env.GHL_FIELD_UTM_MEDIUM ?? "",
  utmCampaign: process.env.GHL_FIELD_UTM_CAMPAIGN ?? "",
  landingPage: process.env.GHL_FIELD_LANDING_PAGE ?? "",
  homeType: process.env.GHL_FIELD_HOME_TYPE ?? "",
  internetNeed: process.env.GHL_FIELD_INTERNET_NEED ?? "",
  internetTiming: process.env.GHL_FIELD_INTERNET_TIMING ?? "",
  currentProvider: process.env.GHL_FIELD_CURRENT_PROVIDER ?? "",
} as const;
export type FieldName = keyof typeof FIELD_IDS;

/** fieldKey per field, for the check script. */
export const FIELD_KEYS: Record<FieldName, string> = {
  deviceType: "contact.device_type",
  brand: "contact.brand",
  model: "contact.model",
  issue: "contact.issue",
  problemDetails: "contact.problem_details",
  location: "contact.location",
  leadSource: "contact.lead_source",
  leadStatus: "contact.lead_status",
  utmSource: "contact.utm_source",
  utmMedium: "contact.utm_medium",
  utmCampaign: "contact.utm_campaign",
  landingPage: "contact.landing_page",
  homeType: "contact.home_type",
  internetNeed: "contact.internet_need",
  internetTiming: "contact.internet_timing",
  currentProvider: "contact.current_provider",
};

/** The env var holding a field's ID: contact.device_type is GHL_FIELD_DEVICE_TYPE. */
export const fieldEnvName = (fieldKey: string) =>
  `GHL_FIELD_${fieldKey.replace(/^contact\./, "").toUpperCase()}`;

/**
 * The /home-internet form's answers as GHL spells its dropdown options (capitalised differently). Update the
 * right-hand side if an option is renamed in GHL.
 */
export const INTERNET_OPTIONS = {
  homeType: { House: "House", Townhome: "Townhome", Condo: "Condo", Apartment: "Apartment" },
  internetNeed: { "Moving in": "Moving In", "Switching provider": "Switching Provider", "New service": "New Service" },
  internetTiming: {
    ASAP: "ASAP",
    "Within 2 weeks": "Within 2 Weeks",
    "Within a month": "Within A Month",
    "Just looking": "Just Looking",
  },
} as const;

/** The Location dropdown value, exactly as GHL spells it ("Akron – W Market St": note the en dash). */
export const LOCATION = process.env.GHL_LOCATION_LABEL ?? "";

/** The "General Inquiries" pipeline and its first stage. Separate from the repair pipeline in GHL_PIPELINE_ID. */
export const INQUIRY_PIPELINE = {
  id: process.env.GHL_INQUIRY_PIPELINE_ID ?? "",
  stageNew: process.env.GHL_INQUIRY_STAGE_NEW ?? "",
} as const;

/** The "Device Buyback" pipeline and its first stage ("New Inquiry"), for the /sell-your-device trade-in form. */
export const BUYBACK_PIPELINE = {
  id: process.env.GHL_BUYBACK_PIPELINE_ID ?? "",
  stageNew: process.env.GHL_BUYBACK_STAGE_NEW ?? "",
} as const;

/** The "Home Internet Leads" pipeline and its first stage ("New Lead"), for the /home-internet address check. */
export const INTERNET_PIPELINE = {
  id: process.env.GHL_INTERNET_PIPELINE_ID ?? "",
  stageNew: process.env.GHL_INTERNET_STAGE_NEW ?? "",
} as const;

/** Where /instant-quote leads wait in the repair pipeline. Comes before New Lead so its automations don't fire. */
export const STAGE_QUOTE_REQUESTED = process.env.GHL_STAGE_QUOTE_REQUESTED ?? "";

/**
 * Where /instant-quote leads go when the widget showed them a price from the CMS price list. Optional: unset, those
 * leads land in Quote Requested like the rest (so it's left out of GHL_FIELDS_ENV, which treats every var as required).
 */
export const STAGE_QUOTE_SHOWN = process.env.GHL_STAGE_QUOTE_SHOWN || STAGE_QUOTE_REQUESTED;

/** Every env-backed value in this file by its var name, for validation (lib/env.server.ts) and the check script. */
export const GHL_FIELDS_ENV: Record<string, string> = {
  ...Object.fromEntries(
    (Object.keys(FIELD_IDS) as FieldName[]).map((name) => [fieldEnvName(FIELD_KEYS[name]), FIELD_IDS[name]]),
  ),
  GHL_LOCATION_LABEL: LOCATION,
  GHL_STAGE_QUOTE_REQUESTED: STAGE_QUOTE_REQUESTED,
  GHL_INQUIRY_PIPELINE_ID: INQUIRY_PIPELINE.id,
  GHL_INQUIRY_STAGE_NEW: INQUIRY_PIPELINE.stageNew,
  GHL_BUYBACK_PIPELINE_ID: BUYBACK_PIPELINE.id,
  GHL_BUYBACK_STAGE_NEW: BUYBACK_PIPELINE.stageNew,
  GHL_INTERNET_PIPELINE_ID: INTERNET_PIPELINE.id,
  GHL_INTERNET_STAGE_NEW: INTERNET_PIPELINE.stageNew,
};

export const LEAD_STATUS = {
  intakeStarted: "Intake Started",
  submitted: "Submitted",
  booked: "Booked",
  quoteRequested: "Quote Requested",
  quoteShown: "Quote Shown",
} as const;

/** A repair under way. A new quote from one of these contacts leaves their Lead Status alone. */
export const LEAD_STATUS_ACTIVE: readonly string[] = [LEAD_STATUS.booked, "In Repair", "Ready For Pickup"];

export const TAGS = {
  started: "intake-started",
  complete: "intake-complete",
  contactForm: "contact-form",
  tradeInForm: "trade-in-form",
  quoteForm: "instant-quote-requested",
  quoteShown: "instant-quote-shown",
  internetForm: "home-internet-lead",
} as const;

/**
 * The home internet address check's result as tags on the lead (GHL creates a tag the first time it's used).
 * Each provider is tagged on its own, so staff see AT&T as a backup even when the visitor was shown Spectrum.
 */
export const INTERNET_AVAILABILITY_TAGS = {
  spectrum: "spectrum-available",
  att: "att-available",
  attFiber: "att-fiber-available",
  none: "no-coverage",
  unknown: "coverage-unknown",
} as const;

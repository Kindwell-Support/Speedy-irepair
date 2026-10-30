/**
 * GHL contact custom fields (folder "Repair Intake") and the exact dropdown values the intake writes. IDs were
 * resolved once from GET /locations/{locationId}/customFields by fieldKey. Re-check them, and every dropdown
 * value below, against the live account with:
 *   npx tsx --env-file=.env.local scripts/ghl-check.ts
 * GHL silently drops a dropdown value it doesn't recognise, so a renamed option loses data without an error.
 * No secrets here (no server-only import), so the check script can load it outside Next.
 */
export const FIELD_IDS = {
  deviceType: "YJ5KQKWaFP2k03ZzxDoZ", // contact.device_type
  brand: "WwQz6RuR0UzhxN9pit2f", // contact.brand
  model: "joyGZzBZJk77Cai7lFi7", // contact.model
  issue: "4AJRI71bxLsMJgn91NxF", // contact.issue
  problemDetails: "mUjYyMqauEaxSqWARVKF", // contact.problem_details
  location: "evfI3Uq1it2v8pJhzMDX", // contact.location
  leadSource: "bqA7bXAO9ndmmKw3rltJ", // contact.lead_source
  leadStatus: "uJgKRFQzTmeSV26BopMs", // contact.lead_status
  smsConsentAt: "ZY2YInaxgJPNdh6eOCjb", // contact.sms_consent_at
  utmSource: "OufhjqD0baD4veivhGtg", // contact.utm_source
  utmMedium: "S5Tf2T2R6Ym5SNCjVPQ7", // contact.utm_medium
  utmCampaign: "98PFuZNB37j3T8Sv0OYY", // contact.utm_campaign
  landingPage: "wQmTEmVJ2r7BYMEdt6Lu", // contact.landing_page
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
  smsConsentAt: "contact.sms_consent_at",
  utmSource: "contact.utm_source",
  utmMedium: "contact.utm_medium",
  utmCampaign: "contact.utm_campaign",
  landingPage: "contact.landing_page",
};

/** Note the en dash (–). */
export const LOCATION = "Akron – W Market St";

/** The "General Inquiries" pipeline and its first stage. Separate from the repair pipeline in GHL_PIPELINE_ID. */
export const INQUIRY_PIPELINE = {
  id: "sxdmtq4VLDEo1ohQgZBY",
  stageNew: "7eda428c-5b73-4014-a3e7-ba33c2b90413",
} as const;

export const LEAD_STATUS = {
  intakeStarted: "Intake Started",
  submitted: "Submitted",
  booked: "Booked",
} as const;

export const TAGS = {
  started: "intake-started",
  complete: "intake-complete",
  contactForm: "contact-form",
} as const;

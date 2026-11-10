import "server-only";
import { GHL_FIELDS_ENV } from "@/lib/ghl/fields";

/** Server-only secrets. Importing this file from a client component fails the build (server-only). */
export const serverEnv = {
  sanityReadToken: process.env.SANITY_API_READ_TOKEN ?? "",
  sanityWriteToken: process.env.SANITY_API_WRITE_TOKEN ?? "",
  sanityRevalidateSecret: process.env.SANITY_REVALIDATE_SECRET ?? "",
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-10",
  /** Second key for checkout: Add to Cart only appears when this is "true" AND the Shopify vars are set. */
  shopCheckoutEnabled: process.env.SHOP_CHECKOUT_ENABLED === "true",
  formWebhookUrl: process.env.FORM_WEBHOOK_URL ?? "",
  formWebhookSecret: process.env.FORM_WEBHOOK_SECRET ?? "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  formsTurnstileEnabled: process.env.FORMS_TURNSTILE_ENABLED === "true",
  ghlApiToken: process.env.GHL_API_TOKEN ?? "",
  ghlLocationId: process.env.GHL_LOCATION_ID ?? "",
  ghlCalendarId: process.env.GHL_CALENDAR_ID ?? "",
  ghlPipelineId: process.env.GHL_PIPELINE_ID ?? "",
  ghlStageIntakeStarted: process.env.GHL_STAGE_INTAKE_STARTED ?? "",
  ghlStageNewLead: process.env.GHL_STAGE_NEW_LEAD ?? "",
  ghlStageBooked: process.env.GHL_STAGE_BOOKED ?? "",
  /** Comma-separated GHL user ids that new leads are assigned to; several share leads round robin. Optional. */
  ghlOwnerUserIds: (process.env.GHL_OWNER_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

/**
 * Every required GHL_* var that's empty: the core vars above plus the field, pipeline and stage IDs and location
 * label in lib/ghl/fields.ts. While any is missing, every GHL call fails with a logged GhlConfigError
 * (lib/ghl/client.ts) instead of sending incomplete data; the site itself stays up. GHL_OWNER_USER_IDS is optional,
 * and GHL_TIMEZONE falls back to America/New_York (lib/repair-time.ts).
 */
export const missingGhlVars: readonly string[] = Object.entries({
  GHL_API_TOKEN: serverEnv.ghlApiToken,
  GHL_LOCATION_ID: serverEnv.ghlLocationId,
  GHL_CALENDAR_ID: serverEnv.ghlCalendarId,
  GHL_PIPELINE_ID: serverEnv.ghlPipelineId,
  GHL_STAGE_INTAKE_STARTED: serverEnv.ghlStageIntakeStarted,
  GHL_STAGE_NEW_LEAD: serverEnv.ghlStageNewLead,
  GHL_STAGE_BOOKED: serverEnv.ghlStageBooked,
  ...GHL_FIELDS_ENV,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

/**
 * The core GHL vars set, meaning GHL is meant to be on. Without them /repair runs on the mock backend
 * (lib/booking/mock-provider.ts) and forms skip GHL. With them set but another required var missing, GHL stays
 * selected and its calls fail loudly (missingGhlVars), so a half-configured account never looks like the mock.
 */
export const isGhlConfigured = [
  serverEnv.ghlApiToken,
  serverEnv.ghlLocationId,
  serverEnv.ghlCalendarId,
  serverEnv.ghlPipelineId,
  serverEnv.ghlStageIntakeStarted,
  serverEnv.ghlStageNewLead,
  serverEnv.ghlStageBooked,
].every((v) => v.length > 0);

export const isShopifyConfigured =
  serverEnv.shopifyStoreDomain.length > 0 && serverEnv.shopifyStorefrontToken.length > 0;

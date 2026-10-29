import "server-only";

/** Server-only secrets. Importing this file from a client component fails the build (server-only). */
export const serverEnv = {
  sanityReadToken: process.env.SANITY_API_READ_TOKEN ?? "",
  sanityWriteToken: process.env.SANITY_API_WRITE_TOKEN ?? "",
  sanityRevalidateSecret: process.env.SANITY_REVALIDATE_SECRET ?? "",
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-10",
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
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

/** Every GHL var set. Without them /repair runs on the mock backend (lib/booking/mock-provider.ts). */
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

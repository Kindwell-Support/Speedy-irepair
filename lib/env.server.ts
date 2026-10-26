import "server-only";

/** Server-only secrets. Importing this file from a client component fails the build (server-only). */
export const serverEnv = {
  sanityReadToken: process.env.SANITY_API_READ_TOKEN ?? "",
  /** Contract name SANITY_WRITE_TOKEN (cms §5.2); SANITY_API_WRITE_TOKEN accepted as an alias. */
  sanityWriteToken: process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN ?? "",
  sanityRevalidateSecret: process.env.SANITY_REVALIDATE_SECRET ?? "",
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-10",
  formWebhookUrl: process.env.FORM_WEBHOOK_URL ?? "",
  formWebhookSecret: process.env.FORM_WEBHOOK_SECRET ?? "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  formsTurnstileEnabled: process.env.FORMS_TURNSTILE_ENABLED === "true",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export const isShopifyConfigured =
  serverEnv.shopifyStoreDomain.length > 0 && serverEnv.shopifyStorefrontToken.length > 0;

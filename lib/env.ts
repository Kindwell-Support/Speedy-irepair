/**
 * Environment contract. See docs/ENV.md and .env.example.
 * Public vars are referenced statically so Next.js can inline them in client bundles.
 * Server-only secrets live in lib/env.server.ts (never import that from a client component).
 */
export type SiteEnv = "staging" | "production";

export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  siteEnv: (process.env.NEXT_PUBLIC_SITE_ENV === "production" ? "production" : "staging") as SiteEnv,
  sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-10-01",
  googleMapsEmbedUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
} as const;

/** True only when NEXT_PUBLIC_SITE_ENV === "production". Everything else is noindex. */
export const isProductionSite = publicEnv.siteEnv === "production";

/** Sanity is "configured" once a project id exists. Otherwise the content layer serves fixtures. */
export const isSanityConfigured = publicEnv.sanityProjectId.length > 0;

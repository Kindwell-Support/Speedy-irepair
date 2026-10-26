import type { QueryParams } from "next-sanity";
import { sanityClient } from "@/lib/sanity/client";

/**
 * Adapter for the SEO deliverables (seo/schema/**), which import `client` from `@/sanity/lib/client`.
 * Wraps the Architect's read client (lib/sanity/client.ts). When Sanity is not configured it resolves
 * to null, so every SEO caller falls back to its seeded defaults (no network, no throw).
 */
interface FetchOptions {
  next?: { revalidate?: number | false; tags?: string[] };
}

export const client = {
  async fetch<T>(
    query: string,
    params: QueryParams = {},
    options: FetchOptions = {},
  ): Promise<T | null> {
    if (!sanityClient) return null;
    return sanityClient.fetch<T>(query, params, options);
  },
};

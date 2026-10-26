import type { QueryParams } from "next-sanity";
import { sanityClient } from "@/lib/sanity/client";
import { fixtureFetch } from "@/lib/sanity/fixture";

/**
 * Adapter for the SEO deliverables (seo/schema/**), which import `client` from `@/sanity/lib/client`.
 * Wraps the Architect's read client (lib/sanity/client.ts). When Sanity is not configured it runs the query
 * over the committed seed (FIXTURE MODE, lib/sanity/fixture.ts); missing fields still fall back to SEO defaults.
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
    if (!sanityClient) return fixtureFetch<T>(query, params);
    return sanityClient.fetch<T>(query, params, options);
  },
};

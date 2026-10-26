import "server-only";
import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { sanityClient } from "./client";
import { serverEnv } from "@/lib/env.server";

/** Default ISR window for Sanity-backed pages (seconds). On-demand revalidation via /api/revalidate. */
export const SANITY_REVALIDATE_SECONDS = 60;

/**
 * Fetch from Sanity with ISR tags; in draft mode uses the read token + drafts perspective (no cache).
 * Returns null when Sanity is not configured or the request fails, so callers fall back to fixtures.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  tags: string[] = [],
): Promise<T | null> {
  if (!sanityClient) return null;
  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    // draftMode() is unavailable outside a request scope (e.g. generateStaticParams, sitemap at build).
    isDraft = false;
  }
  try {
    if (isDraft && serverEnv.sanityReadToken) {
      return await sanityClient.fetch<T>(query, params, {
        perspective: "drafts",
        token: serverEnv.sanityReadToken,
        useCdn: false,
        stega: true,
        cache: "no-store",
      });
    }
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: SANITY_REVALIDATE_SECONDS, tags },
    });
  } catch (error) {
    console.error("[sanityFetch] failed, falling back to fixtures", error);
    return null;
  }
}

import type { Metadata } from "next";
import type { Seo } from "@/lib/sanity/types";
import { buildMetadata, routeSeo } from "@/lib/seo/metadata";
import type { RouteKey } from "@/lib/seo/content";

/**
 * Bridge: page-level `seo` from the content layer (lib/sanity) -> SEO lane's buildMetadata().
 * Fallback titles/descriptions come from lib/seo/content.ts ROUTES (SEO lane).
 * Staging noindex is enforced inside buildMetadata (env), never by CMS.
 */
export function pageMetadata(route: RouteKey, seo: Seo | null | undefined, path: string = route): Metadata {
  return buildMetadata({
    path,
    fallback: routeSeo(route),
    sanity: seo
      ? {
          metaTitle: seo.metaTitle ?? undefined,
          metaDescription: seo.metaDescription ?? undefined,
          canonicalOverride: seo.canonicalOverride ?? undefined,
          noindex: seo.noIndex ?? undefined,
          ogImageUrl: seo.ogImage?.isSanity ? `${seo.ogImage.src}?w=1200&h=630&fit=crop&auto=format` : undefined,
        }
      : null,
  });
}

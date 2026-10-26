import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { isIndexable } from "@/lib/seo/metadata";

/**
 * noindex layer 1 of 3 (DevOps). X-Robots-Tag header (next.config.ts) and meta robots
 * (app/layout.tsx, lib/seo/metadata.ts) are the other two.
 * Anything other than NEXT_PUBLIC_SITE_ENV=production (and VERCEL_ENV unset|production) => disallow
 * everything. isIndexable() from the SEO helper (gap G8: Vercel previews stay noindex).
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}

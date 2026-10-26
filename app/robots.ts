import type { MetadataRoute } from "next";
import { isProductionSite, publicEnv } from "@/lib/env";

/**
 * noindex layer 1 of 3 (DevOps). X-Robots-Tag header (next.config.ts) and meta robots
 * (app/layout.tsx, lib/seo/metadata.ts) are the other two.
 * Anything other than NEXT_PUBLIC_SITE_ENV=production => disallow everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}

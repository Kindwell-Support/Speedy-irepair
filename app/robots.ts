import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Every crawler may fetch every page, on every host. Hosts other than speedyirepair.com are kept out of search by
 * the X-Robots-Tag header in next.config.ts instead: a crawler only sees that header if robots.txt lets it fetch the
 * page, so a Disallow here would hide the noindex rather than enforce it. The sitemap is empty on non-production
 * builds (app/sitemap.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

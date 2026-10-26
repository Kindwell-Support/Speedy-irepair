/**
 * Next.js Metadata API helper. Use in each route's generateMetadata().
 *
 *   export async function generateMetadata(): Promise<Metadata> {
 *     const { seo } = await sanityFetch(PAGE_SEO_QUERY, { slug: 'home' });
 *     return buildMetadata({ path: '/', fallback: routeSeo('/'), sanity: seo });
 *   }
 */
import type { Metadata } from "next";
import { DEFAULT_SITE_SETTINGS, SITE_URL } from "./site";
import { ROUTES, type RouteKey, type RouteSeo } from "./content";

/**
 * Indexable ONLY when NEXT_PUBLIC_SITE_ENV === 'production' AND (if on Vercel) VERCEL_ENV === 'production'.
 * Every other combination (local, Vercel preview = staging, unset) => noindex. Safe by default.
 */
export function isIndexable(): boolean {
  const siteEnv = process.env.NEXT_PUBLIC_SITE_ENV;
  const vercelEnv = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined
  return siteEnv === "production" && (vercelEnv === undefined || vercelEnv === "production");
}

export interface SanitySeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string; // resolved via urlFor(seo.ogImage).width(1200).height(630).url()
  canonicalOverride?: string;
  noindex?: boolean;
}

export const routeSeo = (r: RouteKey): RouteSeo => ROUTES.find((x) => x.route === r)!;

export function buildMetadata(args: {
  path: string; // actual path, e.g. '/shop/iphone-12-64gb-unlocked'
  fallback: Pick<RouteSeo, "metaTitle" | "metaDescription">;
  sanity?: SanitySeoFields | null;
  ogType?: "website" | "article";
}): Metadata {
  const s = args.sanity ?? {};
  const title = s.metaTitle?.trim() || args.fallback.metaTitle;
  const description = s.metaDescription?.trim() || args.fallback.metaDescription;
  const canonical =
    s.canonicalOverride?.trim() || `${SITE_URL}${args.path === "/" ? "/" : args.path}`;
  const ogImage = s.ogImageUrl || DEFAULT_SITE_SETTINGS.defaultOgImageUrl;
  const index = isIndexable() && !s.noindex;

  return {
    metadataBase: new URL(SITE_URL),
    // `absolute` so the root layout's title.template never appends a second brand suffix.
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: args.ogType ?? "website",
      url: canonical,
      siteName: DEFAULT_SITE_SETTINGS.name,
      title,
      description,
      locale: "en_US",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: DEFAULT_SITE_SETTINGS.twitterHandle,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        }
      : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    other: {
      // Local signals (harmless meta; NAP must match GBP exactly)
      "geo.region": "US-OH",
      "geo.placename": "Akron",
    },
  };
}

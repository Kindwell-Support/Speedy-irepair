import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { isIndexable } from "@/lib/seo/metadata";
import { client } from "@/sanity/lib/client";
import { SITEMAP_DOCS_QUERY } from "@/sanity/lib/seoQueries"; // cms/adapters/seoQueries.ts

export const revalidate = 3600;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  sanityType?: string;
  slug?: string;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly", sanityType: "homePage" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly", sanityType: "servicesPage" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily", sanityType: "shopPage" },
  {
    path: "/schedule-repair",
    priority: 0.9,
    changeFrequency: "monthly",
    sanityType: "scheduleRepairPage",
  },
  {
    path: "/instant-quote",
    priority: 0.8,
    changeFrequency: "monthly",
    sanityType: "instantQuotePage",
  },
  {
    path: "/sell-your-device",
    priority: 0.8,
    changeFrequency: "monthly",
    sanityType: "sellYourDevicePage",
  },
  {
    path: "/home-internet",
    priority: 0.8,
    changeFrequency: "monthly",
    sanityType: "homeInternetPage",
  },
  { path: "/financing", priority: 0.7, changeFrequency: "monthly", sanityType: "financingPage" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly", sanityType: "faqPage" },
  {
    path: "/policies/shipping-return",
    priority: 0.3,
    changeFrequency: "yearly",
    sanityType: "policyPage",
    slug: "shipping-return",
  },
  {
    path: "/policies/privacy",
    priority: 0.2,
    changeFrequency: "yearly",
    sanityType: "policyPage",
    slug: "privacy",
  },
  {
    path: "/policies/terms",
    priority: 0.2,
    changeFrequency: "yearly",
    sanityType: "policyPage",
    slug: "terms",
  },
];

/** Products come from Shopify or Sanity per the Tech Architect's shop decision (OQ-09/OQ-12). */
async function getProductEntries(): Promise<{ handle: string; updatedAt?: string }[]> {
  try {
    // Sanity-catalog variant; for headless Shopify replace with a Storefront API query (products { handle updatedAt }).
    const rows = await client.fetch<{ handle: string; updatedAt?: string }[]>(
      `*[_type == "product" && defined(slug.current) && seo.noindex != true]{ "handle": slug.current, "updatedAt": _updatedAt }`,
    );
    return rows ?? [];
  } catch {
    return [];
  }
}

type DocRow = { _type: string; _updatedAt: string; noindex?: boolean | null; slug?: string | null };
const keyOf = (type: string, slug?: string | null) => (slug ? `${type}:${slug}` : type);

/** lastModified per doc + set of noindexed docs (dropped from the sitemap). */
async function getDocState(): Promise<{ updated: Record<string, string>; noindex: Set<string> }> {
  try {
    const types = [...new Set(STATIC_ROUTES.map((r) => r.sanityType).filter(Boolean))];
    // SITEMAP_DOCS_QUERY returns { _type, _updatedAt, noindex }; policy pages share one type, so we
    // also read slugs for policyPage with a tiny companion query.
    const [rows, policies] = await Promise.all([
      client.fetch<DocRow[]>(SITEMAP_DOCS_QUERY, { types }),
      client.fetch<DocRow[]>(
        `*[_type == "policyPage"]{ _type, _updatedAt, "noindex": seo.noindex, "slug": slug.current }`,
      ),
    ]);
    const all = [...(rows ?? []).filter((r) => r._type !== "policyPage"), ...(policies ?? [])];
    const updated: Record<string, string> = {};
    const noindex = new Set<string>();
    for (const r of all) {
      const k = keyOf(r._type, r.slug);
      if (r.noindex) noindex.add(k);
      else updated[k] = r._updatedAt;
    }
    return { updated, noindex };
  } catch {
    return { updated: {}, noindex: new Set() };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable()) return []; // staging/preview: empty sitemap
  const [{ updated, noindex }, products] = await Promise.all([getDocState(), getProductEntries()]);
  const now = new Date();
  const pages = STATIC_ROUTES.filter(
    (r) => !(r.sanityType && noindex.has(keyOf(r.sanityType, r.slug))),
  ).map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified:
      r.sanityType && updated[keyOf(r.sanityType, r.slug)]
        ? new Date(updated[keyOf(r.sanityType, r.slug)])
        : now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.handle}`, // only if R04 on-site PDP is built; otherwise drop this block
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...pages, ...productUrls];
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { isIndexable } from "@/lib/seo/metadata";
import { client } from "@/sanity/lib/client";
import { getCatalog } from "@/lib/shop";
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
  { path: "/about", priority: 0.6, changeFrequency: "monthly", sanityType: "aboutPage" },
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

/** Products from the CatalogProvider (headless Shopify). Fixture/placeholder catalog => no PDP URLs listed. */
async function getProductEntries(): Promise<{ handle: string; updatedAt?: string }[]> {
  try {
    const catalog = getCatalog();
    if (catalog.name !== "shopify") return [];
    const items = await catalog.listProducts({ first: 250 });
    return items.map((p) => ({ handle: p.handle }));
  } catch {
    return [];
  }
}

type DocRow = {
  _type: string;
  _updatedAt: string;
  noindex?: boolean | null;
  slug?: string | null;
  isPlaceholder?: boolean | null;
};
const keyOf = (type: string, slug?: string | null) => (slug ? `${type}:${slug}` : type);

/** lastModified per doc + set of excluded docs (seo.noindex or placeholder). CMS v1.1 (G1): rows carry `slug`. */
async function getDocState(): Promise<{ updated: Record<string, string>; noindex: Set<string> }> {
  try {
    const types = [...new Set(STATIC_ROUTES.map((r) => r.sanityType).filter(Boolean))];
    const rows = await client.fetch<DocRow[]>(
      SITEMAP_DOCS_QUERY,
      { types },
      { next: { tags: ["sitemap"] } },
    );
    const updated: Record<string, string> = {};
    const noindex = new Set<string>();
    for (const r of rows ?? []) {
      // Policy pages share one type; singletons ignore the slug.
      const k = keyOf(r._type, r._type === "policyPage" ? r.slug : null);
      if (r.noindex || r.isPlaceholder) noindex.add(k);
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
    url: `${SITE_URL}/shop/${p.handle}`, // on-site PDP (R04) confirmed: headless Shopify
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  return [...pages, ...productUrls];
}

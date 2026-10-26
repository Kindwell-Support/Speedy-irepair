/**
 * Sanity -> SeoData for lib/seo/routes.ts.
 * Uses ONLY the CMS adapter queries (cms/SCHEMA_CONTRACT.md v1.1 §6a; file cms/adapters/seoQueries.ts,
 * placed in the repo as sanity/lib/seoQueries.ts). Falls back to seeded defaults if Sanity is empty/unreachable.
 */
import { client } from "@/sanity/lib/client";
import {
  FAQ_PAGE_IDS,
  FAQ_QUERY,
  NAV_QUERY,
  REVIEWS_QUERY,
  SERVICES_QUERY,
  SETTINGS_QUERY,
  TEAM_QUERY,
} from "@/sanity/lib/seoQueries";
import { DEFAULT_SITE_SETTINGS, SITE_URL, type SiteSettings } from "./site";
import { defaultSeoData, type SeoData } from "./routes";
import { isIndexable } from "./metadata";
import type { FaqItem, ServiceSeo } from "./content";
import type { PersonInput, ReviewInput } from "./jsonld";

/** Recursively drop null/undefined (GROQ returns null for unset fields) so defaults are not overridden. */
export function stripNulls<T>(v: T): T {
  if (Array.isArray(v))
    return v.filter((x) => x !== null && x !== undefined).map(stripNulls) as unknown as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>))
      if (x !== null && x !== undefined) out[k] = stripNulls(x);
    return out as T;
  }
  return v;
}

type Placement = keyof typeof FAQ_PAGE_IDS;

/** Published page `intro` (contract v1.1 G4). Not in the adapter; tiny read-only projection by fixed singleton ids. */
const INTROS_QUERY = /* groq */ `*[_id in ["instantQuotePage", "scheduleRepairPage"]]{ _id, intro }`;

export async function getSeoData(): Promise<SeoData> {
  const includeDrafts = !isIndexable(); // flaggedForReview FAQs: staging only, never production FAQPage
  const fetchOpts = { next: { tags: ["seo"] } };
  const faqs = (p: Placement) =>
    client
      .fetch<FaqItem[] | null>(FAQ_QUERY, { pageId: FAQ_PAGE_IDS[p], includeDrafts }, fetchOpts)
      .then((r) => stripNulls(r ?? []));
  try {
    const [rawSettings, services, home, faq, svc, fin, hi, team, reviews, nav, intros] =
      await Promise.all([
        client.fetch<Partial<SiteSettings> | null>(SETTINGS_QUERY, {}, fetchOpts),
        client
          .fetch<ServiceSeo[] | null>(SERVICES_QUERY, {}, fetchOpts)
          .then((r) => stripNulls(r ?? [])),
        faqs("home"),
        faqs("faq"),
        faqs("services"),
        faqs("financing"),
        faqs("homeInternet"),
        client
          .fetch<PersonInput[] | null>(TEAM_QUERY, {}, fetchOpts)
          .then((r) => stripNulls(r ?? [])),
        // REVIEWS_QUERY already excludes isPlaceholder / source=="placeholder" / missing rating.
        // v1.1 (G2): rows carry `source`; markupEligibleReviews() keeps only source=="manual".
        client
          .fetch<ReviewInput[] | null>(REVIEWS_QUERY, {}, fetchOpts)
          .then((r) => stripNulls(r ?? [])),
        // v1.1 (G3): internal header links + CTA, in visible order.
        client
          .fetch<{ name?: string; path?: string }[] | null>(NAV_QUERY, {}, fetchOpts)
          .then((r) =>
            stripNulls(r ?? []).filter((x): x is { name: string; path: string } =>
              Boolean(x.name && x.path?.startsWith("/")),
            ),
          ),
        // v1.1 (G4): visible `intro` on instant-quote / schedule-repair = their Service schema description.
        client
          .fetch<{ _id: string; intro?: string | null }[] | null>(INTROS_QUERY, {}, fetchOpts)
          .then((r) => stripNulls(r ?? [])),
      ]);
    const s = rawSettings ? stripNulls(rawSettings) : null;
    const site: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...(s ?? {}), url: SITE_URL };
    // Suite (v1.1 G12): adapter returns street and `suite` (= address.unit) separately. When the settings doc
    // exists, the suite is exactly what the editor set (cleared => no suite); the "#27" default applies only
    // when Sanity is empty/unreachable. fullStreetAddress() never appends it twice.
    if (s) site.suite = s.suite?.trim() || undefined;
    // Hours: if the settings doc exists and the editor left `hours` empty, emit NO hours (UI shows "Hours coming soon").
    if (s && (!s.openingHours || s.openingHours.length === 0)) site.openingHours = undefined;
    // Never trust array fields that came back empty over seeded facts (sameAs etc.).
    if (s && (!s.sameAs || s.sameAs.length === 0)) site.sameAs = DEFAULT_SITE_SETTINGS.sameAs;
    const d = defaultSeoData(site);
    return {
      ...d,
      services: services.length ? services : d.services,
      homeFaqs: home.length ? home : d.homeFaqs,
      faqPageFaqs: faq.length ? faq : d.faqPageFaqs,
      // Draft fallbacks only on staging; production shows only editor-cleared FAQs.
      servicesFaqs: svc.length ? svc : includeDrafts ? d.servicesFaqs : [],
      financingFaqs: fin.length ? fin : includeDrafts ? d.financingFaqs : [],
      homeInternetFaqs: hi.length ? hi : includeDrafts ? d.homeInternetFaqs : [],
      team,
      reviews,
      nav: nav.length ? nav : d.nav,
      intros: {
        instantQuote: intros.find((x) => x._id === "instantQuotePage")?.intro?.trim() || undefined,
        scheduleRepair:
          intros.find((x) => x._id === "scheduleRepairPage")?.intro?.trim() || undefined,
      },
      // Google testimonials are rendered but NOT marked up (Google review-snippet policy). Pages set this
      // true only for first-party (source=="manual", collected on-site) reviews that they visibly render.
      reviewsRenderedOnPage: false,
    };
  } catch {
    return defaultSeoData(DEFAULT_SITE_SETTINGS);
  }
}

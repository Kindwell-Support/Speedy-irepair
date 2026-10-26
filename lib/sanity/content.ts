import "server-only";
import { cache } from "react";
import * as fx from "./fixtures";
import { sanityFetch } from "./fetch";
import * as q from "./queries";
import type {
  AboutPage,
  Announcement,
  Brand,
  Faq,
  LeadFlowPageCopy,
  FaqCategory,
  FaqPage,
  FinancingPage,
  HomeInternetPage,
  HomePage,
  HowItWorksStep,
  LlmsDocument,
  PolicyPage,
  PolicySlug,
  Promotion,
  QuotePage,
  SchedulePage,
  SellPage,
  Service,
  ServicesPage,
  ShopCategoryEditorial,
  ShopPage,
  SiteSettings,
  StepSet,
  TeamMember,
  Testimonial,
  ValueProp,
  OpeningHours,
  Weekday,
} from "./types";
import { isProductionSite } from "@/lib/env";

/**
 * CONTENT DATA-ACCESS LAYER. The only module pages/sections may use to read editorial content.
 * - Sanity configured (NEXT_PUBLIC_SANITY_PROJECT_ID set): GROQ from ./queries, ISR 60s + tags.
 * - Not configured / doc missing / request failed: typed fixtures from ./fixtures (spec-verbatim).
 * Swapping the source never changes these signatures (docs/CONTRACT_FRONTEND.md, CONTRACT_SANITY.md).
 */

/** True for plain JSON objects (not arrays, not null). */
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Back-fills a Sanity result from the fixture, key by key (deep for objects). null/undefined/"" and empty
 * arrays fall back, so a partially filled dataset renders fixture copy instead of holes. Keys that exist
 * only in the Sanity result are kept.
 */
export function mergeFallback<T>(data: unknown, fallback: T): T {
  if (data === null || data === undefined || data === "") return fallback;
  if (Array.isArray(data)) return (data.length === 0 && Array.isArray(fallback) ? fallback : data) as T;
  if (isObj(data) && isObj(fallback)) {
    const out: Record<string, unknown> = { ...fallback };
    for (const [k, v] of Object.entries(data)) out[k] = k in fallback ? mergeFallback(v, fallback[k]) : v;
    return out as T;
  }
  return data as T;
}

async function fromSanity<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  fallback: T,
): Promise<T> {
  const data = await sanityFetch<unknown>(query, params as never, tags);
  return mergeFallback<T>(data, fallback);
}

const byOrder = <T extends { order: number }>(a: T, b: T): number => a.order - b.order;
/** Give Sanity rows (already in reference/orderRank order) a stable `order`. */
const indexOrder = <T extends { order: number }>(rows: T[]): T[] => rows.map((r, i) => ({ ...r, order: i + 1 }));
/** contract §3.2 draft rule: flaggedForReview (→ isPlaceholder) items are hidden on production. */
const hideFlaggedOnProduction = <T extends { isPlaceholder?: boolean }>(rows: T[]): T[] =>
  isProductionSite ? rows.filter((r) => !r.isPlaceholder) : rows;

const GLOBAL_TAGS = [q.TAGS.siteSettings, q.TAGS.navigation];

// ---------- Global ----------
type HoursRow = { days?: Weekday[] | null; opens?: string | null; closes?: string | null; closed?: boolean | null };

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const raw = await sanityFetch<(SiteSettings & { business: { hoursRows?: HoursRow[] | null } }) | null>(
    q.siteSettingsQuery,
    {} as never,
    GLOBAL_TAGS,
  );
  const merged = mergeFallback<SiteSettings>(raw, fx.siteSettings);
  if (!raw?.business) return merged;
  // contract openingHours rows group days; the view model is one row per day. Empty => placeholder (never invented).
  const rows = raw.business.hoursRows ?? [];
  const hours: OpeningHours[] = rows.flatMap((r) =>
    (r.days ?? []).map((day) => ({ day, closed: !!r.closed, opens: r.closed ? null : r.opens ?? null, closes: r.closed ? null : r.closes ?? null })),
  );
  const { hoursRows: _hoursRows, ...business } = merged.business as SiteSettings["business"] & { hoursRows?: unknown };
  return { ...merged, business: { ...business, hours, hoursIsPlaceholder: hours.length === 0 } };
});

export const getAnnouncement = cache(
  (): Promise<Announcement | null> =>
    fromSanity<Announcement | null>(q.announcementQuery, {}, [q.TAGS.promotion], fx.announcement),
);

// ---------- Collections ----------
export const getServices = cache(
  async (): Promise<Service[]> =>
    hideFlaggedOnProduction(indexOrder(await fromSanity(q.servicesQuery, {}, [q.TAGS.service, q.TAGS.servicesPage], [...fx.services].sort(byOrder)))),
);

/** View-model FAQ "category" = the page whose FAQ list it is (contract: placement by page reference). */
const FAQ_PAGE: Record<FaqCategory, string> = {
  general: "faqPage",
  services: "servicesPage",
  financing: "financingPage",
  internet: "homeInternetPage",
};

export const getFaqs = cache(async (category: FaqCategory | null = null, pageId?: string): Promise<Faq[]> => {
  const fallback = fx.faqs.filter((f) => category === null || f.categories.includes(category)).sort(byOrder);
  const id = pageId ?? (category ? FAQ_PAGE[category] : null);
  const rows = id
    ? await fromSanity(q.faqsForPageQuery, { pageId: id }, [q.TAGS.faq, id], fallback)
    : await fromSanity(q.allFaqsQuery, {}, [q.TAGS.faq], fallback);
  return hideFlaggedOnProduction(indexOrder(rows));
});

/** contract §6: placeholder slots render "Reviews coming soon" (+ Leave a Review link), never invented copy or stars. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const rows = await fromSanity(q.testimonialsQuery, {}, [q.TAGS.testimonial], fx.testimonials);
  return rows.map((t) => (t.isPlaceholder ? { ...t, rating: null, text: t.text || "Reviews coming soon", author: t.author || "" } : t));
});

export const getTeamMembers = cache(
  async (): Promise<TeamMember[]> => indexOrder(await fromSanity(q.teamMembersQuery, {}, [q.TAGS.teamMember], fx.teamMembers)),
);

export const getBrands = cache(
  async (): Promise<Brand[]> => indexOrder(await fromSanity(q.brandsQuery, {}, [q.TAGS.brand], fx.brands)),
);

export const getValueProps = cache(
  async (): Promise<ValueProp[]> => indexOrder(await fromSanity(q.valuePropsQuery, {}, [q.TAGS.homePage], fx.valueProps)),
);

const STEP_PAGE: Partial<Record<StepSet, string>> = { home: "homePage", sell: "sellYourDevicePage", financing: "financingPage" };

export const getHowItWorksSteps = cache(async (set: StepSet): Promise<HowItWorksStep[]> => {
  const fallback = fx.howItWorksSteps.filter((s) => s.set === set).sort(byOrder);
  const pageId = STEP_PAGE[set];
  if (!pageId) return fallback;
  return indexOrder(await fromSanity(q.howItWorksStepsQuery, { pageId, set }, [pageId], fallback));
});

export const getPromotions = cache(
  async (): Promise<Promotion[]> => indexOrder(await fromSanity(q.promotionsQuery, {}, [q.TAGS.promotion], fx.promotions)),
);

export const getShopCategories = cache(
  (): Promise<ShopCategoryEditorial[]> =>
    fromSanity<ShopCategoryEditorial[]>(q.shopCategoriesQuery, {}, [q.TAGS.shopCollectionConfig, q.TAGS.shopPage], []).then(indexOrder),
);

// ---------- Page singletons (ids = contract §2) ----------
const singleton = <T>(id: string, fallback: T) =>
  cache((): Promise<T> => fromSanity(q.pageSingletonQuery, { type: id }, [id], fallback));

export const getHomePage = cache(async (): Promise<HomePage> => {
  const page = await fromSanity<HomePage & { heroPoster?: HomePage["hero"]["poster"] }>(q.homePageQuery, {}, [q.TAGS.homePage, q.TAGS.service], {
    ...fx.homePage,
    serviceCards: fx.serviceCards,
  });
  const { heroPoster, ...rest } = page;
  return {
    ...rest,
    hero: heroPoster ? { ...rest.hero, poster: heroPoster } : rest.hero,
    serviceCards: rest.serviceCards.length ? indexOrder(rest.serviceCards) : fx.serviceCards,
  };
});
export const getServicesPage = singleton<ServicesPage>("servicesPage", fx.servicesPage);
export const getShopPage = singleton<ShopPage>("shopPage", fx.shopPage);
export const getSellPage = singleton<SellPage>("sellYourDevicePage", fx.sellPage);
export const getQuotePage = singleton<QuotePage>("instantQuotePage", fx.quotePage);
/** Lead-flow copy (steps, options, states). Fixture until the CMS contract adds the fields (quoteConfig + page singletons). */
export const getLeadFlow = cache(async (kind: "quote" | "tradein"): Promise<LeadFlowPageCopy> =>
  kind === "quote" ? fx.quoteFlow : fx.tradeInFlow,
);
export const getSchedulePage = singleton<SchedulePage>("scheduleRepairPage", fx.schedulePage);
export const getFaqPage = singleton<FaqPage>("faqPage", fx.faqPage);
export const getAboutPage = singleton<AboutPage>("aboutPage", fx.aboutPage);
export const getFinancingPage = singleton<FinancingPage>("financingPage", fx.financingPage);
export const getHomeInternetPage = singleton<HomeInternetPage>("homeInternetPage", fx.homeInternetPage);

export const getPolicyPage = cache(
  (slug: PolicySlug): Promise<PolicyPage> =>
    fromSanity(q.policyPageQuery, { slug }, [q.TAGS.policyPage], fx.policyPages[slug]),
);

// ---------- GEO ----------
export const getLlmsDocument = cache(async (): Promise<LlmsDocument> => {
  const doc = await fromSanity<Partial<LlmsDocument>>(q.llmsDocumentQuery, {}, [q.TAGS.llmsContent, "llms"], fx.llmsDocument);
  return { llms: doc.llms || fx.llmsDocument.llms, llmsFull: doc.llmsFull || fx.llmsDocument.llmsFull };
});

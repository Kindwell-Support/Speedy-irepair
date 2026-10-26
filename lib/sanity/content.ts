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
} from "./types";

/**
 * CONTENT DATA-ACCESS LAYER. The only module pages/sections may use to read editorial content.
 * - Sanity configured (NEXT_PUBLIC_SANITY_PROJECT_ID set): GROQ from ./queries, ISR 60s + tags.
 * - Not configured / doc missing / request failed: typed fixtures from ./fixtures (spec-verbatim).
 * Swapping the source never changes these signatures (docs/CONTRACT_FRONTEND.md, CONTRACT_SANITY.md).
 */

async function fromSanity<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  fallback: T,
): Promise<T> {
  const data = await sanityFetch<T>(query, params as never, tags);
  if (data === null || data === undefined) return fallback;
  if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback)) return fallback;
  return data;
}

const byOrder = <T extends { order: number }>(a: T, b: T): number => a.order - b.order;

// ---------- Global ----------
export const getSiteSettings = cache(
  (): Promise<SiteSettings> => fromSanity(q.siteSettingsQuery, {}, [q.TAGS.siteSettings], fx.siteSettings),
);

export const getAnnouncement = cache(
  (): Promise<Announcement | null> =>
    fromSanity<Announcement | null>(q.announcementQuery, {}, [q.TAGS.announcement], fx.announcement),
);

// ---------- Collections ----------
export const getServices = cache(
  (): Promise<Service[]> => fromSanity(q.servicesQuery, {}, [q.TAGS.service], [...fx.services].sort(byOrder)),
);

export const getFaqs = cache(
  (category: FaqCategory | null = null): Promise<Faq[]> =>
    fromSanity(
      q.faqsQuery,
      { category },
      [q.TAGS.faq],
      fx.faqs.filter((f) => category === null || f.categories.includes(category)).sort(byOrder),
    ),
);

export const getTestimonials = cache(
  (): Promise<Testimonial[]> => fromSanity(q.testimonialsQuery, {}, [q.TAGS.testimonial], fx.testimonials),
);

export const getTeamMembers = cache(
  (): Promise<TeamMember[]> => fromSanity(q.teamMembersQuery, {}, [q.TAGS.teamMember], fx.teamMembers),
);

export const getBrands = cache(
  (): Promise<Brand[]> => fromSanity(q.brandsQuery, {}, [q.TAGS.brand], fx.brands),
);

export const getValueProps = cache(
  (): Promise<ValueProp[]> => fromSanity(q.valuePropsQuery, {}, [q.TAGS.valueProp], fx.valueProps),
);

export const getHowItWorksSteps = cache(
  (set: StepSet): Promise<HowItWorksStep[]> =>
    fromSanity(
      q.howItWorksStepsQuery,
      { set },
      [q.TAGS.howItWorksStep],
      fx.howItWorksSteps.filter((s) => s.set === set).sort(byOrder),
    ),
);

export const getPromotions = cache(
  (): Promise<Promotion[]> => fromSanity(q.promotionsQuery, {}, [q.TAGS.promotion], fx.promotions),
);

export const getShopCategories = cache(
  (): Promise<ShopCategoryEditorial[]> =>
    fromSanity<ShopCategoryEditorial[]>(q.shopCategoriesQuery, {}, [q.TAGS.shopCollectionConfig], []),
);

// ---------- Page singletons ----------
const singleton = <T>(type: string, fallback: T) =>
  cache((): Promise<T> => fromSanity(q.pageSingletonQuery, { type }, [q.TAGS.page, type], fallback));

export const getHomePage = cache(async (): Promise<HomePage> => {
  const page = await fromSanity(q.homePageQuery, {}, [q.TAGS.page, "homePage"], {
    ...fx.homePage,
    serviceCards: fx.serviceCards,
  });
  return page.serviceCards.length ? page : { ...page, serviceCards: fx.serviceCards };
});
export const getServicesPage = singleton<ServicesPage>("servicesPage", fx.servicesPage);
export const getShopPage = singleton<ShopPage>("shopPage", fx.shopPage);
export const getSellPage = singleton<SellPage>("sellPage", fx.sellPage);
export const getQuotePage = singleton<QuotePage>("quotePage", fx.quotePage);
export const getSchedulePage = singleton<SchedulePage>("schedulePage", fx.schedulePage);
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
  const doc = await fromSanity<Partial<LlmsDocument>>(q.llmsDocumentQuery, {}, [q.TAGS.llmsDocument], fx.llmsDocument);
  return { llms: doc.llms || fx.llmsDocument.llms, llmsFull: doc.llmsFull || fx.llmsDocument.llmsFull };
});

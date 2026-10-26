/**
 * Per-route JSON-LD composition — exactly the types required by PROJECT_SPEC §5.1
 * (+ one WebPage node per page that carries isPartOf/breadcrumb and, on "/", Speakable).
 *
 * Usage in a page (server component):
 *   const data = await getSeoData();               // Sanity fetch (+ Shopify for products)
 *   return <><JsonLd data={jsonLdForHome(data)} />...</>;
 */
import {
  breadcrumbList,
  faqPage,
  graph,
  homeInternetOffer,
  localBusiness,
  organization,
  person,
  product,
  service,
  siteNavigation,
  webPage,
  website,
  type JsonLdGraph,
  type PersonInput,
  type ProductInput,
  type ReviewInput,
} from "./jsonld";
import type { SiteSettings } from "./site";
import {
  CORE_FAQS,
  FINANCING_FAQS,
  HOME_INTERNET_FAQS,
  MAIN_NAV,
  ROUTES,
  SERVICES,
  SERVICES_FAQS,
  SPEAKABLE_SELECTORS,
  type FaqItem,
  type RouteKey,
  type ServiceSeo,
} from "./content";

/** Shape of the data the page passes in (all from Sanity / Shopify; defaults in content.ts/site.ts). */
export interface SeoData {
  site: SiteSettings;
  services: ServiceSeo[];
  homeFaqs: FaqItem[]; // the 8 core FAQs
  faqPageFaqs: FaqItem[]; // /faq (same 8)
  servicesFaqs: FaqItem[];
  financingFaqs: FaqItem[];
  homeInternetFaqs: FaqItem[];
  products: ProductInput[];
  team: PersonInput[]; // ONLY real team members; [] => no Person nodes
  reviews: ReviewInput[]; // ONLY real reviews; [] => no rating schema
  reviewsRenderedOnPage: boolean;
  /** Visible header nav (navigation.headerLinks + headerCta). Defaults to MAIN_NAV. */
  nav?: { name: string; path: string }[];
}

export const defaultSeoData = (site: SiteSettings): SeoData => ({
  site,
  services: SERVICES,
  homeFaqs: CORE_FAQS,
  faqPageFaqs: CORE_FAQS,
  servicesFaqs: SERVICES_FAQS,
  financingFaqs: FINANCING_FAQS,
  homeInternetFaqs: HOME_INTERNET_FAQS,
  products: [],
  team: [],
  reviews: [],
  reviewsRenderedOnPage: false,
});

const seo = (r: RouteKey) => ROUTES.find((x) => x.route === r)!;
const HOME = { name: "Home", path: "/" };
const crumbs = (path: string, label: string, parents: { name: string; path: string }[] = []) =>
  breadcrumbList(path, [HOME, ...parents, { name: label, path }]);
const page = (path: string, r: RouteKey, opts: Parameters<typeof webPage>[3] = {}) =>
  webPage(path, seo(r).metaTitle, seo(r).metaDescription, { breadcrumb: path !== "/", ...opts });

/* R01 / — LocalBusiness + WebSite + FAQPage + SiteNavigationElement + Speakable */
export function jsonLdForHome(d: SeoData): JsonLdGraph {
  return graph(
    organization(d.site),
    localBusiness(d.site, {
      services: d.services,
      reviews: d.reviews,
      reviewsRenderedOnPage: d.reviewsRenderedOnPage,
    }),
    website(d.site),
    page("/", "/", { speakable: SPEAKABLE_SELECTORS }),
    siteNavigation(d.nav?.length ? d.nav : MAIN_NAV),
    faqPage("/", d.homeFaqs),
  );
}

/* R02 /services — Service x14 + FAQPage + BreadcrumbList */
export function jsonLdForServices(d: SeoData): JsonLdGraph {
  return graph(
    page("/services", "/services"),
    d.services.map((s) =>
      service({
        slug: s.slug,
        name: s.name,
        serviceType: s.serviceType,
        description: s.snippet,
        offers: s.slug === "home-internet" ? homeInternetOffer() : undefined,
      }),
    ),
    faqPage("/services", d.servicesFaqs),
    crumbs("/services", "Services"),
  );
}

/* R03 /shop — Product per product + BreadcrumbList */
export function jsonLdForShop(d: SeoData): JsonLdGraph {
  return graph(
    page("/shop", "/shop", { type: "CollectionPage" }),
    d.products.map(product),
    crumbs("/shop", "Shop"),
  );
}

/* R04 /shop/[product] — Product + BreadcrumbList */
export function jsonLdForProduct(d: SeoData, p: ProductInput): JsonLdGraph {
  const path = `/shop/${p.handle}`;
  return graph(
    webPage(path, p.name, p.description ?? p.name, { breadcrumb: true, type: "ItemPage" }),
    product(p),
    crumbs(path, p.name, [{ name: "Shop", path: "/shop" }]),
  );
}

/* R05/R06/R07 — Service + BreadcrumbList */
export function jsonLdForSellYourDevice(d: SeoData): JsonLdGraph {
  const s = d.services.find((x) => x.slug === "sell-trade-your-device")!;
  return graph(
    page("/sell-your-device", "/sell-your-device"),
    service({
      slug: "service",
      path: "/sell-your-device",
      url: "/sell-your-device",
      name: "Sell / Trade Your Device",
      serviceType: s.serviceType,
      description: s.snippet,
    }),
    crumbs("/sell-your-device", "Sell Your Device"),
  );
}
export function jsonLdForInstantQuote(_d: SeoData): JsonLdGraph {
  return graph(
    page("/instant-quote", "/instant-quote"),
    service({
      slug: "service",
      path: "/instant-quote",
      url: "/instant-quote",
      name: "Phone Repair Quote",
      serviceType: "Smartphone repair quote",
      description:
        "Request a smartphone repair quote from Speedy iRepair in Akron, Ohio. Choose your device type (iPhone, iPad, Samsung, LG, Google, or other), model, and issue (cracked screen, battery, charger port, camera, water damage, or other), then leave your contact details and we will follow up.",
    }),
    crumbs("/instant-quote", "Instant Quote"),
  );
}
export function jsonLdForScheduleRepair(_d: SeoData): JsonLdGraph {
  return graph(
    page("/schedule-repair", "/schedule-repair"),
    service({
      slug: "service",
      path: "/schedule-repair",
      url: "/schedule-repair",
      name: "Smartphone Repair Appointment",
      serviceType: "Smartphone repair",
      description:
        "Book a smartphone repair appointment at Speedy iRepair, 1650 W Market St #27, Akron, OH 44313. Most repairs are done the same day in 45 minutes, and all repairs are covered under our 90-day warranty.",
    }),
    crumbs("/schedule-repair", "Schedule Repair"),
  );
}

/* R08 /faq — FAQPage + BreadcrumbList */
export function jsonLdForFaq(d: SeoData): JsonLdGraph {
  return graph(
    page("/faq", "/faq", { type: "WebPage" }),
    faqPage("/faq", d.faqPageFaqs),
    crumbs("/faq", "FAQ"),
  );
}

/* R09 /about — Organization + Person (only real team) + BreadcrumbList */
export function jsonLdForAbout(d: SeoData): JsonLdGraph {
  return graph(
    page("/about", "/about", { type: "AboutPage" }),
    organization(d.site),
    d.team.map(person),
    crumbs("/about", "About"),
  );
}

/* R10 /financing — Service + FAQPage + BreadcrumbList */
export function jsonLdForFinancing(d: SeoData): JsonLdGraph {
  const s = d.services.find((x) => x.slug === "financing")!;
  return graph(
    page("/financing", "/financing"),
    service({
      slug: "service",
      path: "/financing",
      url: "/financing",
      name: "Acima Lease-to-Own Financing",
      serviceType: s.serviceType,
      description: s.snippet,
    }),
    faqPage("/financing", d.financingFaqs),
    crumbs("/financing", "Financing"),
  );
}

/* R11 /home-internet — Service (with brief-supplied $40/mo Offer) + FAQPage + BreadcrumbList */
export function jsonLdForHomeInternet(d: SeoData): JsonLdGraph {
  const s = d.services.find((x) => x.slug === "home-internet")!;
  return graph(
    page("/home-internet", "/home-internet"),
    service({
      slug: "service",
      path: "/home-internet",
      url: "/home-internet",
      name: "Home Internet",
      serviceType: s.serviceType,
      description: s.snippet,
      offers: homeInternetOffer(),
    }),
    faqPage("/home-internet", d.homeInternetFaqs),
    crumbs("/home-internet", "Home Internet"),
  );
}

/* R12–R14 policies — BreadcrumbList (no /policies index page exists, so trail is Home > Policy) */
export function jsonLdForPolicy(
  path: "/policies/shipping-return" | "/policies/privacy" | "/policies/terms",
): JsonLdGraph {
  return graph(page(path, path), crumbs(path, seo(path).label));
}

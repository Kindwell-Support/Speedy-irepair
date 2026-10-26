/**
 * JSON-LD builders for Speedy iRepair (schema.org, @graph with stable @ids).
 *
 * Generated in Next.js SERVER code from Sanity (and Shopify) data. Each route's page.tsx
 * composes a graph via lib/seo/routes.ts and renders <JsonLd data={graph} />.
 *
 * Hard rules enforced here:
 *  - NO foundingDate (founding year omitted by decision OQ-01).
 *  - openingHoursSpecification only when hours are populated in Sanity.
 *  - aggregateRating / review only when real reviews are passed in AND rendered on the page
 *    (caller must pass `reviewsRenderedOnPage: true`). Reviews copied from Google/other sites must NOT
 *    be marked up (Google review-snippet guidelines) — render them visually only.
 *  - Services never carry Offer prices (no public repair / trade-in pricing). The only priced
 *    Offer helper is homeInternetOffer() ($40/month, brief-supplied, visible in the hero).
 *  - Spectrum Authorized Retailer appears as description text only (no fabricated relationship).
 */
import { IDS, SITE_URL, type OpeningHoursRow, type SiteSettings } from './site';
import type { FaqItem } from './content';

export type JsonLdNode = Record<string, unknown> & { '@type': string | string[] };
export interface JsonLdGraph { '@context': 'https://schema.org'; '@graph': JsonLdNode[] }

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
const compact = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0) && v !== '')) as T;

export function graph(...nodes: (JsonLdNode | JsonLdNode[] | null | undefined | false)[]): JsonLdGraph {
  return { '@context': 'https://schema.org', '@graph': nodes.flat().filter(Boolean) as JsonLdNode[] };
}

/* ------------------------------------------------------------------ shared pieces */

export function postalAddress(s: SiteSettings) {
  return { '@type': 'PostalAddress', ...s.address };
}

export const AREA_SERVED_AKRON = {
  '@type': 'City',
  name: 'Akron',
  containedInPlace: { '@type': 'State', name: 'Ohio' },
} as const;

export function openingHoursSpecification(rows?: OpeningHoursRow[]) {
  if (!rows || rows.length === 0) return undefined; // field empty => emit nothing
  // Closed rows are skipped (a day not listed = closed) — binding rule, cms/SCHEMA_CONTRACT.md §2.1.
  const open = rows.filter((r) => !r.closed && r.opens && r.closes);
  if (open.length === 0) return undefined;
  return open.map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: r.days, opens: r.opens, closes: r.closes }));
}

/* ------------------------------------------------------------------ entities */

export function organization(s: SiteSettings): JsonLdNode {
  return compact({
    '@type': 'Organization',
    '@id': IDS.organization,
    name: s.name,
    legalName: s.legalName,
    url: abs('/'),
    logo: s.logoUrl ? { '@type': 'ImageObject', url: s.logoUrl } : undefined,
    email: s.email,
    telephone: s.telephoneE164,
    address: postalAddress(s),
    sameAs: s.sameAs,
    description: s.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: s.telephoneE164,
      email: s.email,
      areaServed: 'US',
    },
  });
}

export interface ReviewInput {
  author: string; ratingValue: number; reviewBody: string; datePublished?: string;
  /** cms testimonial.source. 'placeholder' never emits; 'google' (copied from GBP) never emits (Google policy). */
  source?: 'google' | 'manual' | 'placeholder';
  isPlaceholder?: boolean;
}
/** Only real, first-party reviews are eligible for markup. */
export const markupEligibleReviews = (r: ReviewInput[] = []) =>
  r.filter((x) => !x.isPlaceholder && x.source !== 'placeholder' && x.source !== 'google' && typeof x.ratingValue === 'number' && !!x.reviewBody);

export function localBusiness(
  s: SiteSettings,
  opts: { services?: { name: string; slug: string }[]; reviews?: ReviewInput[]; reviewsRenderedOnPage?: boolean } = {},
): JsonLdNode {
  const eligible = markupEligibleReviews(opts.reviews);
  opts = { ...opts, reviews: eligible };
  const showReviews = !!(opts.reviewsRenderedOnPage && eligible.length > 0);
  const ratingAvg = showReviews
    ? Math.round((opts.reviews!.reduce((a, r) => a + r.ratingValue, 0) / opts.reviews!.length) * 10) / 10
    : undefined;
  return compact({
    '@type': ['LocalBusiness', 'MobilePhoneStore'],
    '@id': IDS.localBusiness,
    name: s.name,
    url: abs('/'),
    description: s.description,
    image: s.logoUrl ?? s.defaultOgImageUrl,
    logo: s.logoUrl,
    telephone: s.telephoneE164,
    email: s.email,
    address: postalAddress(s),
    geo: s.geo ? { '@type': 'GeoCoordinates', latitude: s.geo.latitude, longitude: s.geo.longitude } : undefined,
    hasMap: s.hasMap,
    areaServed: AREA_SERVED_AKRON,
    openingHoursSpecification: openingHoursSpecification(s.openingHours),
    paymentAccepted: s.paymentAccepted.join(', '),
    currenciesAccepted: 'USD',
    knowsAbout: [
      'Smartphone repair', 'Screen repair', 'Battery replacement', 'Charger port repair', 'Camera repair',
      'Water damage inspection', 'Device unlocking', 'Certified pre-owned devices', 'Device trade-in',
      'Prepaid phone plans', 'Bill payment services', 'Home internet', 'Lease-to-own financing',
      ...s.brandsServiced.map((b) => `${b} repair`),
    ],
    sameAs: s.sameAs,
    parentOrganization: { '@id': IDS.organization },
    makesOffer: opts.services?.map((sv) => ({ '@type': 'Offer', itemOffered: { '@id': IDS.service(sv.slug) } })),
    // Reviews ONLY when real reviews are stored in Sanity AND visibly rendered on this page.
    aggregateRating: showReviews
      ? { '@type': 'AggregateRating', ratingValue: ratingAvg, reviewCount: opts.reviews!.length, bestRating: 5, worstRating: 1 }
      : undefined,
    review: showReviews
      ? opts.reviews!.map((r) => compact({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          reviewRating: { '@type': 'Rating', ratingValue: r.ratingValue, bestRating: 5, worstRating: 1 },
          reviewBody: r.reviewBody,
          datePublished: r.datePublished,
        }))
      : undefined,
  });
}

export function website(s: SiteSettings): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': IDS.website,
    url: abs('/'),
    name: s.name,
    description: s.description,
    inLanguage: 'en-US',
    publisher: { '@id': IDS.organization },
  };
}

export function siteNavigation(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': IDS.mainNav,
    name: 'Main navigation',
    itemListElement: items.map((it, i) => ({
      '@type': 'SiteNavigationElement',
      position: i + 1,
      name: it.name,
      url: abs(it.path),
    })),
  };
}

/** WebPage node. Pass speakable CSS selectors on the homepage (hero + value props). */
export function webPage(path: string, name: string, description: string, opts: { speakable?: string[]; breadcrumb?: boolean; type?: string } = {}): JsonLdNode {
  return compact({
    '@type': opts.type ?? 'WebPage',
    '@id': IDS.webpage(path),
    url: abs(path),
    name,
    description,
    inLanguage: 'en-US',
    isPartOf: { '@id': IDS.website },
    about: { '@id': IDS.localBusiness },
    breadcrumb: opts.breadcrumb ? { '@id': IDS.breadcrumb(path) } : undefined,
    speakable: opts.speakable ? speakable(opts.speakable) : undefined,
  });
}

export function speakable(cssSelector: string[]) {
  return { '@type': 'SpeakableSpecification', cssSelector };
}

export function faqPage(path: string, faqs: FaqItem[]): JsonLdNode | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': IDS.faq(path),
    url: abs(path),
    isPartOf: { '@id': IDS.website },
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export interface ServiceInput {
  slug: string;
  name: string;
  serviceType: string;
  description: string;
  /** Page where the service is described. Default /services (anchor = slug). */
  path?: string;
  /** Absolute/relative URL for the service. Default `${path}#${slug}`. */
  url?: string;
  offers?: JsonLdNode; // ONLY homeInternetOffer(); never pass repair/trade-in prices
}

export function service(sv: ServiceInput): JsonLdNode {
  const path = sv.path ?? '/services';
  return compact({
    '@type': 'Service',
    '@id': IDS.service(sv.slug, path),
    name: sv.name,
    serviceType: sv.serviceType,
    description: sv.description,
    url: abs(sv.url ?? `${path}#${sv.slug}`),
    provider: { '@id': IDS.localBusiness },
    areaServed: AREA_SERVED_AKRON,
    offers: sv.offers,
  });
}

/** Brief-supplied price, visible in the /home-internet hero. */
export function homeInternetOffer(): JsonLdNode {
  return {
    '@type': 'Offer',
    url: abs('/home-internet'),
    price: '40.00',
    priceCurrency: 'USD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '40.00',
      priceCurrency: 'USD',
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
    },
    description: 'First month free. Free smartphone included with signup.',
    seller: { '@id': IDS.localBusiness },
  };
}

export interface ProductInput {
  handle: string;
  name: string;
  description?: string;
  image?: string[];
  brand?: string;
  sku?: string;
  /** Real price from Shopify/Sanity. If absent, no Offer is emitted (never invent). */
  price?: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
  condition?: 'UsedCondition' | 'RefurbishedCondition' | 'NewCondition';
  /** Where "Add to cart"/"View" points (on-site PDP or Shopify product URL). */
  url?: string;
  category?: string;
}

export function product(p: ProductInput): JsonLdNode {
  const url = abs(p.url ?? `/shop/${p.handle}`);
  return compact({
    '@type': 'Product',
    '@id': IDS.product(p.handle),
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.sku,
    category: p.category,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    url,
    itemCondition: p.condition ? `https://schema.org/${p.condition}` : undefined,
    offers: p.price
      ? compact({
          '@type': 'Offer',
          url,
          price: p.price,
          priceCurrency: p.priceCurrency ?? 'USD',
          availability: p.availability ? `https://schema.org/${p.availability}` : undefined,
          itemCondition: p.condition ? `https://schema.org/${p.condition}` : undefined,
          seller: { '@id': IDS.localBusiness },
        })
      : undefined,
  });
}

export function breadcrumbList(path: string, trail: { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': IDS.breadcrumb(path),
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}

export interface PersonInput { slug: string; name: string; jobTitle?: string; image?: string; description?: string }

/** Only call when real team members exist in Sanity (never placeholders). */
export function person(p: PersonInput): JsonLdNode {
  return compact({
    '@type': 'Person',
    '@id': IDS.person(p.slug),
    name: p.name,
    jobTitle: p.jobTitle,
    image: p.image,
    description: p.description,
    worksFor: { '@id': IDS.organization },
  });
}

/** Safe serializer for <script type="application/ld+json"> (prevents </script> breakout). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

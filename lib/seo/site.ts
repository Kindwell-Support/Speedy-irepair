/**
 * Speedy iRepair — site-wide SEO constants and business-info DEFAULTS.
 *
 * These values are the seed / fallback for the Sanity `siteSettings` singleton.
 * At runtime, ALWAYS prefer the Sanity value (see getSiteSettings() in your data
 * layer) and fall back to these only if Sanity is unreachable.
 *
 * Every value here comes from PROJECT_SPEC.md §1 / §1.1 or the client brief.
 * RULES (DECISIONS_2026-10-27.md):
 *  - Founding year: OMITTED. There is intentionally NO foundingDate anywhere.
 *  - Hours: optional. Schema emits openingHoursSpecification ONLY when hours are populated.
 *  - Reviews: no aggregateRating/Review unless real reviews exist in Sanity AND are rendered.
 *  - No prices on repair / trade-in services.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://speedyirepair.com").replace(
  /\/$/,
  "",
);

/** Stable JSON-LD @id values. Never change these once live. */
export const IDS = {
  organization: `${SITE_URL}/#organization`,
  localBusiness: `${SITE_URL}/#localbusiness`,
  website: `${SITE_URL}/#website`,
  mainNav: `${SITE_URL}/#main-navigation`,
  webpage: (path: string) => `${SITE_URL}${path === "/" ? "/" : path}#webpage`,
  breadcrumb: (path: string) => `${SITE_URL}${path === "/" ? "/" : path}#breadcrumb`,
  faq: (path: string) => `${SITE_URL}${path === "/" ? "/" : path}#faq`,
  service: (slug: string, path = "/services") => `${SITE_URL}${path}#${slug}`,
  product: (handle: string) => `${SITE_URL}/shop/${handle}#product`,
  person: (slug: string) => `${SITE_URL}/about#person-${slug}`,
} as const;

export type DayOfWeek =
  "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface OpeningHoursRow {
  /** One or more days sharing the same hours */
  days: DayOfWeek[];
  /** 24h "HH:MM". Omit both opens/closes and set closed=true for a closed day. */
  opens?: string;
  closes?: string;
  closed?: boolean;
}

export interface SiteSettings {
  name: string;
  legalName: string;
  url: string;
  description: string;
  telephoneE164: string; // schema.org
  telephoneDisplay: string; // visible copy
  email: string;
  /** Suite / unit, Sanity-editable (siteSettings.address.unit in CMS contract). Default "#27". Appended to streetAddress by fullStreetAddress(). */
  suite?: string;
  address: {
    /** Street WITHOUT the suite, e.g. "1650 W Market St". (If an adapter passes it already combined, the suite is not appended twice.) */
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  hasMap: string;
  sameAs: string[];
  paymentAccepted: string[];
  brandsServiced: string[];
  /** Optional. Empty / undefined => no openingHoursSpecification in JSON-LD and UI shows hoursPlaceholder. */
  openingHours?: OpeningHoursRow[];
  hoursPlaceholder: string;
  /** Absolute URL of the logo (from Sanity image asset). Optional until logo asset lands (OQ-04). */
  logoUrl?: string;
  /** Absolute URL of default OG/share image (1200x630). */
  defaultOgImageUrl?: string;
  /** Optional geo; only populate from the verified Google Business Profile pin. */
  geo?: { latitude: number; longitude: number };
  twitterHandle: string;
}

/**
 * Hours note: Mon–Sat 12:00–18:00, Sun closed. Verified 2026-10-27 against the
 * business's own Square booking page (square.site/book/H19XXYP72PBW5/…, "Location & hours")
 * and two mirrors of the Google listing "Speedy iRepair - West Akron Wallhaven - SPECTRUM
 * AUTHORIZED RETAILER". Seeded into Sanity as editable data; client should confirm.
 * If the client clears this field, schema stops emitting hours automatically and the UI shows
 * "Hours coming soon".
 */
export const VERIFIED_HOURS: OpeningHoursRow[] = [
  {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "12:00",
    closes: "18:00",
  },
  { days: ["Sunday"], closed: true },
];

/** PM decision (Oct 27 2026): schema address stays "1650 W Market St #27"; suite is one editable field. */
export const DEFAULT_SUITE = "#27";

/** "1650 W Market St" + " #27" -> "1650 W Market St #27" (never duplicates the suite). */
export function fullStreetAddress(s: Pick<SiteSettings, "address" | "suite">): string {
  const street = s.address.streetAddress.trim();
  const suite = (s.suite ?? "").trim();
  if (!suite || street.toLowerCase().endsWith(suite.toLowerCase())) return street;
  return `${street} ${suite}`;
}
/** One-line NAP address, e.g. "1650 W Market St #27, Akron, OH 44313". */
export const oneLineAddress = (s: Pick<SiteSettings, "address" | "suite">) =>
  `${fullStreetAddress(s)}, ${s.address.addressLocality}, ${s.address.addressRegion} ${s.address.postalCode}`;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: "Speedy iRepair",
  legalName: "Speedy iRepair LLC",
  url: SITE_URL,
  description:
    "Akron's trusted phone repair shop. Smartphone repair, certified pre-owned devices, trade-ins, prepaid phone plans, bill payment, home internet, and Acima financing at 1650 W Market St #27, Akron, OH 44313. Spectrum Authorized Retailer.",
  telephoneE164: "+1-855-377-3339",
  telephoneDisplay: "1.855.377.3339",
  email: "info@speedyirepair.com",
  suite: DEFAULT_SUITE,
  address: {
    streetAddress: "1650 W Market St",
    addressLocality: "Akron",
    addressRegion: "OH",
    postalCode: "44313",
    addressCountry: "US",
  },
  hasMap: "https://goo.gl/maps/hx2oTBFB18LNoMW36",
  // Exact URLs from PROJECT_SPEC §1.1 (do not "clean" them without PM sign-off).
  sameAs: [
    "https://m.facebook.com/speedyirepair/",
    "https://mobile.twitter.com/speedyirepair",
    "http://Instagram.com/speedyirepair",
    "https://youtu.be/O_o94Qwoe7U",
    "https://www.ebay.com/usr/speedyirepair",
  ],
  paymentAccepted: ["Credit Card", "Debit Card", "PayPal", "Venmo"],
  brandsServiced: ["Apple", "Samsung", "LG", "Google Pixel", "Motorola", "OnePlus"],
  openingHours: VERIFIED_HOURS,
  hoursPlaceholder: "Hours coming soon",
  logoUrl: undefined,
  defaultOgImageUrl: `${SITE_URL}/og/default.jpg`,
  geo: undefined,
  twitterHandle: "@speedyirepair",
};

export const EXTERNAL = {
  scheduleRepairSquare:
    "https://squareup.com/appointments/book/H19XXYP72PBW5/speedy-irepair-akron-oh",
  acima:
    "https://ecom.acimacredit.com/views/phone-auth/ecom-merchant-813293c2-9f1e-4987-8b83-6691e6baf75e?redirect=application",
  homeInternetJotform: "https://form.jotform.com/253200750312037",
  ebay: "https://www.ebay.com/usr/speedyirepair",
  leaveReview: "https://g.co/kgs/Rhw8GL",
  googleMaps: "https://goo.gl/maps/hx2oTBFB18LNoMW36",
} as const;

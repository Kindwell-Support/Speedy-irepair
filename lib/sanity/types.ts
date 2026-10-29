/**
 * Content-layer types. These are the ONLY shapes Frontend components receive.
 * Sanity GROQ projections in lib/sanity/queries.ts and fixtures in lib/sanity/fixtures/
 * must both conform to these types. Contract: docs/CONTRACT_SANITY.md.
 */
import type { PortableTextBlock } from "@portabletext/react";

export type { PortableTextBlock };

/** Every editorial document can be flagged as a placeholder (rendered visibly in non-production). */
export interface Placeholderable {
  isPlaceholder?: boolean;
  /** Free-text note for editors/QC: why this is a placeholder or where the content came from. */
  sourceNote?: string;
}

/** Resolved image. `isSanity` => served via Sanity CDN loader; otherwise a static /public or remote asset. */
export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string | null;
  isSanity: boolean;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: ImageAsset | null;
  noIndex?: boolean | null;
  canonicalOverride?: string | null;
}

export interface CtaLink {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "link";
}

export interface Address {
  street: string;
  suite?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface OpeningHours {
  day: Weekday;
  closed: boolean;
  /** 24h "HH:mm" */
  opens?: string | null;
  closes?: string | null;
}

export type SocialPlatform = "facebook" | "twitter" | "instagram" | "youtube";
export type PaymentMethod = "paypal" | "venmo" | "visa" | "mastercard" | "amex" | "discover";
export type ExternalLinkKey =
  | "schedule"
  | "financing"
  | "homeInternetSignup"
  | "ebay"
  | "review"
  | "maps"
  | "facebook"
  | "twitter"
  | "instagram"
  | "youtube";

export interface BusinessInfo extends Placeholderable {
  name: string;
  legalName: string;
  tagline: string;
  address: Address;
  /** Footer line exactly as the spec writes it (REQ-039). */
  footerAddressLine: string;
  phone: string;
  email: string;
  hours: OpeningHours[];
  hoursIsPlaceholder: boolean;
  /** Shown when hoursIsPlaceholder (e.g. "Hours coming soon"). */
  hoursPlaceholderText: string;
  hoursSource?: string | null;
  /** OQ-01: omitted until supplied. NEVER invent. */
  foundingYear?: number | null;
  geo?: { lat: number; lng: number } | null;
  socials: { platform: SocialPlatform; label: string; url: string; handle?: string | null }[];
  externalLinks: Record<ExternalLinkKey, string>;
  paymentsAccepted: PaymentMethod[];
  notificationEmail: string;
  googleMapsEmbedUrl?: string | null;
  spectrumAuthorizedRetailer: boolean;
  logo: ImageAsset;
  logoInverse?: ImageAsset | null;
}

export interface Navigation {
  primary: CtaLink[];
  headerCta: CtaLink;
  footerQuickLinks: CtaLink[];
  footerLegalLinks: CtaLink[];
}

export interface SiteSettings {
  business: BusinessInfo;
  navigation: Navigation;
  copyright: string;
  defaultSeo: Seo;
}

export interface Announcement extends Placeholderable {
  id: string;
  text: string;
  href: string;
  external: boolean;
  enabled: boolean;
}

export interface Promotion extends Placeholderable {
  id: string;
  title: string;
  body?: string | null;
  cta: CtaLink;
  order: number;
}

/** Homepage services-grid card (C1–C8). Separate from the 14 /services sections. */
export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  href: string;
  externalLink?: CtaLink | null;
  riveIcon: string;
  order: number;
  /** CMS photo for the homepage gallery; empty = built-in photo/tile. */
  image?: ImageAsset | null;
}

export interface PriceLine {
  label: string;
  price: string;
}

export interface Service extends Placeholderable {
  id: string;
  slug: string;
  title: string;
  /** Featured-snippet paragraph (40–60 words, REQ-049). */
  summary: string;
  body: PortableTextBlock[];
  ctas: CtaLink[];
  riveIcon: string;
  order: number;
  seo?: Seo | null;
  /** Optional headline price, e.g. "From $79". Hidden when empty. */
  priceFrom?: string | null;
  /** Optional price table. Hidden when empty. */
  priceList?: PriceLine[] | null;
  /** CMS photo; empty = built-in photo for the slug, if any. */
  image?: ImageAsset | null;
}

export type FaqCategory = "general" | "services" | "financing" | "internet";

export interface Faq extends Placeholderable {
  id: string;
  question: string;
  /** Plain text so it can be used verbatim in FAQPage JSON-LD. */
  answer: string;
  categories: FaqCategory[];
  order: number;
}

export interface Testimonial extends Placeholderable {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  source: "google" | "facebook" | "other";
  sourceUrl?: string | null;
  date?: string | null;
}

export interface TeamMember extends Placeholderable {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: ImageAsset | null;
  order: number;
}

export interface Brand {
  id: string;
  /** Marquee label, e.g. "Google Pixel". */
  name: string;
  /** Short label, e.g. "Google" (trade-in brand list). */
  shortName: string;
  logo?: ImageAsset | null;
  repairs: boolean;
  acceptsTradeIn: boolean;
  order: number;
}

export interface ValueProp extends Placeholderable {
  id: string;
  title: string;
  detail?: string | null;
  speakable: boolean;
  order: number;
}

export type StepSet = "home" | "sell" | "financing" | "homeInternet";

export interface HowItWorksStep extends Placeholderable {
  id: string;
  set: StepSet;
  title: string;
  body?: string | null;
  order: number;
  image?: ImageAsset | null;
}

export interface PageHero {
  eyebrow?: string | null;
  headline: string;
  subline?: string | null;
  primaryCta?: CtaLink | null;
  secondaryCta?: CtaLink | null;
  poster?: ImageAsset | null;
}

/** A titled copy block inside a page (section heading + optional intro). */
export interface SectionCopy extends Placeholderable {
  heading: string;
  intro?: string | null;
  body?: PortableTextBlock[] | null;
}

export interface BasePage {
  title: string;
  hero: PageHero;
  seo: Seo;
  /** CMS photo for the page body; empty = built-in photo. */
  photo?: ImageAsset | null;
}

export type BlogPage = BasePage;

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  author?: string | null;
  excerpt?: string | null;
  coverImage?: ImageAsset | null;
}

export interface Post extends PostSummary {
  body: PortableTextBlock[];
  seo?: Seo | null;
}

export interface HomePage extends BasePage {
  serviceCardsSection: SectionCopy;
  serviceCards: ServiceCard[];
  howItWorksSection: SectionCopy;
  brandsSection: SectionCopy;
  whySection: SectionCopy;
  testimonialsSection: SectionCopy;
  promotionsSection: SectionCopy;
  faqSection: SectionCopy;
  locationSection: SectionCopy & { directionsLabel: string };
  newsletter: { heading: string; emailLabel: string; buttonLabel: string; successMessage: string };
  contactSection: SectionCopy;
  /** Optional Spline scene URL; when empty the R3F hero is used (ARCHITECTURE: 3D hero). */
  splineSceneUrl?: string | null;
}

export interface ServicesPage extends BasePage {
  faqSection: SectionCopy;
}

export interface ShopPage extends BasePage {
  stagingNotice: string;
}

export interface SellPage extends BasePage {
  howItWorksSection: SectionCopy;
  formSection: SectionCopy;
  brandsSection: SectionCopy;
  ctaSection: SectionCopy & { ctas: CtaLink[] };
}

export interface QuotePage extends BasePage {
  formSection: SectionCopy;
  deviceTypes: string[];
  issues: string[];
  successMessage: string;
}

export interface SchedulePage extends BasePage {
  whatToExpect: SectionCopy;
  whatToBring: SectionCopy;
  locationSection: SectionCopy;
  squareBookingUrl: string;
}

export interface FaqPage extends BasePage {
  intro?: string | null;
}

export interface AboutPage extends BasePage {
  aboutSection: SectionCopy;
  teamSection: SectionCopy;
  storySection: SectionCopy;
  valuesSection: SectionCopy & { values: string[] };
  spectrumSection: SectionCopy;
  ctaSection: SectionCopy & { ctas: CtaLink[] };
  contactSection: SectionCopy;
}

export interface FinancingPage extends BasePage {
  whatIsSection: SectionCopy;
  howItWorksSection: SectionCopy;
  whatYouCanFinanceSection: SectionCopy & { items: string[] };
  applyCta: CtaLink;
  faqSection: SectionCopy;
}

export interface HomeInternetPage extends BasePage {
  whoItsForSection: SectionCopy & { items: string[] };
  whatYouGetSection: SectionCopy & { items: string[] };
  howToSignUpSection: SectionCopy;
  jotformUrl: string;
  faqSection: SectionCopy;
}

export type PolicySlug = "shipping-return" | "privacy" | "terms";

export interface PolicyPage extends Placeholderable {
  slug: PolicySlug;
  title: string;
  body: PortableTextBlock[];
  sourceUrl?: string | null;
  seo: Seo;
}

export interface LlmsDocument {
  llms: string;
  llmsFull: string;
}

/** Editorial merchandising for a shop category (NOT the catalog; Shopify owns products/prices). */
export interface ShopCategoryEditorial {
  handle: string;
  title: string;
  description?: string | null;
  heroImage?: ImageAsset | null;
  featuredProductHandles: string[];
  order: number;
  seo?: Seo | null;
}

export type FormType = "quote" | "tradein" | "contact" | "newsletter";

export interface FormSubmissionDoc {
  _type: "formSubmission";
  type: FormType;
  payload: string;
  createdAt: string;
  status: "new" | "contacted" | "closed" | "spam";
  pagePath?: string;
}

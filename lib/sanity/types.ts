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

/** v1.3 header item: link + optional dropdown (design "Services ▾"). */
export interface NavLink extends CtaLink {
  children?: CtaLink[] | null;
}

export interface Navigation {
  primary: NavLink[];
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
  /** null for placeholders: never render or emit stars without a real rating (contract §3.3). */
  rating: 1 | 2 | 3 | 4 | 5 | null;
  text: string;
  /** contract §3.3: placeholder ⇔ isPlaceholder. */
  source: "google" | "manual" | "placeholder";
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
  /** v1.3 optional stat (design `.why__num`), e.g. {value:"45", label:"min"}. Only real numbers from the brief. */
  stat?: { value: string; label?: string | null } | null;
}

export type StepSet = "home" | "sell" | "financing" | "homeInternet";

export interface HowItWorksStep extends Placeholderable {
  id: string;
  set: StepSet;
  title: string;
  body?: string | null;
  order: number;
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
  /** Small label above the h2 (design `.eyebrow`). CMS: sectionHeading.eyebrow (contract v1.3). */
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  body?: PortableTextBlock[] | null;
}

export interface BasePage {
  title: string;
  hero: PageHero;
  /** v1.3 page intro under the hero (G4: on quote/schedule this = the Service JSON-LD description). */
  intro?: string | null;
  seo: Seo;
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
  newsletter: { eyebrow?: string | null; heading: string; emailLabel: string; buttonLabel: string; successMessage: string };
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
  bookingSection?: SectionCopy;
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
  locationSection?: SectionCopy;
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
  signUpSection?: SectionCopy;
  jotformUrl: string;
  faqSection: SectionCopy;
}

export type PolicySlug = "shipping-return" | "privacy" | "terms";

export interface PolicyPage extends Placeholderable {
  slug: PolicySlug;
  eyebrow?: string | null;
  title: string;
  body: PortableTextBlock[];
  sourceUrl?: string | null;
  /** Sanity `lastUpdated` (date, YYYY-MM-DD). Additive (Frontend): exposed for the policy-meta row. */
  lastUpdated?: string | null;
  /** contract v1.2: live-site text kept verbatim but pending legal/client review (privacy, terms, shipping-return). */
  needsReview?: boolean;
  reviewNote?: string | null;
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

/* ---------- Lead-capture flows (/instant-quote, /sell-your-device). NO prices anywhere (DECISIONS #5). ---------- */

/** Icon keys the LeadFlow knows how to draw (design line icons, not editable copy). */
export type LeadIconKey =
  | "phone"
  | "tablet"
  | "watch"
  | "laptop"
  | "other"
  | "battery"
  | "port"
  | "camera"
  | "water"
  | "badge"
  | "check"
  | "power";

/** One selectable option. `key` is the value submitted (must match the shared zod enum). */
export interface LeadOption {
  key: string;
  label: string;
  description?: string | null;
  icon?: LeadIconKey | null;
}

export interface LeadStepCopy {
  /** Step id used by the flow: quote = device|model|issue|contact; trade-in = device|brand|model|condition|contact */
  id: string;
  /** Short label for the stepper and progress meta ("Device") */
  label: string;
  /** Step heading ("What device needs fixing?") */
  title: string;
  lede?: string | null;
}

/** All copy for a lead flow. Fixture today; CMS fields to follow (quoteConfig + page singletons). */
export interface LeadFlowCopy {
  ariaLabel: string;
  steps: LeadStepCopy[];
  /** Options per choice step id (device, issue, condition…). Brand options come from `brand` docs. */
  options: Record<string, LeadOption[]>;
  /** Model lists keyed by device/brand key. Empty = free-text model input (CMS contract 2.4). */
  models: Record<string, string[]>;
  stepCounter: string;
  model: { searchLabel: string; inputLabel: string; placeholder: string; notSureLabel: string; help: string; error: string };
  contact: {
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    detailsLabel: string;
    consentLabel: string;
    consentError: string;
  };
  chooseError: string;
  buttons: { back: string; next: string; submit: string; submitting: string; retry: string };
  submittingLede: string;
  success: { title: string; body: string; ctas: CtaLink[] };
  submitError: { title: string; body: string };
  stagingNote: string;
}

/** Sidebar card next to the flow ("How it works", "Good to know"). */
export interface LeadAsideCard {
  label: string;
  items?: { strong?: string | null; text: string }[] | null;
  body?: string | null;
}

export interface LeadFlowPageCopy {
  flow: LeadFlowCopy;
  aside: LeadAsideCard[];
  /** aria-label of the aside landmark */
  asideLabel: string;
  /** Label above the phone number card ("Rather talk?") */
  contactCardLabel: string;
}

/** Frontend: copy for an EmbedFacade frame set (Square / Jotform / map). Fixture-backed until a CMS field exists. */
export interface EmbedCopy {
  /** iframe title (a11y) */
  title: string;
  /** Branded bar caption ("Book an appointment · powered by Square"); omitted = no bar */
  barLabel?: string;
  loadLabel: string;
  /** Shown on the idle facade (third-party cookie notice) */
  description?: string;
  directLabel: string;
  fallbackTitle: string;
  /** "{phone}" is replaced with the business phone */
  fallbackBody: string;
  callLabel?: string;
  loadingLabel: string;
}
export type EmbedKind = "square" | "jotform" | "map";

/** Frontend: shared PolicyLayout chrome (fixture-backed until CMS fields exist). */
export interface PolicyChromeCopy {
  tocLabel: string;
  introLabel: string;
  lastUpdatedLabel: string;
  sourceLabel: string;
  otherPoliciesLabel: string;
  /** Visible when policyPage.needsReview */
  reviewLabel: string;
  /** Hero sub-line per policy (design) */
  sublines: Record<PolicySlug, string>;
}

/** Frontend: footer chrome labels (fixture-backed until CMS fields exist). */
export interface FooterCopy {
  quickLinksLabel: string;
  legalLabel: string;
  paymentsLabel: string;
  hoursLabel: string;
  socialLabel: string;
  spectrumLabel: string;
  locality: string;
  paymentLabels: Record<PaymentMethod, string>;
}

/** Frontend: homepage hero trust chips (design .hero__trust). Fixture-backed; rating chip omitted until P4 is verified (D2). */
export interface HeroChip {
  icon: "shield" | "wallet";
  label: string;
}

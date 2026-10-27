/** Page singleton fixtures. Headlines/copy verbatim from PROJECT_SPEC.md section 2; TBD copy = visible placeholders. */
import type {
  AboutPage,
  FaqPage,
  FinancingPage,
  HomeInternetPage,
  HomePage,
  PolicyPage,
  PolicySlug,
  QuotePage,
  SchedulePage,
  SellPage,
  ServicesPage,
  ShopPage,
} from "../types";
import { EXTERNAL_LINKS } from "./business";
import { PLACEHOLDER } from "./helpers";
import policySource from "./policies.source.json";

const akron = "Akron, OH";

export const homePage: HomePage = {
  title: "Home",
  hero: {
    headline: "Cracked screen? Dead battery? We fix it in 45 minutes.",
    // Decision #1: founding year omitted. If businessInfo.foundingYear is later set, CMS may edit this line.
    subline: "Akron's trusted phone repair shop. Walk in or book online.",
    primaryCta: { label: "Schedule Repair", href: "/schedule-repair", variant: "primary" },
    secondaryCta: { label: "Get Instant Quote", href: "/instant-quote", variant: "secondary" },
    poster: null,
  },
  serviceCardsSection: {
    heading: "Our services",
    intro: "Repairs, devices, plans, bills and internet. Eight services, one counter on W Market St.",
  },
  serviceCards: [], // filled by content layer from collections.serviceCards
  serviceCardLinkLabel: "Learn more",
  howItWorksSection: { heading: "How it works" },
  brandsSection: { heading: "Brands we repair" },
  whySection: { heading: "Why choose us" },
  testimonialsSection: { heading: "What customers say" },
  promotionsSection: { heading: "Current promotions" },
  faqSection: { heading: "Frequently asked questions", allLabel: "All FAQs", callPrompt: "Can't find it? Call" },
  locationSection: { heading: "Visit us in Akron", directionsLabel: "Get Directions" },
  newsletter: {
    heading: "Join our mailing list for the best deals.",
    emailLabel: "Email address",
    buttonLabel: "Subscribe",
    successMessage: "Thanks! You're on the list.",
  },
  contactSection: { heading: "Contact us" },
  splineSceneUrl: null,
  seo: {
    metaTitle: "Phone Repair in Akron, OH | Speedy iRepair",
    metaDescription:
      "Cracked screen? Dead battery? Speedy iRepair fixes most phones in 45 minutes at 1650 W Market St, Akron, OH. Pre-owned devices, prepaid plans, home internet.",
  },
};

export const servicesPage: ServicesPage = {
  title: "Services",
  hero: { headline: "Phone repair and wireless services in Akron, OH", subline: null },
  faqSection: { heading: "Repair FAQs" },
  seo: {
    metaTitle: "Phone Repair & Wireless Services in Akron, OH | Speedy iRepair",
    metaDescription: `Screen, battery, charger port and camera repair, unlocking, pre-owned devices, prepaid plans, bill pay, home internet and financing in ${akron}.`,
  },
};

export const shopPage: ShopPage = {
  title: "Shop",
  hero: { headline: "Certified pre-owned devices and accessories", subline: null },
  stagingNotice:
    "Staging preview: checkout is not connected yet. Products and prices are a snapshot of speedyirepair.com.",
  seo: {
    metaTitle: "Certified Pre-Owned iPhones & Accessories in Akron, OH | Speedy iRepair",
    metaDescription: `Shop certified pre-owned iPhones, iPads, Apple Watch, MacBooks and accessories from Speedy iRepair in ${akron}.`,
  },
};

export const sellPage: SellPage = {
  title: "Sell Your Device",
  // Copy verbatim from design/pages/sell-your-device.html (headline/subline = spec 2.5).
  hero: {
    eyebrow: "Sell or trade in",
    headline: "Get top dollar for your old device.",
    subline: "We compare the best trade-in prices so you don't have to.",
    primaryCta: { label: "Start your quote", href: "#trade-in", variant: "primary" },
    secondaryCta: { label: "Call us for a quote", href: "tel:+18553773339", variant: "secondary" },
  },
  howItWorksSection: { eyebrow: "How it works", heading: "Sell it in three steps." },
  formSection: { eyebrow: "Trade-in form", heading: "Tell us about your device." },
  brandsSection: { eyebrow: "Brands accepted", heading: "We buy these brands." },
  ctaSection: {
    heading: "Prefer to talk it through?",
    intro: "Visit the store on W Market St, or call and we will give you a quote.",
    ctas: [
      { label: "Visit our store", href: EXTERNAL_LINKS.maps, external: true, variant: "primary" },
      { label: "Call us for a quote", href: "tel:+18553773339", variant: "secondary" },
    ],
  },
  seo: {
    metaTitle: "Sell My Phone in Akron, OH | Speedy iRepair",
    metaDescription: `Sell or trade in your old or broken phone in ${akron}. We compare the best trade-in prices so you don't have to.`,
  },
};

export const quotePage: QuotePage = {
  title: "Instant Quote",
  // Copy verbatim from design/pages/instant-quote.html.
  hero: {
    eyebrow: "Instant quote",
    headline: "Get a repair quote in four steps.",
    subline: "Tell us your device, model and issue. We will contact you with your quote.",
  },
  formSection: { heading: "Quote form" },
  deviceTypes: ["iPhone", "iPad", "Samsung", "LG", "Google", "Other"],
  issues: ["Cracked Screen", "Battery", "Charger Port", "Camera", "Water Damage", "Other"],
  // Decision #5: lead capture only, NO prices shown.
  successMessage: "Thanks! We'll get back to you with a quote shortly.",
  seo: {
    metaTitle: "Phone Repair Quote in Akron, OH | Speedy iRepair",
    metaDescription: `Request a phone repair quote for iPhone, iPad, Samsung, LG and Google devices in ${akron}.`,
  },
};

export const schedulePage: SchedulePage = {
  title: "Schedule Repair",
  hero: { headline: "Schedule your repair", subline: null },
  whatToExpect: { heading: "What to expect", intro: PLACEHOLDER("what to expect copy, CMS (spec 2.7)"), isPlaceholder: true },
  whatToBring: { heading: "What to bring", intro: PLACEHOLDER("what to bring copy, CMS (spec 2.7)"), isPlaceholder: true },
  locationSection: { heading: "Location & hours" },
  squareBookingUrl: EXTERNAL_LINKS.schedule,
  seo: {
    metaTitle: "Schedule a Phone Repair in Akron, OH | Speedy iRepair",
    metaDescription: `Book a phone repair appointment at Speedy iRepair, 1650 W Market St, ${akron}.`,
  },
};

export const faqPage: FaqPage = {
  title: "FAQ",
  hero: { headline: "Frequently asked questions", subline: null },
  intro: null,
  seo: {
    metaTitle: "Phone Repair FAQ | Speedy iRepair Akron, OH",
    metaDescription: `Answers about repair times, warranty, payment and data for Speedy iRepair in ${akron}.`,
  },
};

export const aboutPage: AboutPage = {
  title: "About",
  hero: { headline: "About Speedy iRepair", subline: "Akron's trusted phone repair shop." },
  intro: "Speedy iRepair repairs smartphones in Akron, sells certified pre-owned devices and accessories, and helps with prepaid plans, bill payments and Home Internet.",
  aboutSection: { heading: "Who we are", intro: PLACEHOLDER("who we are, how long in Akron, mission (OQ-15)"), isPlaceholder: true },
  teamSection: { heading: "The team" },
  storySection: { heading: "Why we started", intro: PLACEHOLDER("entrepreneur story (OQ-15)"), isPlaceholder: true },
  valuesSection: {
    heading: "Our values",
    values: ["Fast repairs", "Fair prices", "Honest service"],
    items: [
      { title: "Fast repairs", body: "iPhone repairs typically take 45–60 minutes." },
      { title: "Fair prices", body: "No upfront payment for iPhone repairs. $20 deposit on Android repairs." },
      { title: "Honest service", body: "All repairs are covered under our 90-day warranty." },
    ],
  },
  spectrumSection: { heading: "Spectrum Authorized Retailer" },
  ctaSection: {
    heading: "Need a repair?",
    intro: "Book a time, or come by the shop.",
    ctas: [
      { label: "Schedule a repair", href: "/schedule-repair", variant: "primary" },
      { label: "Visit the shop", href: EXTERNAL_LINKS.maps, external: true, variant: "secondary" },
    ],
  },
  contactSection: { heading: "Contact us" },
  seo: {
    metaTitle: "About Speedy iRepair | Phone Repair Shop in Akron, OH",
    metaDescription: `Meet Speedy iRepair, a locally owned phone repair shop and Spectrum Authorized Retailer in ${akron}.`,
  },
};

export const financingPage: FinancingPage = {
  title: "Financing",
  hero: { headline: "Financing with Acima", subline: "Lease-to-own. No credit needed." },
  whatIsSection: {
    heading: "What is Acima?",
    intro: "Acima offers lease-to-own financing. No credit needed.",
    highlights: ["No credit needed.", "Lease-to-own on eligible items.", "Apply online through Acima."],
    visualLabel: "Acima",
  },
  howItWorksSection: { heading: "How it works" },
  whatYouCanFinanceSection: {
    heading: "What you can finance",
    items: ["Smartphones", "Accessories"],
    itemBodies: {
      Smartphones: "Certified pre-owned phones from our store.",
      Accessories: "Cases, chargers, headphones and more.",
      "And more": "Ask in store what is eligible for financing.",
    },
  },
  applyCta: { label: "Apply Now", href: EXTERNAL_LINKS.financing, external: true, variant: "primary" },
  faqSection: { heading: "Financing FAQs" },
  ctaSection: {
    heading: "Ready to apply?",
    intro: "Lease-to-own with Acima. No credit needed.",
    ctas: [
      { label: "Apply Now", href: EXTERNAL_LINKS.financing, external: true, variant: "primary" },
      { label: "Visit the store", href: EXTERNAL_LINKS.maps, external: true, variant: "secondary" },
    ],
  },
  seo: {
    metaTitle: "Phone Financing, No Credit Needed | Speedy iRepair Akron, OH",
    metaDescription: `Acima lease-to-own financing on smartphones and accessories at Speedy iRepair in ${akron}. No credit needed.`,
  },
};

export const homeInternetPage: HomeInternetPage = {
  title: "Home Internet",
  hero: { headline: "Home Internet for $40/month. First month free. Free smartphone included.", subline: null },
  whoItsForSection: { heading: "Who it's for", items: ["New home", "Townhome", "Condo", "Apartment"] },
  whatYouGetSection: { heading: "What you get", items: ["Home internet", "First month free", "Free smartphone"] },
  howToSignUpSection: { heading: "How to sign up", intro: "Fill out the form or visit the store." },
  jotformUrl: EXTERNAL_LINKS.homeInternetSignup,
  faqSection: { heading: "Home Internet FAQs" },
  seo: {
    metaTitle: "Home Internet in Akron, OH, $40/month | Speedy iRepair",
    metaDescription: `Home internet for $40/month in ${akron}. First month free and a free smartphone when you sign up.`,
  },
};

type PolicySourceEntry = { title: string; sourceUrl: string; body: PolicyPage["body"] };
const src = policySource as Record<PolicySlug, PolicySourceEntry>;

export const policyPages: Record<PolicySlug, PolicyPage> = {
  "shipping-return": {
    slug: "shipping-return",
    title: "Shipping & Return Policy",
    body: src["shipping-return"].body,
    sourceUrl: src["shipping-return"].sourceUrl,
    sourceNote: "Verbatim from the live site, pulled 2026-10-27 (REQ-097).",
    seo: { metaTitle: "Shipping & Return Policy | Speedy iRepair", metaDescription: "Shipping, returns, refunds and exchanges at Speedy iRepair, Akron, OH." },
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    body: src.privacy.body,
    sourceUrl: src.privacy.sourceUrl,
    sourceNote: "Verbatim from the live Shopify site, pulled 2026-10-27. Client/legal to review (OQ-17).",
    seo: { metaTitle: "Privacy Policy | Speedy iRepair", metaDescription: "How Speedy iRepair collects, uses and shares personal information." },
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    body: src.terms.body,
    sourceUrl: src.terms.sourceUrl,
    sourceNote: "Verbatim from speedyirepair.com/pages/terms-conditions, pulled 2026-10-27. The Shopify 'Terms of service' (/policies/terms-of-service) also exists; client/legal to decide (OQ-17).",
    seo: { metaTitle: "Terms & Conditions | Speedy iRepair", metaDescription: "Repair terms and conditions for Speedy iRepair, Akron, OH." },
  },
};


/**
 * Speedy iRepair — SEO/AEO content seed (single source for samples, llms-full.txt and Sanity seed).
 * Facts ONLY from PROJECT_SPEC.md / brief.md. No founding year, no repair/trade-in prices,
 * no invented reviews. Items marked `draft: true` must be reviewed by CMS & Content Engineer
 * and Abdullah before publish (OQ-16).
 */

export type RouteKey =
  | "/"
  | "/services"
  | "/shop"
  | "/shop/[product]"
  | "/sell-your-device"
  | "/instant-quote"
  | "/schedule-repair"
  | "/faq"
  | "/financing"
  | "/home-internet"
  | "/blog"
  | "/policies/shipping-return"
  | "/policies/privacy"
  | "/policies/terms";

export interface FaqItem {
  question: string;
  answer: string;
  draft?: boolean;
}

export interface RouteSeo {
  route: RouteKey;
  /** Visible breadcrumb label + BreadcrumbList name */
  label: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export const ROUTES: RouteSeo[] = [
  {
    route: "/",
    label: "Home",
    h1: "Cracked screen? Dead battery? We fix it in 45 minutes.",
    metaTitle: "Phone Repair Akron, OH | 45-Minute Fixes | Speedy iRepair",
    metaDescription:
      "Cracked screen or dead battery? Speedy iRepair in Akron, OH fixes most phones the same day in 45 minutes with a 90-day warranty. Walk in or book online.",
    primaryKeyword: "phone repair akron ohio",
    secondaryKeywords: [
      "phone repair near me",
      "cell phone repair akron",
      "phone repair west akron",
      "spectrum authorized retailer akron",
    ],
  },
  {
    route: "/services",
    label: "Services",
    h1: "Phone Repair and Wireless Services in Akron, OH",
    metaTitle: "Phone Repair & Wireless Services Akron, OH | Speedy iRepair",
    metaDescription:
      "Screen, battery, charger port and camera repair, unlocking, trade-ins, prepaid plans, bill pay and home internet in Akron, OH. See all 14 services.",
    primaryKeyword: "iphone screen repair akron",
    secondaryKeywords: [
      "samsung repair akron oh",
      "phone battery replacement akron",
      "charging port repair akron",
      "phone camera repair akron",
      "water damaged phone repair akron",
      "phone unlocking akron",
      "prepaid phone plans akron",
      "pay utility bills akron",
    ],
  },
  {
    route: "/shop",
    label: "Shop",
    h1: "Shop Certified Pre-Owned Devices",
    metaTitle: "Certified Pre-Owned iPhones Akron, OH | Speedy iRepair",
    metaDescription:
      "Shop certified pre-owned iPhones, iPads, Apple Watch, MacBooks and accessories from Speedy iRepair in Akron, OH. Acima financing, no credit needed.",
    primaryKeyword: "certified pre-owned iphone akron",
    secondaryKeywords: [
      "used iphone akron",
      "refurbished iphone akron ohio",
      "used ipad akron",
      "phone accessories akron",
    ],
  },
  {
    route: "/shop/[product]",
    label: "{product name}",
    h1: "{product name}",
    metaTitle: "{product name} | Pre-Owned | Speedy iRepair Akron",
    metaDescription:
      "Buy the {product name} certified pre-owned from Speedy iRepair in Akron, OH. Tested and inspected. Shop online or visit our West Market St store.",
    primaryKeyword: "{model} pre-owned akron",
    secondaryKeywords: ["used {model} akron", "certified pre-owned iphone akron"],
  },
  {
    route: "/sell-your-device",
    label: "Sell Your Device",
    h1: "Get top dollar for your old device.",
    metaTitle: "Sell My Phone Akron, OH | Trade-In Quotes | Speedy iRepair",
    metaDescription:
      "Sell or trade in your old or broken phone in Akron, OH. We compare top trade-in prices so you get the best deal. Get a quote, bring it in, get paid.",
    primaryKeyword: "sell my phone akron",
    secondaryKeywords: [
      "trade in phone akron",
      "sell broken iphone akron",
      "sell used phone akron ohio",
      "where to sell my phone near me",
    ],
  },
  {
    route: "/instant-quote",
    label: "Instant Quote",
    h1: "Get Your Phone Repair Quote",
    metaTitle: "Instant Phone Repair Quote in Akron, OH | Speedy iRepair",
    metaDescription:
      "Request a phone repair quote in Akron, OH. Tell us your device, model and issue: screen, battery, charger port, camera or water damage. Then book online.",
    primaryKeyword: "phone repair quote akron",
    secondaryKeywords: [
      "iphone repair cost akron",
      "screen repair quote akron",
      "samsung screen repair quote",
    ],
  },
  {
    route: "/schedule-repair",
    label: "Schedule Repair",
    h1: "Schedule Your Phone Repair in Akron",
    metaTitle: "Schedule a Phone Repair in Akron, OH | Speedy iRepair",
    metaDescription:
      "Book your phone repair online at Speedy iRepair, 1650 W Market St, Akron, OH. Most repairs done the same day in 45 minutes with a 90-day warranty.",
    primaryKeyword: "book phone repair akron",
    secondaryKeywords: [
      "iphone repair appointment akron",
      "same day phone repair akron",
      "phone repair open now akron",
    ],
  },
  {
    route: "/blog",
    label: "Blog",
    h1: "Repair tips & shop news",
    metaTitle: "Blog | Speedy iRepair Akron, OH",
    metaDescription:
      "Phone, tablet and computer repair tips, device care guides and shop news from Speedy iRepair in Akron, OH.",
    primaryKeyword: "phone repair tips akron",
    secondaryKeywords: ["phone care tips", "iphone battery tips", "speedy irepair news"],
  },
  {
    route: "/faq",
    label: "FAQ",
    h1: "Phone Repair FAQs",
    metaTitle: "Phone Repair FAQ: Times, Warranty & Payment | Akron, OH",
    metaDescription:
      "Answers on repair times, our 90-day warranty, payment methods, deposits, water damage and data backup from Speedy iRepair, Akron's phone repair shop.",
    primaryKeyword: "how long does phone repair take",
    secondaryKeywords: [
      "phone repair warranty",
      "iphone repair no upfront payment",
      "will i lose data phone repair",
    ],
  },
  {
    route: "/financing",
    label: "Financing",
    h1: "Phone Financing with Acima. No Credit Needed.",
    metaTitle: "Phone Financing in Akron, OH | Acima, No Credit Needed",
    metaDescription:
      "Get a smartphone or accessories now with Acima lease-to-own financing at Speedy iRepair in Akron, OH. No credit needed. Apply online through Acima today.",
    primaryKeyword: "phone financing no credit akron",
    secondaryKeywords: [
      "acima phone financing",
      "lease to own phone akron",
      "buy phone no credit check akron",
    ],
  },
  {
    route: "/home-internet",
    label: "Home Internet",
    h1: "Home Internet for $40/month. First month free. Free smartphone included.",
    metaTitle: "Home Internet Akron, OH $40/Month, First Month Free",
    metaDescription:
      "Home internet in Akron, OH for $40/month, first month free, plus a free smartphone when you sign up. Moving into a new home or apartment? Sign up today.",
    primaryKeyword: "home internet akron ohio",
    secondaryKeywords: [
      "internet service akron",
      "cheap internet akron",
      "internet for new apartment akron",
      "free phone with internet",
    ],
  },
  {
    route: "/policies/shipping-return",
    label: "Shipping & Return Policy",
    h1: "Shipping & Return Policy",
    metaTitle: "Shipping & Return Policy | Speedy iRepair Akron, OH",
    metaDescription:
      "Speedy iRepair shipping and returns: domestic orders ship in 7-10 business days with tracking. 30-day returns on unused items in original packaging.",
    primaryKeyword: "speedy irepair return policy",
    secondaryKeywords: [],
  },
  {
    route: "/policies/privacy",
    label: "Privacy Policy",
    h1: "Privacy Policy",
    metaTitle: "Privacy Policy | Speedy iRepair Phone Repair, Akron, OH",
    metaDescription:
      "Read the Speedy iRepair privacy policy: what personal information we collect on speedyirepair.com, how we use and share it, and your choices. Akron, OH.",
    primaryKeyword: "speedy irepair privacy policy",
    secondaryKeywords: [],
  },
  {
    route: "/policies/terms",
    label: "Terms & Conditions",
    h1: "Terms & Conditions",
    metaTitle: "Terms & Conditions | Speedy iRepair Phone Repair, Akron OH",
    metaDescription:
      "Read the terms and conditions for using speedyirepair.com and buying from Speedy iRepair, the Akron, OH phone repair shop and pre-owned device store.",
    primaryKeyword: "speedy irepair terms",
    secondaryKeywords: [],
  },
];

/** Product meta builders (titles 50–60, descriptions 120–155 when the name allows). */
export function productMetaTitle(name: string): string {
  const variants = [
    `${name} | Pre-Owned | Speedy iRepair Akron`,
    `${name} | Speedy iRepair Akron, OH`,
    `${name} | Speedy iRepair Akron`,
    `${name} | Speedy iRepair`,
  ];
  return (
    variants.find((v) => v.length >= 50 && v.length <= 60) ??
    variants.find((v) => v.length <= 60) ??
    name.slice(0, 60)
  );
}
export function productMetaDescription(name: string): string {
  const variants = [
    `Buy the ${name} certified pre-owned from Speedy iRepair in Akron, OH. Tested and inspected. Shop online or visit our West Market St store.`,
    `Buy the ${name} certified pre-owned from Speedy iRepair in Akron, OH. Tested and inspected. Shop online or visit our store.`,
    `${name}, certified pre-owned from Speedy iRepair in Akron, OH. Tested and inspected. Shop online or visit us.`,
  ];
  return (
    variants.find((v) => v.length >= 120 && v.length <= 155) ??
    variants.find((v) => v.length <= 155) ??
    variants[2].slice(0, 155)
  );
}

export interface ServiceSeo {
  slug: string;
  /** Section heading on /services (H2) — exact name from spec §2.2 */
  name: string;
  serviceType: string;
  /** Featured-snippet first paragraph: direct, factual, 40–60 words. Verified by scripts/validate.mjs */
  snippet: string;
  /** Optional supporting paragraph (facts from brief only). */
  detail?: string;
  cta: { label: string; href: string }[];
}

export const SERVICES: ServiceSeo[] = [
  {
    slug: "screen-repair",
    name: "Screen Repair",
    serviceType: "Smartphone screen repair",
    snippet:
      "Speedy iRepair replaces cracked and broken smartphone screens at our shop at 1650 W Market St in Akron, Ohio. We repair Apple, Samsung, LG, Google, Motorola, and OnePlus phones. Most screen repairs are completed the same day in 45 minutes, and every repair is covered by our 90-day warranty.",
    detail:
      "There is no upfront payment for iPhone repairs. Android repairs require a $20 deposit. If replacement parts need to be ordered, they arrive in 3-4 days from our warehouse.",
    cta: [
      { label: "Schedule Repair", href: "/repair" },
      { label: "Get Instant Quote", href: "/instant-quote" },
    ],
  },
  {
    slug: "battery-replacement",
    name: "Battery Replacement",
    serviceType: "Smartphone battery replacement",
    snippet:
      "Speedy iRepair replaces worn-out smartphone batteries in Akron, Ohio. If your phone dies quickly or won't hold a charge, walk in to our 1650 W Market St shop or book online. iPhone repairs typically take 45-60 minutes, most Android repairs take 1-2 hours, and all repairs carry our 90-day warranty.",
    cta: [
      { label: "Schedule Repair", href: "/repair" },
      { label: "Get Instant Quote", href: "/instant-quote" },
    ],
  },
  {
    slug: "charger-port-repair",
    name: "Charger Port Repair",
    serviceType: "Smartphone charging port repair",
    snippet:
      "Speedy iRepair repairs damaged and loose smartphone charger ports in Akron, Ohio. If your phone won't charge or the cable won't stay connected, we can fix the port on Apple, Samsung, LG, Google, and other devices. iPhone repairs typically take 45-60 minutes, and every repair is backed by our 90-day warranty.",
    cta: [
      { label: "Schedule Repair", href: "/repair" },
      { label: "Get Instant Quote", href: "/instant-quote" },
    ],
  },
  {
    slug: "camera-repair",
    name: "Camera Repair",
    serviceType: "Smartphone camera repair",
    snippet:
      "Speedy iRepair fixes broken smartphone cameras in Akron, Ohio, including blurry, cracked, or non-working front and rear cameras. We repair Apple, Samsung, LG, Google, and other devices at 1650 W Market St. iPhone repairs typically take 45-60 minutes, most Android repairs take 1-2 hours, and all repairs include our 90-day warranty.",
    cta: [
      { label: "Schedule Repair", href: "/repair" },
      { label: "Get Instant Quote", href: "/instant-quote" },
    ],
  },
  {
    slug: "water-damage-inspection",
    name: "Water Damage Inspection",
    serviceType: "Water damage inspection",
    snippet:
      "Speedy iRepair inspects water-damaged smartphones at our Akron, Ohio shop at 1650 W Market St. We can try to preserve your data, but we cannot guarantee full functionality after a water damage inspection. If we find damage that affects functionality beyond the repair, we will let you know before any work begins.",
    detail:
      "We recommend backing up your data via iCloud, Google, or other cloud services whenever you can.",
    cta: [{ label: "Schedule Repair", href: "/repair" }],
  },
  {
    slug: "device-unlocking",
    name: "Device Unlocking",
    serviceType: "Carrier unlocking",
    snippet:
      "Speedy iRepair unlocks smartphones from any carrier at our shop at 1650 W Market St in Akron, Ohio. An unlocked phone can be used with a different carrier, including the Simple Mobile, AT&T, and Verizon prepaid plans we offer in store. Call 1.855.377.3339 or visit the store to get started.",
    cta: [
      { label: "Call 1.855.377.3339", href: "tel:+18553773339" },
      { label: "Get Directions", href: "https://goo.gl/maps/hx2oTBFB18LNoMW36" },
    ],
  },
  {
    slug: "certified-pre-owned-devices",
    name: "Certified Pre-Owned Devices",
    serviceType: "Certified pre-owned device sales",
    snippet:
      "Speedy iRepair sells certified pre-owned Apple devices in Akron, Ohio, including tested and inspected iPhones, iPads, Apple Watch models, and MacBooks, plus accessories. Shop online or visit our store at 1650 W Market St. Financing is available through Acima with no credit needed, and phones not currently in stock require 50% down.",
    cta: [{ label: "Shop", href: "/shop" }],
  },
  {
    slug: "sell-trade-your-device",
    name: "Sell / Trade Your Device",
    serviceType: "Device trade-in and buyback",
    snippet:
      "Speedy iRepair buys and trades in used and broken smartphones in Akron, Ohio. We compare top trade-in prices so you get the best deal for your device. Get a quote, bring your device in or mail it, and get paid. We accept Apple, Samsung, LG, Google, Motorola, and OnePlus devices.",
    cta: [{ label: "Sell Your Device", href: "/sell-your-device" }],
  },
  {
    slug: "prepaid-phone-plans",
    name: "Prepaid Phone Plans (Simple Mobile, AT&T, Verizon)",
    serviceType: "Prepaid wireless plans",
    snippet:
      "Speedy iRepair offers Simple Mobile, AT&T, and Verizon prepaid phone plans at our store at 1650 W Market St in Akron, Ohio. Prepaid plans help you save money every month. Visit the store or call 1.855.377.3339, and we will help you choose a plan and get your phone connected.",
    cta: [
      { label: "Get Directions", href: "https://goo.gl/maps/hx2oTBFB18LNoMW36" },
      { label: "Call 1.855.377.3339", href: "tel:+18553773339" },
    ],
  },
  {
    slug: "bill-payment-services",
    name: "Bill Payment Services (water, electric, gas)",
    serviceType: "Utility bill payment",
    snippet:
      "Speedy iRepair offers bill payment services at our store at 1650 W Market St in Akron, Ohio. Pay your water, electric, and gas bills in person at our location, in the same visit as a phone repair, prepaid plan, or device purchase. Use Get Directions to find us on West Market Street.",
    cta: [{ label: "Get Directions", href: "https://goo.gl/maps/hx2oTBFB18LNoMW36" }],
  },
  {
    slug: "home-internet",
    name: "Home Internet ($40/mo, first month free, free phone with signup)",
    serviceType: "Home internet service",
    snippet:
      "Speedy iRepair offers home internet in Akron, Ohio for $40 per month, with the first month free and a free smartphone when you sign up. It is a great fit for anyone moving into a new home, townhome, condo, or apartment. Sign up with our online form or visit our store at 1650 W Market St.",
    cta: [{ label: "Sign Up", href: "/home-internet" }],
  },
  {
    slug: "financing",
    name: "Financing (Acima, no credit)",
    serviceType: "Lease-to-own financing",
    snippet:
      "Speedy iRepair offers financing through Acima, a lease-to-own option with no credit needed. Use it to take home a smartphone, accessories, and more from our store at 1650 W Market St in Akron, Ohio. Select Apply Now to start your Acima application online, then shop with us in store or online.",
    cta: [
      {
        label: "Apply Now",
        href: "https://ecom.acimacredit.com/views/phone-auth/ecom-merchant-813293c2-9f1e-4987-8b83-6691e6baf75e?redirect=application",
      },
      { label: "Learn More", href: "/financing" },
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    serviceType: "Smartphone accessories",
    snippet:
      "Speedy iRepair sells smartphone accessories in Akron, Ohio, alongside certified pre-owned iPhones, iPads, Apple Watch models, and MacBooks. Browse accessories in our online shop or visit our store at 1650 W Market St. We accept all major credit and debit cards, PayPal, and Venmo, and Acima financing needs no credit.",
    cta: [{ label: "Shop", href: "/shop" }],
  },
  {
    slug: "replacement-parts",
    name: "Replacement Parts (premium quality)",
    serviceType: "Premium replacement parts",
    snippet:
      "Speedy iRepair uses premium-quality replacement parts for every smartphone repair at our Akron, Ohio shop. All repairs are covered under our 90-day warranty; damage to your device after repair voids the warranty. Most repairs are done the same day in 45 minutes, and parts that need ordering arrive in 3-4 days.",
    cta: [{ label: "Schedule Repair", href: "/repair" }],
  },
];

/** The 8 FAQs — VERBATIM from spec §2.1.8. Used on / and /faq. */
export const CORE_FAQS: FaqItem[] = [
  {
    question: "How long does the average repair take?",
    answer:
      "iPhone repairs typically take 45-60 minutes. Most Android repairs take 1-2 hours, unless replacement parts need to be ordered (3-4 days from our warehouse).",
  },
  {
    question: "Do you offer a warranty on replacement parts?",
    answer:
      "All repairs are covered under our 90-day warranty. Damage to your device after repair voids the warranty.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "All major credit and debit cards, PayPal, and Venmo.",
  },
  {
    question: "Do you only repair screens?",
    answer: "No. We repair batteries, charger ports, cameras, speakers, and much more.",
  },
  {
    question: "Can you fix water-damaged devices?",
    answer:
      "We can try to preserve your data, but cannot guarantee full functionality after water damage inspection.",
  },
  {
    question: "Do I have to pay upfront?",
    answer:
      "No upfront payment for iPhone repairs. $20 deposit required on all Android repairs. 50% down on phone purchases not currently in stock.",
  },
  {
    question: "Will my phone look and function the same after repair?",
    answer:
      "Yes. If there is any damage that affects functionality beyond the repair, we will let you know beforehand.",
  },
  {
    question: "Will I lose my data during repair?",
    answer:
      "There is a small possibility. We recommend backing up your data via iCloud, Google, or other cloud services before bringing your device in.",
  },
];

/** NEW draft FAQs (facts from brief only) — DRAFT, needs CMS/Abdullah review before publish. */
export const SERVICES_FAQS: FaqItem[] = [
  {
    draft: true,
    question: "Which phone brands do you repair?",
    answer:
      "We repair Apple, Samsung, LG, Google Pixel, Motorola, and OnePlus devices, plus other brands.",
  },
  {
    draft: true,
    question: "Do I need an appointment for a repair?",
    answer: "No. You can walk in or book online on our Schedule Repair page.",
  },
  {
    draft: true,
    question: "Where is Speedy iRepair located?",
    answer: "Our store is at 1650 W Market St #27, Akron, OH 44313. Call us at 1.855.377.3339.",
  },
  {
    draft: true,
    question: "Can I sell or trade in a broken phone?",
    answer:
      "Yes. We compare top trade-in prices for your old or broken device. Get a quote, bring it in or mail it, and get paid.",
  },
  {
    draft: true,
    question: "Which prepaid phone plans do you offer?",
    answer: "We offer Simple Mobile, AT&T, and Verizon prepaid phone plans.",
  },
  {
    draft: true,
    question: "Can I pay my utility bills at your store?",
    answer: "Yes. You can pay your water, electric, and gas bills at our location.",
  },
];

export const FINANCING_FAQS: FaqItem[] = [
  {
    draft: true,
    question: "What is Acima?",
    answer:
      "Acima is a lease-to-own financing option available at Speedy iRepair. No credit is needed.",
  },
  {
    draft: true,
    question: "Do I need good credit to use Acima financing?",
    answer: "No. Acima lease-to-own financing at Speedy iRepair requires no credit.",
  },
  {
    draft: true,
    question: "What can I finance?",
    answer: "You can use Acima to finance smartphones, accessories, and more from Speedy iRepair.",
  },
  {
    draft: true,
    question: "How do I apply?",
    answer: "Select Apply Now on this page to start your application on the Acima website.",
  },
];

export const HOME_INTERNET_FAQS: FaqItem[] = [
  {
    draft: true,
    question: "How much does home internet cost?",
    answer: "Home internet is $40 per month, and your first month is free.",
  },
  {
    draft: true,
    question: "Do I really get a free smartphone?",
    answer: "Yes. You get a free smartphone when you sign up for home internet.",
  },
  {
    draft: true,
    question: "Who is this home internet offer for?",
    answer: "It is for individuals moving into a new home, townhome, condo, or apartment.",
  },
  {
    draft: true,
    question: "How do I sign up?",
    answer:
      "Fill out the signup form on this page or visit our store at 1650 W Market St #27, Akron, OH 44313.",
  },
];

/** Homepage "Why Choose Us" (spec §2.1.5) — marked speakable. */
export const VALUE_PROPS = [
  "Same-Day Repairs (most done in 45 min)",
  "90-Day Warranty (on all replacement parts)",
  "No Upfront Payment for iPhone Repairs",
  "Certified Pre-Owned Devices",
  "Acima Financing (no credit needed)",
  "Spectrum Authorized Retailer",
];

export const HERO = {
  h1: "Cracked screen? Dead battery? We fix it in 45 minutes.",
  // Founding year OMITTED per decision OQ-01.
  subline: "Akron's trusted phone repair shop. Walk in or book online.",
};

/** Primary navigation (SiteNavigationElement). Mirrors header nav — keep in sync with Frontend. */
export const MAIN_NAV: { name: string; path: string }[] = [
  // = cms/SCHEMA_CONTRACT.md §2.2 navigation.headerLinks (7) + headerCta (Schedule Repair). Visible header only.
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Shop", path: "/shop" },
  { name: "Sell Your Device", path: "/sell-your-device" },
  { name: "Instant Quote", path: "/instant-quote" },
  { name: "FAQ", path: "/faq" },
  { name: "Schedule Repair", path: "/repair" },
];

/** CSS selectors the Frontend must put on the elements (see INTEGRATION_NOTES.md). */
export const SPEAKABLE_SELECTORS = ["#hero-title", "#why-choose-us"];

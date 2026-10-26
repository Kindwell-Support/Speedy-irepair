/**
 * Collection fixtures populated VERBATIM from PROJECT_SPEC.md (sections noted inline).
 * Anything not in the spec is a visible placeholder (isPlaceholder: true). Never invent facts.
 */
import type {
  Brand,
  Faq,
  HowItWorksStep,
  Promotion,
  Service,
  ServiceCard,
  TeamMember,
  Testimonial,
  ValueProp,
} from "../types";
import { EXTERNAL_LINKS } from "./business";
import { blocks, PLACEHOLDER } from "./helpers";

const scheduleCta = { label: "Schedule Repair", href: "/schedule-repair", variant: "primary" } as const;
const quoteCta = { label: "Get Instant Quote", href: "/instant-quote", variant: "secondary" } as const;
const callCta = { label: "Call us", href: "tel:+18553773339", variant: "secondary" } as const;
const visitCta = { label: "Visit store", href: "/#location", variant: "secondary" } as const;
const directionsCta = { label: "Get Directions", href: EXTERNAL_LINKS.maps, external: true, variant: "secondary" } as const;
const shopCta = { label: "Shop", href: "/shop", variant: "primary" } as const;

const bodyPending = blocks(PLACEHOLDER("full service description, CMS & Content Engineer (REQ-047/049)"));
const summaryNote =
  "Summary uses facts from the brief only. CMS & Content Engineer expands it into a 40–60-word featured-snippet paragraph (REQ-049) and writes the body.";

/** Spec 2.2: 14 services, in this order (REQ-045). */
const serviceSeeds: Omit<Service, "body" | "isPlaceholder" | "sourceNote">[] = [
  { id: "s01", slug: "screen-repair", title: "Screen Repair", summary: "Cracked screen repair for Apple, Samsung, LG, Google and more in Akron, OH. Most repairs are done the same day in 45 minutes, with a 90-day warranty.", ctas: [scheduleCta, quoteCta], riveIcon: "screen-repair", order: 1 },
  { id: "s02", slug: "battery-replacement", title: "Battery Replacement", summary: "Battery replacement for iPhone, Samsung, LG, Google and other devices. Covered by our 90-day warranty.", ctas: [scheduleCta, quoteCta], riveIcon: "battery", order: 2 },
  { id: "s03", slug: "charger-port-repair", title: "Charger Port Repair", summary: "Charger port repair for Apple, Samsung, LG, Google and other devices. Covered by our 90-day warranty.", ctas: [scheduleCta, quoteCta], riveIcon: "charger-port", order: 3 },
  { id: "s04", slug: "camera-repair", title: "Camera Repair", summary: "Camera repair for Apple, Samsung, LG, Google and other devices. Covered by our 90-day warranty.", ctas: [scheduleCta, quoteCta], riveIcon: "camera", order: 4 },
  { id: "s05", slug: "water-damage-inspection", title: "Water Damage Inspection", summary: "Water damage inspection. We can try to preserve your data, but cannot guarantee full functionality after water damage inspection.", ctas: [scheduleCta], riveIcon: "water-damage", order: 5 },
  { id: "s06", slug: "device-unlocking", title: "Device Unlocking", summary: "Unlock your phone from any carrier.", ctas: [callCta, visitCta], riveIcon: "device-unlocking", order: 6 },
  { id: "s07", slug: "certified-pre-owned-devices", title: "Certified Pre-Owned Devices", summary: "Buy a pre-owned iPhone, iPad, Apple Watch, MacBook and accessories.", ctas: [shopCta], riveIcon: "pre-owned", order: 7 },
  { id: "s08", slug: "sell-trade-your-device", title: "Sell / Trade Your Device", summary: "Compare top trade-in prices and get the best deal for your old or broken device.", ctas: [{ label: "Sell Your Device", href: "/sell-your-device", variant: "primary" }], riveIcon: "sell-trade", order: 8 },
  { id: "s09", slug: "prepaid-phone-plans", title: "Prepaid Phone Plans", summary: "Simple Mobile, AT&T and Verizon prepaid plans. Save money every month.", ctas: [visitCta, callCta], riveIcon: "prepaid-plans", order: 9 },
  { id: "s10", slug: "bill-payment-services", title: "Bill Payment Services", summary: "Pay water, electric and gas bills at our location.", ctas: [visitCta, directionsCta], riveIcon: "bill-payment", order: 10 },
  { id: "s11", slug: "home-internet", title: "Home Internet", summary: "Home internet for $40/month, first month free, with a free smartphone when you sign up.", ctas: [{ label: "Sign up", href: "/home-internet", variant: "primary" }, { label: "Sign-up form", href: EXTERNAL_LINKS.homeInternetSignup, external: true, variant: "secondary" }], riveIcon: "home-internet", order: 11 },
  { id: "s12", slug: "financing", title: "Financing", summary: "Acima lease-to-own financing. No credit needed.", ctas: [{ label: "Apply Now", href: EXTERNAL_LINKS.financing, external: true, variant: "primary" }, { label: "Financing details", href: "/financing", variant: "secondary" }], riveIcon: "financing", order: 12 },
  { id: "s13", slug: "accessories", title: "Accessories", summary: "Shop phone accessories.", ctas: [shopCta], riveIcon: "accessories", order: 13 },
  { id: "s14", slug: "replacement-parts", title: "Replacement Parts", summary: "Premium quality replacement parts, covered by our 90-day warranty.", ctas: [scheduleCta], riveIcon: "replacement-parts", order: 14 },
];
export const services: Service[] = serviceSeeds.map((s) => ({
  ...s,
  body: bodyPending,
  isPlaceholder: true,
  sourceNote: summaryNote,
}));

/** Spec 2.1.2: homepage cards C1–C8 (REQ-019/020/023/024). */
export const serviceCards: ServiceCard[] = [
  { id: "c1", title: "Smartphone Repair", description: "Screen, battery, charger port, camera, water damage and more for Apple, Samsung, LG and Google. 90-day warranty, most repairs done same day in 45 min.", href: "/services#screen-repair", riveIcon: "smartphone-repair", order: 1 },
  { id: "c2", title: "Certified Pre-Owned Devices", description: "Buy a pre-owned iPhone, iPad, Apple Watch, MacBook and accessories.", href: "/services#certified-pre-owned-devices", riveIcon: "pre-owned", order: 2 },
  { id: "c3", title: "Sell / Trade Your Device", description: "Compare top trade-in prices and get the best deal.", href: "/services#sell-trade-your-device", riveIcon: "sell-trade", order: 3 },
  { id: "c4", title: "Prepaid Phone Plans", description: "Simple Mobile, AT&T and Verizon prepaid plans. Save money every month.", href: "/services#prepaid-phone-plans", riveIcon: "prepaid-plans", order: 4 },
  { id: "c5", title: "Bill Payment Services", description: "Pay water, electric and gas bills at our location.", href: "/services#bill-payment-services", riveIcon: "bill-payment", order: 5 },
  { id: "c6", title: "Home Internet", description: "$40/month, first month FREE. Free smartphone with signup.", href: "/services#home-internet", riveIcon: "home-internet", order: 6 },
  { id: "c7", title: "Financing", description: "Acima lease-to-own, no credit needed.", href: "/services#financing", externalLink: { label: "Apply with Acima", href: EXTERNAL_LINKS.financing, external: true }, riveIcon: "financing", order: 7 },
  { id: "c8", title: "Device Unlocking", description: "Unlock your phone from any carrier.", href: "/services#device-unlocking", riveIcon: "device-unlocking", order: 8 },
];

/** Spec 2.1.8: 8 FAQs, answers VERBATIM (REQ-034/069). */
export const faqs: Faq[] = [
  { id: "faq-1", question: "How long does the average repair take?", answer: "iPhone repairs typically take 45-60 minutes. Most Android repairs take 1-2 hours, unless replacement parts need to be ordered (3-4 days from our warehouse).", categories: ["general", "services"], order: 1 },
  { id: "faq-2", question: "Do you offer a warranty on replacement parts?", answer: "All repairs are covered under our 90-day warranty. Damage to your device after repair voids the warranty.", categories: ["general", "services"], order: 2 },
  { id: "faq-3", question: "What payment methods do you accept?", answer: "All major credit and debit cards, PayPal, and Venmo.", categories: ["general"], order: 3 },
  { id: "faq-4", question: "Do you only repair screens?", answer: "No. We repair batteries, charger ports, cameras, speakers, and much more.", categories: ["general", "services"], order: 4 },
  { id: "faq-5", question: "Can you fix water-damaged devices?", answer: "We can try to preserve your data, but cannot guarantee full functionality after water damage inspection.", categories: ["general", "services"], order: 5 },
  { id: "faq-6", question: "Do I have to pay upfront?", answer: "No upfront payment for iPhone repairs. $20 deposit required on all Android repairs. 50% down on phone purchases not currently in stock.", categories: ["general", "services"], order: 6 },
  { id: "faq-7", question: "Will my phone look and function the same after repair?", answer: "Yes. If there is any damage that affects functionality beyond the repair, we will let you know beforehand.", categories: ["general", "services"], order: 7 },
  { id: "faq-8", question: "Will I lose my data during repair?", answer: "There is a small possibility. We recommend backing up your data via iCloud, Google, or other cloud services before bringing your device in.", categories: ["general", "services"], order: 8 },
  // OQ-16: financing + internet FAQ content TBD. Placeholders are excluded from FAQPage JSON-LD.
  { id: "faq-fin-1", question: PLACEHOLDER("Financing FAQ question 1"), answer: PLACEHOLDER("answer, CMS to draft from brief facts for Abdullah review"), categories: ["financing"], order: 101, isPlaceholder: true },
  { id: "faq-fin-2", question: PLACEHOLDER("Financing FAQ question 2"), answer: PLACEHOLDER("answer"), categories: ["financing"], order: 102, isPlaceholder: true },
  { id: "faq-net-1", question: PLACEHOLDER("Home Internet FAQ question 1"), answer: PLACEHOLDER("answer, CMS to draft from brief facts for Abdullah review"), categories: ["internet"], order: 201, isPlaceholder: true },
  { id: "faq-net-2", question: PLACEHOLDER("Home Internet FAQ question 2"), answer: PLACEHOLDER("answer"), categories: ["internet"], order: 202, isPlaceholder: true },
];

/** Spec 2.1.5 (REQ-029). */
export const valueProps: ValueProp[] = [
  { id: "vp-1", title: "Same-Day Repairs", detail: "Most done in 45 min", speakable: true, order: 1 },
  { id: "vp-2", title: "90-Day Warranty", detail: "On all replacement parts", speakable: true, order: 2 },
  { id: "vp-3", title: "No Upfront Payment for iPhone Repairs", detail: null, speakable: true, order: 3 },
  { id: "vp-4", title: "Certified Pre-Owned Devices", detail: null, speakable: false, order: 4 },
  { id: "vp-5", title: "Acima Financing", detail: "No credit needed", speakable: false, order: 5 },
  { id: "vp-6", title: "Spectrum Authorized Retailer", detail: null, speakable: true, order: 6 },
];

/** Spec 2.1.3 (home, REQ-025), 2.5 (sell, REQ-057), 2.10 (financing, copy TBD). */
export const howItWorksSteps: HowItWorksStep[] = [
  { id: "home-1", set: "home", title: "Get a Quote", body: "Use our instant quote tool or call us", order: 1 },
  { id: "home-2", set: "home", title: "Bring Your Device", body: "Walk in or schedule an appointment", order: 2 },
  { id: "home-3", set: "home", title: "We Fix It", body: "Most repairs done in 45 minutes while you wait", order: 3 },
  { id: "home-4", set: "home", title: "Walk Out Happy", body: "90-day warranty on all repairs", order: 4 },
  { id: "sell-1", set: "sell", title: "Get a quote", body: null, order: 1 },
  { id: "sell-2", set: "sell", title: "Bring it in or mail it", body: null, order: 2 },
  { id: "sell-3", set: "sell", title: "Get paid", body: null, order: 3 },
  { id: "fin-1", set: "financing", title: PLACEHOLDER("Financing step 1"), body: PLACEHOLDER("CMS drafts generic, factual step for Abdullah review (OQ-16)"), order: 1, isPlaceholder: true },
  { id: "fin-2", set: "financing", title: PLACEHOLDER("Financing step 2"), body: PLACEHOLDER("step copy"), order: 2, isPlaceholder: true },
  { id: "fin-3", set: "financing", title: PLACEHOLDER("Financing step 3"), body: PLACEHOLDER("step copy"), order: 3, isPlaceholder: true },
];

/** Spec 2.1.7 (REQ-033). */
export const promotions: Promotion[] = [
  { id: "promo-1", title: "FREE Smartphone when you sign up for Home Internet", body: null, cta: { label: "Sign up", href: EXTERNAL_LINKS.homeInternetSignup, external: true }, order: 1 },
  { id: "promo-2", title: "Home Internet at $40/month, first month FREE", body: null, cta: { label: "Learn more", href: "/home-internet" }, order: 2 },
  { id: "promo-3", title: "Financing available through Acima. No credit needed.", body: null, cta: { label: "Apply Now", href: EXTERNAL_LINKS.financing, external: true }, order: 3 },
];

/** Spec 2.1.4 + 2.5 (REQ-027/059). Logos: official assets per OQ-21 (Design Lead), none bundled yet. */
export const brands: Brand[] = [
  { id: "brand-apple", name: "Apple", shortName: "Apple", logo: null, repairs: true, acceptsTradeIn: true, order: 1 },
  { id: "brand-samsung", name: "Samsung", shortName: "Samsung", logo: null, repairs: true, acceptsTradeIn: true, order: 2 },
  { id: "brand-lg", name: "LG", shortName: "LG", logo: null, repairs: true, acceptsTradeIn: true, order: 3 },
  { id: "brand-google", name: "Google Pixel", shortName: "Google", logo: null, repairs: true, acceptsTradeIn: true, order: 4 },
  { id: "brand-motorola", name: "Motorola", shortName: "Motorola", logo: null, repairs: true, acceptsTradeIn: true, order: 5 },
  { id: "brand-oneplus", name: "OnePlus", shortName: "OnePlus", logo: null, repairs: true, acceptsTradeIn: true, order: 6 },
];

/** Decision #4 / OQ-06: NO invented reviews. 3 clearly-placeholder slots until real, attributable reviews are entered in Sanity. */
export const testimonials: Testimonial[] = [1, 2, 3].map((n) => ({
  id: `testimonial-placeholder-${n}`,
  author: PLACEHOLDER(`Reviewer name ${n}`),
  rating: 5,
  text: PLACEHOLDER("real Google review text, entered verbatim in Sanity with source URL"),
  source: "google",
  sourceUrl: null,
  date: null,
  isPlaceholder: true,
  sourceNote: "Placeholder slot. Replace with a verbatim, attributable Google review.",
}));

/** OQ-15: team content TBD. */
export const teamMembers: TeamMember[] = [1, 2].map((n) => ({
  id: `team-placeholder-${n}`,
  name: PLACEHOLDER(`Team member ${n}`),
  role: PLACEHOLDER("Role"),
  bio: PLACEHOLDER("Short bio supplied by the client"),
  photo: null,
  order: n,
  isPlaceholder: true,
}));

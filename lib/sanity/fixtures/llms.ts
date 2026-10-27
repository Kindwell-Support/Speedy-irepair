import type { LlmsDocument } from "../types";
import { brands, faqs, services } from "./collections";
import { businessInfo, EXTERNAL_LINKS } from "./business";

/** Spec 5.3: EXACT initial llms.txt content (REQ-131). Do not reformat. */
export const LLMS_TXT = `# Speedy iRepair
> Smartphone repair, pre-owned devices, prepaid wireless plans, bill payment, and home internet in Akron, Ohio.

## About
Speedy iRepair is a locally owned smartphone repair shop at 1650 W Market St, Akron, OH 44313. We fix iPhone, Samsung, LG, Google, and other devices. Most screen repairs are completed same day in 45 minutes. We are a Spectrum Authorized Retailer.

## Services
- Smartphone Repair: Screen, battery, charger port, camera, water damage. 90-day warranty. Most done in 45 minutes.
- Certified Pre-Owned Devices: Buy tested, inspected iPhones, iPads, Apple Watch, MacBooks, and accessories.
- Sell / Trade Your Device: Compare top trade-in prices for your old or broken device.
- Prepaid Phone Plans: Simple Mobile, AT&T, and Verizon prepaid plans.
- Bill Payment Services: Pay water, electric, and gas bills at our location.
- Home Internet: first month free, free smartphone with signup.
- Financing: Acima lease-to-own. No credit needed.
- Device Unlocking: Unlock your phone from any carrier.

## Contact
Phone: 1.855.377.3339
Email: info@speedyirepair.com
Address: 1650 W Market St #27, Akron, OH 44313

## Links
- https://speedyirepair.com
- https://speedyirepair.com/services
- https://speedyirepair.com/shop
- https://speedyirepair.com/instant-quote
- https://speedyirepair.com/schedule-repair
`;

/**
 * Spec 5.3: llms-full.txt = llms.txt expanded with full service descriptions, all 8 FAQs, shipping/return
 * summary, financing details and the full brands list (REQ-132). Generated ONLY from fixture facts.
 * SEO/AEO/GEO Specialist owns final wording (Sanity llmsDocument.llmsFull overrides this when set).
 */
export function buildLlmsFull(): string {
  const realFaqs = faqs.filter((f) => !f.isPlaceholder && f.categories.includes("general"));
  const hours = businessInfo.hoursIsPlaceholder
    ? businessInfo.hoursPlaceholderText
    : businessInfo.hours
        .map((h) => `${h.day}: ${h.closed ? "Closed" : `${h.opens}–${h.closes}`}`)
        .join("; ");
  return [
    LLMS_TXT.trimEnd(),
    "",
    "## Service details",
    ...services.map((s) => `### ${s.title}\n${s.summary}`),
    "",
    "## Brands we repair",
    brands.map((b) => b.name).join(", "),
    "",
    "## Frequently asked questions",
    ...realFaqs.map((f) => `### ${f.question}\n${f.answer}`),
    "",
    "## Financing",
    `Acima lease-to-own financing. No credit needed. Apply: ${EXTERNAL_LINKS.financing}`,
    "",
    "## Shipping & returns (summary)",
    "- Domestic: most orders ship within 7-10 business days via ePacket Mail (first class) with tracking.",
    "- Returns: within 30 days; item must be unused, in the same condition and in the original packaging.",
    "- Non-returnable: phone accessories, chargers, screen protectors, SIM cards, items with no serial number, gift cards, downloadable software.",
    "- Refunds: processed to the original payment method within 3 business days after approval.",
    "- Sale items: only regular-priced items are refundable, except electronics found to not work properly.",
    "- Exchanges: email info@speedyirepair.com and mail the item to ATTN: RMA Dept.",
    "- International: First Class Mail (14-30 days); customs fees and taxes are the customer's responsibility.",
    "- Returned to sender: re-shipment at the customer's expense; initial shipping is non-refundable.",
    "Full policy: https://speedyirepair.com/policies/shipping-return",
    "",
    "## Hours",
    hours,
    "",
  ].join("\n");
}

export const llmsDocument: LlmsDocument = { llms: LLMS_TXT, llmsFull: buildLlmsFull() };

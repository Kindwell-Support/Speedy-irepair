import type { RiveIconKey } from "@/components/rive/manifest";

export const SERVICES: { id: string; rive: RiveIconKey; title: string; desc: string; badge?: string }[] = [
  { id: "C1", rive: "icon-repair", title: "Smartphone Repair", desc: "Screen, battery, charger port, camera, water damage and more. Most repairs done same day in 45 minutes.", badge: "Most popular" },
  { id: "C2", rive: "icon-preowned", title: "Pre-Owned Devices", desc: "Tested, certified pre-owned iPhones and Androids with a warranty." },
  { id: "C3", rive: "icon-trade", title: "Sell or Trade", desc: "Get a fair offer for your old device, in store or online." },
  { id: "C4", rive: "icon-plans", title: "Prepaid Plans", desc: "Activate or refill prepaid plans at the counter." },
  { id: "C5", rive: "icon-bill", title: "Bill Payment", desc: "Pay your phone, utility and other bills in one stop." },
  { id: "C6", rive: "icon-internet", title: "Home Internet", desc: "Set up home internet service with local help." },
  { id: "C7", rive: "icon-financing", title: "Financing", desc: "Flexible lease-to-own options for devices and repairs." },
  { id: "C8", rive: "icon-unlock", title: "Device Unlocking", desc: "Unlock your phone to use it on any carrier." },
];

export const STEPS = [
  { n: "01", title: "Get a Quote", body: "Use our instant quote tool or call us." },
  { n: "02", title: "Bring Your Device", body: "Walk in or schedule an appointment." },
  { n: "03", title: "We Fix It", body: "Most repairs done in 45 minutes while you wait." },
  { n: "04", title: "Walk Out Happy", body: "90-day warranty on all repairs." },
];

export const BRANDS = ["Apple", "Samsung", "LG", "Google Pixel", "Motorola", "OnePlus"];

export const VALUE_PROPS = [
  { id: "fast", title: "45-minute repairs", detail: "Most iPhone repairs are done while you wait." },
  { id: "warranty", title: "90-day warranty", detail: "Every repair is covered for 90 days." },
  { id: "upfront", title: "No upfront payment", detail: "No upfront payment for iPhone repairs." },
  { id: "brands", title: "All major brands", detail: "Apple, Samsung, LG, Google and more." },
  { id: "local", title: "Local Akron shop", detail: "One counter on W Market St." },
  { id: "honest", title: "Honest advice", detail: "We tell you before we fix anything extra." },
];

export const FAQS = [
  { q: "How long does the average repair take?", a: "iPhone repairs typically take 45-60 minutes. Most Android repairs take 1-2 hours, unless replacement parts need to be ordered (3-4 days from our warehouse)." },
  { q: "Do you offer a warranty on replacement parts?", a: "All repairs are covered under our 90-day warranty. Damage to your device after repair voids the warranty." },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards, PayPal, and Venmo." },
  { q: "Do you only repair screens?", a: "No. We repair batteries, charger ports, cameras, speakers, and much more." },
  { q: "Can you fix water-damaged devices?", a: "We can try to preserve your data, but cannot guarantee full functionality after water damage inspection." },
  { q: "Do I have to pay upfront?", a: "No upfront payment for iPhone repairs. $20 deposit required on all Android repairs. 50% down on phone purchases not currently in stock." },
];

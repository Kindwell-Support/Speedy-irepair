/**
 * CMS v1.6: full /services descriptions (REQ-047/049), one entry per spec §2.2 service, keyed by slug.
 * Facts come from brief.md / PROJECT_SPEC.md only (no new prices, durations or guarantees). The 40–60-word
 * featured-snippet paragraph is lib/seo/content.ts SERVICES[].snippet (SEO-owned, also used by the seed).
 * The seed (cms/seed/generate.ts) writes these paragraphs to service.body, so Sanity and the fixtures agree.
 * Editors change the copy in Sanity; this file is only the fallback when Sanity returns nothing.
 */
export const SERVICE_BODY: Record<string, string[]> = {
  "screen-repair": [
    "Bring in a phone with a cracked or broken screen and we replace it while you wait. We repair Apple, Samsung, LG, Google Pixel, Motorola and OnePlus devices, and other brands too. Walk in, or book a time online.",
    "There is no upfront payment for iPhone repairs. Android repairs need a $20 deposit. If a replacement part has to be ordered, it arrives in 3–4 days from our warehouse. We recommend backing up your data via iCloud, Google or another cloud service before you bring your device in.",
  ],
  "battery-replacement": [
    "A worn battery makes a phone die early or shut down at random. We replace batteries for Apple, Samsung, LG, Google and other devices with premium-quality parts, and the repair is covered by our 90-day warranty.",
    "There is no upfront payment for iPhone repairs. Android repairs need a $20 deposit. If a part has to be ordered, it arrives in 3–4 days from our warehouse.",
  ],
  "charger-port-repair": [
    "If your phone only charges at an angle, will not charge at all, or the cable keeps falling out, the charger port may be damaged. We repair charger ports on Apple, Samsung, LG, Google and other devices.",
    "Most Android repairs take 1–2 hours. There is no upfront payment for iPhone repairs, and Android repairs need a $20 deposit. All repairs are covered under our 90-day warranty.",
  ],
  "camera-repair": [
    "We repair front and rear cameras that are cracked, blurry or not working. Camera repairs are available for Apple, Samsung, LG, Google and other devices.",
    "If we find any damage that affects functionality beyond the repair, we will let you know beforehand. All repairs are covered under our 90-day warranty; damage to your device after repair voids the warranty.",
  ],
  "water-damage-inspection": [
    "Bring a water-damaged phone in as soon as you can. We inspect the device and tell you what we find before any work begins.",
    "We recommend backing up your data via iCloud, Google or another cloud service whenever you can. There is a small possibility of data loss during any repair.",
  ],
  "device-unlocking": [
    "We unlock phones from any carrier, so you can move to the network or prepaid plan that suits you. In store we offer Simple Mobile, AT&T and Verizon prepaid plans.",
    "Call 1.855.377.3339 or visit the store at 1650 W Market St to get started.",
  ],
  "certified-pre-owned-devices": [
    "Our certified pre-owned range covers tested and inspected iPhones, iPads, Apple Watch models and MacBooks, plus accessories. Browse the online shop or see the devices in store.",
    "We accept all major credit and debit cards, PayPal and Venmo. Acima lease-to-own financing is available with no credit needed. Phones that are not currently in stock require 50% down.",
  ],
  "sell-trade-your-device": [
    "Selling takes three steps: get a quote, bring your device in or mail it, and get paid. We compare top trade-in prices so you don't have to, for old and broken devices alike.",
    "We accept Apple, Samsung, LG, Google, Motorola and OnePlus devices. Start with the trade-in form on our Sell Your Device page, or call us for a quote.",
  ],
  "prepaid-phone-plans": [
    "We sell Simple Mobile, AT&T and Verizon prepaid plans in store. Prepaid plans help you save money every month.",
    "Visit the store at 1650 W Market St or call 1.855.377.3339 and we will help you pick a plan. If your phone is locked to another carrier, we can unlock it too.",
  ],
  "bill-payment-services": [
    "Pay your water, electric and gas bills at our location, in the same visit as a repair or a prepaid plan.",
    "Find us at 1650 W Market St in Akron. Use Get Directions for the route.",
  ],
  "home-internet": [
    "Home Internet is $40 per month, the first month is free, and you get a free smartphone when you sign up. It is a good fit for anyone moving into a new home, townhome, condo or apartment.",
    "Sign up with the online form on our Home Internet page, or visit the store. Speedy iRepair is a Spectrum Authorized Retailer.",
  ],
  financing: [
    "Acima offers lease-to-own financing with no credit needed. You can use it for smartphones, accessories and more.",
    "Select Apply Now to start your Acima application online, then shop with us in store or online. See the Financing page for how it works.",
  ],
  accessories: [
    "Shop phone accessories in our online store or at the shop on W Market St, alongside our certified pre-owned devices.",
    "We accept all major credit and debit cards, PayPal and Venmo. Domestic orders ship within 7–10 business days via ePacket Mail, with tracking. Accessories, chargers and screen protectors are non-returnable; see our Shipping & Return Policy.",
  ],
  "replacement-parts": [
    "We use premium-quality replacement parts for our repairs. If a part is not in stock, it arrives in 3–4 days from our warehouse.",
    "All repairs are covered under our 90-day warranty. Damage to your device after repair voids the warranty.",
  ],
};

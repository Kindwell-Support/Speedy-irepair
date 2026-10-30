import type { Announcement, BusinessInfo, Navigation, SiteSettings } from "../types";

/** Exact external links from spec 1.1 (REQ-103). Do not edit without updating the spec. */
export const EXTERNAL_LINKS = {
  schedule: "https://squareup.com/appointments/book/H19XXYP72PBW5/speedy-irepair-akron-oh",
  financing:
    "https://ecom.acimacredit.com/views/phone-auth/ecom-merchant-813293c2-9f1e-4987-8b83-6691e6baf75e?redirect=application",
  homeInternetSignup: "https://form.jotform.com/253200750312037",
  ebay: "https://www.ebay.com/usr/speedyirepair",
  review: "https://www.google.com/searchviewer/10?hl=en-us&output=search&svid=CCYSGioYOhYweDA6MHgzZTlkM2I1MGJkMDg2NTgwGAo",
  maps: "https://goo.gl/maps/hx2oTBFB18LNoMW36",
  facebook: "https://m.facebook.com/speedyirepair/",
  twitter: "https://mobile.twitter.com/speedyirepair",
  instagram: "http://Instagram.com/speedyirepair",
  youtube: "https://youtu.be/O_o94Qwoe7U",
} as const;

export const businessInfo: BusinessInfo = {
  name: "Speedy iRepair",
  legalName: "Speedy iRepair LLC",
  // Decision #1 (OQ-01): founding year omitted.
  tagline: "Akron's trusted phone repair shop.",
  address: {
    street: "1650 W Market St",
    suite: "#27",
    city: "Akron",
    state: "OH",
    zip: "44313",
    country: "US",
  },
  footerAddressLine: "1650 W Market St, Akron, OH 44313",
  phone: "1.855.377.3339",
  email: "info@speedyirepair.com",
  // Decision #2 (OQ-02): hours from the Google listing, cross-checked 2026-10-27 against the
  // business's own Square booking page (square.site/book/H19XXYP72PBW5) and two Google-listing mirrors.
  hours: [
    { day: "Monday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Tuesday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Wednesday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Thursday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Friday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Saturday", closed: false, opens: "12:00", closes: "18:00" },
    { day: "Sunday", closed: true, opens: null, closes: null },
  ],
  hoursIsPlaceholder: false,
  hoursPlaceholderText: "Hours coming soon",
  hoursSource:
    "Google listing 'Speedy iRepair - West Akron Wallhaven' + Square booking page, read 2026-10-27. Client to confirm.",
  foundingYear: null,
  geo: null,
  socials: [
    { platform: "facebook", label: "Facebook", url: EXTERNAL_LINKS.facebook, handle: "speedyirepair" },
    { platform: "twitter", label: "Twitter / X", url: EXTERNAL_LINKS.twitter, handle: "@speedyirepair" },
    { platform: "instagram", label: "Instagram", url: EXTERNAL_LINKS.instagram, handle: "@speedyirepair" },
    { platform: "youtube", label: "YouTube", url: EXTERNAL_LINKS.youtube, handle: null },
  ],
  externalLinks: { ...EXTERNAL_LINKS },
  paymentsAccepted: ["paypal", "venmo", "visa", "mastercard", "amex", "discover"],
  notificationEmail: "info@speedyirepair.com",
  googleMapsEmbedUrl: null,
  spectrumAuthorizedRetailer: true,
  logo: {
    src: "/brand/logo-wordmark-red.png",
    alt: "Speedy iRepair",
    width: 845,
    height: 82,
    isSanity: false,
  },
  logoInverse: {
    src: "/brand/logo-wordmark-white.png",
    alt: "Speedy iRepair",
    width: 845,
    height: 82,
    isSanity: false,
  },
};

export const navigation: Navigation = {
  primary: [
    { label: "Services", href: "/services" },
    { label: "Shop", href: "/shop" },
    { label: "Sell Your Device", href: "/sell-your-device" },
    { label: "Instant Quote", href: "/instant-quote" },
    { label: "Financing", href: "/financing" },
    { label: "Home Internet", href: "/home-internet" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  headerCta: { label: "Schedule Repair", href: "/repair", variant: "primary" },
  // Spec 2.1.11 (REQ-041)
  footerQuickLinks: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Sell Your Device", href: "/sell-your-device" },
    { label: "Schedule Repair", href: "/repair" },
    { label: "Instant Quote", href: "/instant-quote" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  // Spec 2.1.11 (REQ-042)
  footerLegalLinks: [
    { label: "eBay Store", href: EXTERNAL_LINKS.ebay, external: true },
    { label: "Leave a Review", href: EXTERNAL_LINKS.review, external: true },
    { label: "Shipping & Return Policy", href: "/policies/shipping-return" },
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms & Conditions", href: "/policies/terms" },
  ],
};

export const siteSettings: SiteSettings = {
  business: businessInfo,
  navigation,
  copyright: "© 2026 Speedy iRepair LLC",
  defaultSeo: {
    metaTitle: "Speedy iRepair | Phone Repair in Akron, OH",
    metaDescription:
      "Phone repair, certified pre-owned devices, prepaid plans, bill pay and home internet at 1650 W Market St, Akron, OH. Most repairs in 45 minutes.",
    ogImage: {
      src: "/images/og-default.jpg",
      alt: "Speedy iRepair",
      width: 1433,
      height: 630,
      isSanity: false,
    },
    noIndex: false,
  },
};

export const announcement: Announcement = {
  id: "announcement-home-internet",
  text: "FREE Smartphone when you sign up for Home Internet",
  href: EXTERNAL_LINKS.homeInternetSignup,
  external: true,
  enabled: true,
};

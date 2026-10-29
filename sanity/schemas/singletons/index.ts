import { defineArrayMember, defineField, defineType, type FieldDefinition } from "sanity";

/**
 * Singleton documents (one instance each, fixed _id = type name; enforced in sanity/desk/structure.ts
 * and sanity.config.ts). Field names MUST match lib/sanity/types.ts.
 */
export const SINGLETON_TYPES = [
  "siteSettings",
  "homePage",
  "servicesPage",
  "shopPage",
  "sellPage",
  "quotePage",
  "schedulePage",
  "faqPage",
  "aboutPage",
  "financingPage",
  "homeInternetPage",
  "blogPage",
  "llmsDocument",
] as const;

const section = (name: string, title?: string) => defineField({ name, title, type: "sectionCopy" });
const ctaList = (name = "ctas") => defineField({ name, type: "array", of: [defineArrayMember({ type: "cta" })] });
const stringList = (name: string) => defineField({ name, type: "array", of: [defineArrayMember({ type: "string" })] });
const extendSection = (name: string, extra: FieldDefinition[]) =>
  defineField({
    name,
    type: "object",
    fields: [
      defineField({ name: "heading", type: "string", validation: (r) => r.required() }),
      defineField({ name: "intro", type: "text", rows: 3 }),
      defineField({ name: "body", type: "portableText" }),
      defineField({ name: "isPlaceholder", type: "boolean", initialValue: false }),
      ...extra,
    ],
  });

/** Every page singleton: title + hero (h1) + seo + page-specific fields. */
function page(name: string, title: string, fields: FieldDefinition[]) {
  return defineType({
    name,
    title,
    type: "document",
    groups: [
      { name: "content", title: "Content", default: true },
      { name: "seo", title: "SEO" },
    ],
    fields: [
      defineField({ name: "title", type: "string", initialValue: title, validation: (r) => r.required(), group: "content" }),
      defineField({ name: "hero", type: "hero", validation: (r) => r.required(), group: "content" }),
      defineField({ name: "photo", title: "Page photo", type: "imageWithAlt", description: "The photo in the page body. Empty = the built-in photo.", group: "content" }),
      ...fields.map((f) => ({ ...f, group: "content" })),
      defineField({ name: "seo", type: "seo", group: "seo" }),
    ],
    preview: { prepare: () => ({ title }) },
  });
}

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "business", title: "Business", default: true },
    { name: "navigation", title: "Navigation" },
    { name: "seo", title: "Default SEO" },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "legalName", type: "string", group: "business" }),
    defineField({ name: "tagline", type: "string", group: "business" }),
    defineField({ name: "address", type: "address", group: "business" }),
    defineField({ name: "footerAddressLine", type: "string", group: "business" }),
    defineField({ name: "phone", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "email", type: "string", group: "business", validation: (r) => r.required().email() }),
    defineField({ name: "hours", type: "array", of: [defineArrayMember({ type: "openingHours" })], group: "business", validation: (r) => r.max(7) }),
    defineField({ name: "hoursIsPlaceholder", type: "boolean", initialValue: false, group: "business" }),
    defineField({ name: "hoursPlaceholderText", type: "string", initialValue: "Hours coming soon", group: "business" }),
    defineField({ name: "hoursSource", type: "string", group: "business" }),
    defineField({
      name: "foundingYear",
      type: "number",
      group: "business",
      description: "Leave empty unless confirmed by the owner (OQ-01). Never guess.",
      validation: (r) => r.integer().min(1990).max(2100),
    }),
    defineField({ name: "geo", type: "object", group: "business", fields: [defineField({ name: "lat", type: "number" }), defineField({ name: "lng", type: "number" })] }),
    defineField({
      name: "socials",
      type: "array",
      group: "business",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "platform", type: "string", options: { list: ["facebook", "twitter", "instagram", "youtube"] } }),
            defineField({ name: "label", type: "string" }),
            defineField({ name: "url", type: "url" }),
            defineField({ name: "handle", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "externalLinks",
      type: "object",
      group: "business",
      description: "Exact third-party URLs (spec 1.1). Change only when the business changes provider.",
      fields: ["schedule", "financing", "homeInternetSignup", "ebay", "review", "maps", "facebook", "twitter", "instagram", "youtube"].map(
        (name) => defineField({ name, type: "url", validation: (r) => r.required().uri({ scheme: ["http", "https"] }) }),
      ),
    }),
    defineField({
      name: "paymentsAccepted",
      type: "array",
      group: "business",
      of: [defineArrayMember({ type: "string" })],
      options: { list: ["paypal", "venmo", "visa", "mastercard", "amex", "discover"] },
    }),
    defineField({
      name: "notificationEmail",
      type: "string",
      group: "business",
      initialValue: "info@speedyirepair.com",
      description: "Where form notifications are sent (passed to the form webhook).",
      validation: (r) => r.required().email(),
    }),
    defineField({ name: "googleMapsEmbedUrl", type: "url", group: "business" }),
    defineField({ name: "spectrumAuthorizedRetailer", type: "boolean", initialValue: true, group: "business" }),
    defineField({ name: "logo", type: "imageWithAlt", group: "business" }),
    defineField({ name: "logoInverse", type: "imageWithAlt", group: "business" }),
    defineField({
      name: "navigation",
      type: "object",
      group: "navigation",
      fields: [
        ctaList("primary"),
        defineField({ name: "headerCta", type: "cta" }),
        ctaList("footerQuickLinks"),
        ctaList("footerLegalLinks"),
      ],
    }),
    defineField({ name: "copyright", type: "string", group: "navigation" }),
    defineField({ name: "seo", title: "Default SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const homePage = page("homePage", "Home", [
  section("serviceCardsSection"),
  defineField({ name: "serviceCards", type: "array", of: [defineArrayMember({ type: "serviceCard" })], validation: (r) => r.max(12) }),
  section("howItWorksSection"),
  section("brandsSection"),
  section("whySection"),
  section("testimonialsSection"),
  section("promotionsSection"),
  section("faqSection"),
  extendSection("locationSection", [defineField({ name: "directionsLabel", type: "string", initialValue: "Get Directions" })]),
  defineField({
    name: "newsletter",
    type: "object",
    fields: ["heading", "emailLabel", "buttonLabel", "successMessage"].map((name) => defineField({ name, type: "string", validation: (r) => r.required() })),
  }),
  section("contactSection"),
  defineField({ name: "splineSceneUrl", type: "url", description: "Optional Spline scene (.splinecode). Empty = built-in 3D hero." }),
]);

export const servicesPage = page("servicesPage", "Services", [section("faqSection")]);
export const shopPage = page("shopPage", "Shop", [defineField({ name: "stagingNotice", type: "string" })]);
export const sellPage = page("sellPage", "Sell Your Device", [
  section("howItWorksSection"),
  section("formSection"),
  section("brandsSection"),
  extendSection("ctaSection", [ctaList()]),
]);
export const quotePage = page("quotePage", "Instant Quote", [
  section("formSection"),
  stringList("deviceTypes"),
  stringList("issues"),
  defineField({ name: "successMessage", type: "string" }),
]);
export const schedulePage = page("schedulePage", "Schedule Repair", [
  section("whatToExpect"),
  section("whatToBring"),
  section("locationSection"),
  defineField({ name: "squareBookingUrl", type: "url", validation: (r) => r.required() }),
]);
export const faqPage = page("faqPage", "FAQ", [defineField({ name: "intro", type: "text", rows: 3 })]);
export const aboutPage = page("aboutPage", "About", [
  section("aboutSection"),
  section("teamSection"),
  section("storySection"),
  extendSection("valuesSection", [stringList("values")]),
  section("spectrumSection"),
  extendSection("ctaSection", [ctaList()]),
  section("contactSection"),
]);
export const financingPage = page("financingPage", "Financing", [
  section("whatIsSection"),
  section("howItWorksSection"),
  extendSection("whatYouCanFinanceSection", [stringList("items")]),
  defineField({ name: "applyCta", type: "cta" }),
  section("faqSection"),
]);
export const homeInternetPage = page("homeInternetPage", "Home Internet", [
  extendSection("whoItsForSection", [stringList("items")]),
  extendSection("whatYouGetSection", [stringList("items")]),
  section("howToSignUpSection"),
  defineField({ name: "jotformUrl", type: "url", validation: (r) => r.required() }),
  section("faqSection"),
]);

export const blogPage = page("blogPage", "Blog", []);

export const llmsDocument = defineType({
  name: "llmsDocument",
  title: "llms.txt",
  type: "document",
  description: "Served at /llms.txt and /llms-full.txt. Leave empty to use the built-in spec text.",
  fields: [
    defineField({ name: "llms", title: "llms.txt", type: "text", rows: 30 }),
    defineField({ name: "llmsFull", title: "llms-full.txt", type: "text", rows: 40 }),
  ],
  preview: { prepare: () => ({ title: "llms.txt" }) },
});

export const singletonTypes = [
  siteSettings,
  homePage,
  servicesPage,
  shopPage,
  sellPage,
  quotePage,
  schedulePage,
  faqPage,
  aboutPage,
  financingPage,
  homeInternetPage,
  blogPage,
  llmsDocument,
];

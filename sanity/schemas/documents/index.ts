import { defineArrayMember, defineField, defineType } from "sanity";
import { placeholderFields } from "../objects";

/** Repeatable documents. Field names MUST match lib/sanity/types.ts. Contract: docs/CONTRACT_SANITY.md */

const order = defineField({ name: "order", type: "number", validation: (r) => r.required().integer().min(0) });
const orderings = [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" as const }] }];

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, description: "Anchor on /services (#slug).", validation: (r) => r.required() }),
    defineField({
      name: "summary",
      type: "text",
      rows: 4,
      description: "Featured-snippet paragraph, 40–60 words (REQ-049). Used in llms-full.txt and Service JSON-LD.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "body", type: "portableText" }),
    defineField({ name: "priceFrom", title: "Price (headline)", type: "string", description: 'Short price line, e.g. "From $79". Empty = no price shown.' }),
    defineField({
      name: "priceList",
      title: "Price list",
      type: "array",
      description: "Optional rows, e.g. iPhone 15 screen / $189. Empty = no table shown.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "price", type: "string", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "price" } },
        }),
      ],
    }),
    defineField({ name: "image", type: "imageWithAlt", description: "Photo beside this service on /services. Empty = the built-in photo, if any." }),
    defineField({ name: "ctas", type: "array", of: [defineArrayMember({ type: "cta" })], validation: (r) => r.max(3) }),
    defineField({ name: "riveIcon", type: "string" }),
    order,
    defineField({ name: "seo", type: "seo" }),
    ...placeholderFields,
  ],
  orderings,
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 4, description: "Plain text (used verbatim in FAQPage JSON-LD).", validation: (r) => r.required() }),
    defineField({
      name: "categories",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: ["general", "services", "financing", "internet"] },
      validation: (r) => r.required().min(1),
    }),
    order,
    ...placeholderFields,
  ],
  orderings,
  preview: { select: { title: "question" } },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  description: "Real customer reviews only (copy from Google with permission). Never invent reviews.",
  fields: [
    defineField({ name: "author", type: "string", validation: (r) => r.required() }),
    defineField({ name: "rating", type: "number", options: { list: [1, 2, 3, 4, 5] }, validation: (r) => r.required() }),
    defineField({ name: "text", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "source", type: "string", options: { list: ["google", "facebook", "other"] }, initialValue: "google" }),
    defineField({ name: "sourceUrl", type: "url" }),
    defineField({ name: "date", type: "date" }),
    ...placeholderFields,
  ],
  preview: { select: { title: "author", subtitle: "text" } },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "photo", type: "imageWithAlt" }),
    order,
    ...placeholderFields,
  ],
  orderings,
});

export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", description: "Marquee label, e.g. Google Pixel", validation: (r) => r.required() }),
    defineField({ name: "shortName", type: "string", description: "e.g. Google", validation: (r) => r.required() }),
    defineField({ name: "logo", type: "imageWithAlt", description: "Monochrome SVG/PNG preferred (REQ-028)." }),
    defineField({ name: "repairs", type: "boolean", initialValue: true }),
    defineField({ name: "acceptsTradeIn", type: "boolean", initialValue: true }),
    order,
  ],
  orderings,
});

export const valueProp = defineType({
  name: "valueProp",
  title: "Value proposition",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "detail", type: "text", rows: 2 }),
    defineField({ name: "speakable", type: "boolean", initialValue: true, description: "Include in speakable JSON-LD (REQ-079)." }),
    order,
    ...placeholderFields,
  ],
  orderings,
});

export const howItWorksStep = defineType({
  name: "howItWorksStep",
  title: "How-it-works step",
  type: "document",
  fields: [
    defineField({
      name: "set",
      type: "string",
      options: { list: ["home", "sell", "financing", "homeInternet"], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 2 }),
    defineField({ name: "image", type: "imageWithAlt", description: "Photo behind this step. Empty = the built-in photo, if any." }),
    order,
    ...placeholderFields,
  ],
  orderings,
  preview: { select: { title: "title", subtitle: "set" } },
});

export const promotion = defineType({
  name: "promotion",
  title: "Promotion",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 2 }),
    defineField({ name: "cta", type: "cta", validation: (r) => r.required() }),
    order,
    ...placeholderFields,
  ],
  orderings,
});

export const announcement = defineType({
  name: "announcement",
  title: "Announcement banner",
  type: "document",
  fields: [
    defineField({ name: "text", type: "string", validation: (r) => r.required().max(90) }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
    defineField({ name: "external", type: "boolean", initialValue: false }),
    defineField({ name: "enabled", type: "boolean", initialValue: true, description: "The most recently edited enabled banner is shown." }),
    ...placeholderFields,
  ],
  preview: { select: { title: "text", enabled: "enabled" }, prepare: ({ title, enabled }: { title?: string; enabled?: boolean }) => ({ title, subtitle: enabled ? "Live" : "Disabled" }) },
});

export const policyPage = defineType({
  name: "policyPage",
  title: "Policy page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      description: "One of: shipping-return, privacy, terms (route /policies/[slug]).",
      validation: (r) =>
        r.required().custom((v: { current?: string } | undefined) =>
          v?.current && ["shipping-return", "privacy", "terms"].includes(v.current) ? true : "Use shipping-return, privacy or terms",
        ),
    }),
    defineField({ name: "body", type: "portableText", validation: (r) => r.required() }),
    defineField({ name: "sourceUrl", type: "url" }),
    defineField({ name: "seo", type: "seo" }),
    ...placeholderFields,
  ],
});

export const shopCollectionConfig = defineType({
  name: "shopCollectionConfig",
  title: "Shop category (editorial)",
  type: "document",
  description: "Editorial merchandising ONLY. Products, prices and stock come from Shopify.",
  fields: [
    defineField({
      name: "handle",
      type: "string",
      description: "Shopify collection handle (see lib/shop/config.ts).",
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "heroImage", type: "imageWithAlt" }),
    defineField({ name: "featuredProductHandles", type: "array", of: [defineArrayMember({ type: "string" })] }),
    order,
    defineField({ name: "seo", type: "seo" }),
  ],
  orderings,
});

export const formSubmission = defineType({
  name: "formSubmission",
  title: "Form submission",
  type: "document",
  readOnly: ({ currentUser }) => !currentUser?.roles.some((r) => r.name === "administrator"),
  fields: [
    defineField({ name: "type", type: "string", options: { list: ["quote", "tradein", "contact", "newsletter"] } }),
    defineField({ name: "payload", type: "text", description: "JSON string of the validated submission." }),
    defineField({ name: "createdAt", type: "datetime" }),
    defineField({ name: "status", type: "string", options: { list: ["new", "contacted", "closed", "spam"] }, initialValue: "new", readOnly: false }),
    defineField({ name: "pagePath", type: "string" }),
  ],
  orderings: [{ title: "Newest", name: "createdDesc", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { type: "type", createdAt: "createdAt", status: "status" },
    prepare: ({ type, createdAt, status }: { type?: string; createdAt?: string; status?: string }) => ({
      title: `${type ?? "form"} · ${status ?? "new"}`,
      subtitle: createdAt,
    }),
  },
});

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required().max(120) }),
    defineField({ name: "slug", type: "slug", group: "content", options: { source: "title", maxLength: 96 }, description: "URL: /blog/<slug>", validation: (r) => r.required() }),
    defineField({ name: "publishedAt", title: "Publish date", type: "datetime", group: "content", initialValue: () => new Date().toISOString(), validation: (r) => r.required() }),
    defineField({ name: "author", type: "string", group: "content", initialValue: "Speedy iRepair" }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "content", description: "One or two sentences for the blog list and Google.", validation: (r) => r.max(240) }),
    defineField({ name: "coverImage", type: "imageWithAlt", group: "content" }),
    defineField({ name: "body", type: "postBody", group: "content", validation: (r) => r.required() }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  orderings: [{ title: "Newest", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "coverImage" } },
});

export const documentTypes = [
  post,
  service,
  faq,
  testimonial,
  teamMember,
  brand,
  valueProp,
  howItWorksStep,
  promotion,
  announcement,
  policyPage,
  shopCollectionConfig,
  formSubmission,
];

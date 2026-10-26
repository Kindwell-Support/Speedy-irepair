import { defineArrayMember, defineField, defineType } from "sanity";

/** Shared object types. Field names MUST match lib/sanity/types.ts + lib/sanity/queries.ts. */

/** Image with REQUIRED alt text (Architecture decision: alt is mandatory). */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe the image for screen readers and SEO. Required.",
      validation: (r) => r.required().min(3).max(160),
    }),
  ],
});

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required().max(40) }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Internal path (/schedule-repair), tel:, mailto: or full https:// URL.",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && /^(\/|#|https?:\/\/|tel:|mailto:)/.test(v) ? true : "Must start with /, #, https://, tel: or mailto:",
        ),
    }),
    defineField({ name: "external", type: "boolean", initialValue: false, description: "Opens in a new tab." }),
    defineField({
      name: "variant",
      type: "string",
      options: { list: ["primary", "secondary", "link"], layout: "radio", direction: "horizontal" },
      initialValue: "primary",
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "metaTitle", type: "string", validation: (r) => r.max(70).warning("Keep under 60–70 characters") }),
    defineField({ name: "metaDescription", type: "text", rows: 3, validation: (r) => r.max(170).warning("Keep under 155–170 characters") }),
    defineField({ name: "ogImage", title: "Social share image (1200×630)", type: "imageWithAlt" }),
    defineField({ name: "noIndex", type: "boolean", initialValue: false }),
    defineField({ name: "canonicalOverride", type: "url" }),
  ],
});

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "headline", type: "string", description: "Rendered as the page's single <h1>.", validation: (r) => r.required() }),
    defineField({ name: "subline", type: "text", rows: 2 }),
    defineField({ name: "primaryCta", type: "cta" }),
    defineField({ name: "secondaryCta", type: "cta" }),
    defineField({ name: "poster", title: "Poster / LCP image", type: "imageWithAlt" }),
  ],
});

/** Placeholder flag shared by editorial types: renders a visible marker outside production. */
export const placeholderFields = [
  defineField({
    name: "isPlaceholder",
    title: "Placeholder",
    type: "boolean",
    initialValue: false,
    description: "Mark content that is not final. Shown with a yellow marker on staging; excluded from JSON-LD.",
  }),
  defineField({ name: "sourceNote", title: "Source / editor note", type: "text", rows: 2 }),
];

export const portableText = defineType({
  name: "portableText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
      ],
      marks: {
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [defineField({ name: "href", type: "string", validation: (r) => r.required() })],
          }),
        ],
      },
    }),
  ],
});

export const sectionCopy = defineType({
  name: "sectionCopy",
  title: "Section copy",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string", description: "Rendered as an <h2>.", validation: (r) => r.required() }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({ name: "body", type: "portableText" }),
    ...placeholderFields,
  ],
});

export const serviceCard = defineType({
  name: "serviceCard",
  title: "Service card",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
    defineField({ name: "externalLink", type: "cta" }),
    defineField({ name: "riveIcon", type: "string", description: "Rive artboard key, see public/rive/README.md" }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "href" } },
});

export const address = defineType({
  name: "address",
  type: "object",
  fields: ["street", "suite", "city", "state", "zip", "country"].map((name) =>
    defineField({ name, type: "string", validation: (r) => (name === "suite" ? r : r.required()) }),
  ),
});

export const openingHours = defineType({
  name: "openingHours",
  type: "object",
  fields: [
    defineField({
      name: "day",
      type: "string",
      options: { list: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "closed", type: "boolean", initialValue: false }),
    defineField({ name: "opens", type: "string", description: "24h HH:MM", validation: (r) => r.regex(/^\d{2}:\d{2}$/) }),
    defineField({ name: "closes", type: "string", description: "24h HH:MM", validation: (r) => r.regex(/^\d{2}:\d{2}$/) }),
  ],
  preview: {
    select: { day: "day", closed: "closed", opens: "opens", closes: "closes" },
    prepare: ({ day, closed, opens, closes }: { day?: string; closed?: boolean; opens?: string; closes?: string }) => ({
      title: day ?? "Day",
      subtitle: closed ? "Closed" : `${opens ?? "?"}–${closes ?? "?"}`,
    }),
  },
});

export const objectTypes = [imageWithAlt, cta, seo, hero, portableText, sectionCopy, serviceCard, address, openingHours];

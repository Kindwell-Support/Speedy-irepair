import {defineArrayMember, defineField, defineType} from 'sanity'
import {flaggedForReviewField, isPlaceholderField, rankField, seoField, seoGroups, wordCount} from '../helpers'

export const service = defineType({
  name: 'service',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', group: 'content', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'showOnHomepage', type: 'boolean', group: 'content', initialValue: false}),
    defineField({name: 'cardTitle', type: 'string', group: 'content'}),
    defineField({name: 'cardHref', type: 'string', group: 'content', description: 'Card link override. Default /services#<slug>. Used by the homepage-only "Smartphone Repair" card.', validation: (r) => r.regex(/^\/[^\s]*$/, {name: 'internal path'})}),
    defineField({name: 'cardDescription', type: 'text', rows: 2, group: 'content', validation: (r) => r.max(140)}),
    defineField({
      name: 'snippetParagraph',
      title: 'First paragraph (featured snippet, 40–60 words)',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (r) =>
        r.required().custom((v) => {
          const n = wordCount(v as string | undefined)
          return n >= 40 && n <= 60 ? true : `Must be 40–60 words (currently ${n})`
        }),
    }),
    defineField({name: 'body', type: 'richText', group: 'content'}),
    defineField({name: 'icon', type: 'riveIcon', group: 'content'}),
    defineField({name: 'ctas', type: 'array', group: 'content', of: [defineArrayMember({type: 'cta'})], validation: (r) => r.max(2)}),
    defineField({name: 'serviceType', type: 'string', group: 'content', description: 'schema.org serviceType text'}),
    defineField({name: 'faqs', type: 'array', group: 'content', of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})]}),
    {...flaggedForReviewField, group: 'content'},
    rankField('service'),
    // v1.1: optional. Services render as /services#<slug> sections (no own route); only needed if a /services/[slug] route is added.
    defineField({...seoField, validation: undefined, description: 'Optional: only used if per-service pages are added.'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({name: 'question', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'answer', type: 'text', rows: 4, description: 'Plain text, used verbatim in FAQPage schema.', validation: (r) => r.required()}),
    defineField({
      name: 'categories',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ['general', 'repair', 'financing', 'homeInternet', 'shop', 'tradeIn']},
    }),
    defineField({
      ...flaggedForReviewField,
      description: 'Drafted beyond the brief. Shown on staging only; hidden on production and excluded from FAQPage until cleared.',
    }),
    rankField('faq'),
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})

export const testimonial = defineType({
  name: 'testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      type: 'string',
      options: {list: [{title: 'Google review', value: 'google'}, {title: 'Supplied by business', value: 'manual'}, {title: 'Placeholder slot', value: 'placeholder'}], layout: 'radio'},
      initialValue: 'placeholder',
      validation: (r) => r.required(),
    }),
    defineField({
      ...isPlaceholderField,
      validation: (r) =>
        r.required().custom((v, ctx) => {
          const src = (ctx.document as {source?: string} | undefined)?.source
          return (src === 'placeholder') === (v === true) ? true : 'isPlaceholder must be true exactly when source is "placeholder"'
        }),
    }),
    defineField({
      name: 'authorName',
      type: 'string',
      validation: (r) => r.custom((v, ctx) => ((ctx.document as {isPlaceholder?: boolean})?.isPlaceholder || v ? true : 'Required for real reviews')),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      validation: (r) =>
        r.integer().min(1).max(5).custom((v, ctx) => ((ctx.document as {isPlaceholder?: boolean})?.isPlaceholder || v ? true : 'Required for real reviews')),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 4,
      validation: (r) => r.custom((v, ctx) => ((ctx.document as {isPlaceholder?: boolean})?.isPlaceholder || v ? true : 'Required for real reviews')),
    }),
    defineField({name: 'reviewDate', type: 'date'}),
    defineField({name: 'sourceUrl', type: 'url'}),
    defineField({name: 'featured', type: 'boolean', initialValue: true}),
    rankField('testimonial'),
  ],
  preview: {
    select: {title: 'authorName', rating: 'rating', source: 'source', ph: 'isPlaceholder'},
    prepare: ({title, rating, source, ph}) => ({title: ph ? 'Placeholder slot' : title, subtitle: `${source}${rating ? ` · ${rating}★` : ''}`}),
  },
})

export const promotion = defineType({
  name: 'promotion',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'text', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'link', type: 'link'}),
    defineField({name: 'placements', type: 'array', of: [defineArrayMember({type: 'string'})], options: {list: ['banner', 'homepage']}, validation: (r) => r.min(1)}),
    defineField({name: 'active', type: 'boolean', initialValue: true}),
    defineField({name: 'startsAt', type: 'datetime'}),
    defineField({name: 'endsAt', type: 'datetime'}),
    rankField('promotion'),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

export const teamMember = defineType({
  name: 'teamMember',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'role', type: 'string'}),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({name: 'bio', type: 'text', rows: 4}),
    isPlaceholderField,
    rankField('teamMember'),
  ],
})

export const brand = defineType({
  name: 'brand',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'tradeInLabel', type: 'string', description: 'Optional label in trade-in lists (e.g. "Google").'}),
    defineField({name: 'logo', type: 'image', fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({name: 'repaired', type: 'boolean', initialValue: true}),
    defineField({name: 'acceptedForTradeIn', type: 'boolean', initialValue: true}),
    rankField('brand'),
  ],
})

export const policyPage = defineType({
  name: 'policyPage',
  title: 'Policy page',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', group: 'content', options: {list: ['shipping-return', 'privacy', 'terms']} as never, validation: (r) => r.required()}),
    defineField({name: 'body', type: 'richText', group: 'content'}),
    defineField({name: 'sourceUrl', type: 'url', group: 'content'}),
    defineField({name: 'lastUpdated', type: 'date', group: 'content'}),
    {...isPlaceholderField, group: 'content'},
    defineField({name: 'needsReview', title: 'Pending legal / client review', type: 'boolean', group: 'content', initialValue: false, description: 'Live-site text kept verbatim but not yet approved. Site shows a "pending review" note on staging.'}),
    defineField({name: 'reviewNote', type: 'string', group: 'content', hidden: ({document}) => !document?.needsReview}),
    seoField,
  ],
})

/** Only registered if the Architect picks option (a): Sanity catalog + Shopify checkout. */
export const product = defineType({
  name: 'product',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', group: 'content', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'category', type: 'string', group: 'content', options: {list: ['iphones', 'ipads', 'apple-watch', 'macbooks', 'accessories']}, validation: (r) => r.required()}),
    defineField({
      name: 'images',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string', validation: (r) => r.required()})]})],
      validation: (r) => r.min(1),
    }),
    defineField({name: 'price', type: 'number', group: 'content', description: 'Real price only. Never estimate.', validation: (r) => r.required().positive()}),
    defineField({name: 'compareAtPrice', type: 'number', group: 'content'}),
    defineField({name: 'currency', type: 'string', group: 'content', initialValue: 'USD', readOnly: true}),
    defineField({name: 'condition', type: 'string', group: 'content', options: {list: ['new', 'certified-pre-owned', 'refurbished']}}),
    defineField({name: 'inStock', type: 'boolean', group: 'content', initialValue: true}),
    defineField({name: 'shopifyProductUrl', type: 'url', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'shopifyVariantId', type: 'string', group: 'content'}),
    defineField({name: 'description', type: 'richText', group: 'content'}),
    defineField({
      name: 'specs',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'object', name: 'spec', fields: [defineField({name: 'label', type: 'string'}), defineField({name: 'value', type: 'string'})]})],
    }),
    rankField('product'),
    seoField,
  ],
})

export const formSubmission = defineType({
  name: 'formSubmission',
  title: 'Form submission',
  type: 'document',
  readOnly: false,
  // v1.2: ONE type for every site form, written only by app/api/forms/[type] with the server-only write token.
  // _id is always `submissions.<uuid>` (dot path = private: never returned to unauthenticated/public reads).
  fields: [
    defineField({
      name: 'type',
      title: 'Form',
      type: 'string',
      readOnly: true,
      options: {list: [{title: 'Instant quote', value: 'quote'}, {title: 'Trade-in', value: 'tradeIn'}, {title: 'Contact', value: 'contact'}, {title: 'Newsletter', value: 'newsletter'}]},
      validation: (r) => r.required(),
    }),
    defineField({name: 'name', type: 'string', readOnly: true}),
    defineField({name: 'email', type: 'string', readOnly: true}),
    defineField({name: 'phone', type: 'string', readOnly: true}),
    defineField({name: 'message', type: 'text', readOnly: true, description: 'Contact message, or the optional "details" on quote / trade-in.'}),
    defineField({
      name: 'payload',
      type: 'object',
      readOnly: true,
      fields: ['deviceType', 'brand', 'model', 'issue', 'condition'].map((n) => defineField({name: n, type: 'string'})),
    }),
    defineField({name: 'pagePath', type: 'string', readOnly: true}),
    defineField({name: 'submittedAt', type: 'datetime', readOnly: true}),
    defineField({name: 'webhookDelivered', type: 'boolean', readOnly: true}),
    defineField({name: 'userAgent', type: 'string', readOnly: true}),
    defineField({name: 'status', type: 'string', options: {list: ['new', 'contacted', 'closed', 'spam']}, initialValue: 'new'}),
    defineField({name: 'internalNotes', type: 'text'}),
  ],
  orderings: [{title: 'Newest', name: 'newest', by: [{field: 'submittedAt', direction: 'desc'}]}],
  preview: {select: {title: 'name', subtitle: 'type', email: 'email'}, prepare: ({title, subtitle, email}) => ({title: title || email || 'Submission', subtitle})},
})

/**
 * v1.2: headless Shopify (SANITY_STUDIO_SHOP_SOURCE=shopify). Shopify owns products, prices and stock.
 * Sanity holds editorial only, one doc per Shopify collection: copy, order (drag), featured handles, SEO.
 */
export const shopCollectionConfig = defineType({
  name: 'shopCollectionConfig',
  title: 'Shop category (editorial)',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({name: 'handle', title: 'Shopify collection handle', type: 'string', group: 'content', description: 'Must match the collection handle in Shopify exactly.', validation: (r) => r.required().regex(/^[a-z0-9-]+$/, {name: 'handle'})}),
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'heroImage', type: 'image', group: 'content', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({name: 'featuredProductHandles', title: 'Featured Shopify product handles', type: 'array', group: 'content', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'emptyStateText', type: 'string', group: 'content', description: 'Shown when the Shopify collection has no products. Defaults to Shop page empty-state text.'}),
    rankField('shopCollectionConfig'),
    defineField({...seoField, validation: undefined, description: 'Optional: only used if category pages are added.'}),
  ],
  preview: {select: {title: 'title', subtitle: 'handle'}},
})

import {defineArrayMember, defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: false},
  // Field names + limits agreed with SEO/AEO/GEO (seo/schema/lib/seo/metadata.ts consumes them).
  fields: [
    defineField({
      name: 'metaTitle',
      type: 'string',
      description: '50–60 characters, include "Akron" where natural. Must be unique per page.',
      validation: (r) => [r.required(), r.min(50).warning('Aim for 50–60 characters'), r.max(60).error('Over 60 characters')],
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      rows: 3,
      description: '120–155 characters. Must be unique per page.',
      validation: (r) => [r.required(), r.min(120).warning('Aim for 120–155 characters'), r.max(155).error('Over 155 characters')],
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image (1200×630)',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', validation: (r) => r.required()})],
      description: 'Falls back to Site Settings → default OG image.',
    }),
    defineField({
      name: 'canonicalOverride',
      title: 'Canonical URL override (advanced)',
      type: 'url',
      description: 'Leave EMPTY. Absolute https URL only if this page duplicates another.',
      validation: (r) => r.uri({scheme: ['https']}),
    }),
    defineField({name: 'noindex', type: 'boolean', initialValue: false, description: 'Leave OFF. Staging noindex is handled by the site.'}),
    defineField({name: 'keywords', type: 'array', of: [defineArrayMember({type: 'string'})], description: 'Internal notes only (not rendered).'}),
  ],
})

const linkFields = [
  defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'linkType', type: 'string', options: {list: ['internal', 'external'], layout: 'radio'}, initialValue: 'internal', validation: (r) => r.required()}),
  defineField({
    name: 'internalPath',
    type: 'string',
    hidden: ({parent}) => parent?.linkType !== 'internal',
    validation: (r) =>
      r.custom((v, ctx) => {
        const p = ctx.parent as {linkType?: string} | undefined
        if (p?.linkType !== 'internal') return true
        return typeof v === 'string' && v.startsWith('/') ? true : 'Internal path must start with "/"'
      }),
  }),
  defineField({
    name: 'externalUrl',
    type: 'url',
    hidden: ({parent}) => parent?.linkType !== 'external',
    validation: (r) =>
      r.uri({scheme: ['http', 'https', 'mailto', 'tel']}).custom((v, ctx) => {
        const p = ctx.parent as {linkType?: string} | undefined
        return p?.linkType === 'external' && !v ? 'Required for external links' : true
      }),
  }),
  defineField({name: 'openInNewTab', type: 'boolean', initialValue: false}),
]

export const link = defineType({name: 'link', type: 'object', fields: linkFields})

/** v1.3 header nav item: a link with an optional dropdown (design: "Services ▾"). */
export const navLink = defineType({
  name: 'navLink',
  title: 'Nav link',
  type: 'object',
  fields: [...linkFields, defineField({name: 'children', title: 'Dropdown links', type: 'array', of: [defineArrayMember({type: 'link'})]})],
  preview: {select: {title: 'label', children: 'children'}, prepare: ({title, children}) => ({title, subtitle: children?.length ? `${children.length} dropdown links` : undefined})},
})

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  fields: [...linkFields, defineField({name: 'variant', type: 'string', options: {list: ['primary', 'secondary', 'ghost']}, initialValue: 'primary'})],
})

export const richText = defineType({
  name: 'richText',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [defineArrayMember({name: 'link', type: 'object', fields: [defineField({name: 'href', type: 'url', validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})})]})],
      },
    }),
    defineArrayMember({type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string', validation: (r) => r.required()})]}),
  ],
})

export const riveIcon = defineType({
  name: 'riveIcon',
  type: 'object',
  fields: [
    defineField({name: 'file', type: 'file', options: {accept: '.riv'}}),
    defineField({name: 'artboard', type: 'string'}),
    defineField({name: 'stateMachine', type: 'string', initialValue: 'State Machine 1'}),
    defineField({name: 'fallbackSvg', title: 'Fallback / reduced-motion image', type: 'image'}),
    defineField({name: 'alt', type: 'string'}),
  ],
})

export const step = defineType({
  name: 'step',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 2}),
    defineField({name: 'icon', type: 'riveIcon'}),
  ],
})

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/
export const openingHours = defineType({
  name: 'openingHours',
  title: 'Opening hours row',
  type: 'object',
  fields: [
    defineField({name: 'days', type: 'array', of: [defineArrayMember({type: 'string'})], options: {list: DAYS}, validation: (r) => r.required().min(1)}),
    defineField({name: 'closed', type: 'boolean', initialValue: false}),
    defineField({name: 'opens', type: 'string', description: 'HH:mm (24h)', hidden: ({parent}) => !!parent?.closed, validation: (r) => r.regex(hhmm, {name: 'HH:mm'})}),
    defineField({name: 'closes', type: 'string', description: 'HH:mm (24h)', hidden: ({parent}) => !!parent?.closed, validation: (r) => r.regex(hhmm, {name: 'HH:mm'})}),
  ],
  preview: {
    select: {days: 'days', opens: 'opens', closes: 'closes', closed: 'closed'},
    prepare: ({days, opens, closes, closed}) => ({title: (days || []).join(', '), subtitle: closed ? 'Closed' : `${opens ?? '?'}–${closes ?? '?'}`}),
  },
})

export const sectionHeading = defineType({
  name: 'sectionHeading',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'subheading', type: 'text', rows: 2}),
  ],
})

export const hero = defineType({
  name: 'hero',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'subheading', type: 'text', rows: 2}),
    defineField({name: 'ctas', type: 'array', of: [defineArrayMember({type: 'cta'})], validation: (r) => r.max(2)}),
  ],
})

export const objectTypes = [seo, link, navLink, cta, richText, riveIcon, step, openingHours, sectionHeading, hero]

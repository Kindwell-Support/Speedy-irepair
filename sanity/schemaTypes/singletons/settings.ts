import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Business Info & Site Settings',
  type: 'document',
  groups: [
    {name: 'business', title: 'Business', default: true},
    {name: 'hours', title: 'Hours'},
    {name: 'links', title: 'Links & Socials'},
    {name: 'brand', title: 'Brand'},
    {name: 'seo', title: 'Default SEO'},
  ],
  fields: [
    defineField({name: 'businessName', type: 'string', group: 'business', validation: (r) => r.required()}),
    defineField({name: 'legalName', type: 'string', group: 'business'}),
    defineField({name: 'tagline', type: 'string', group: 'business'}),
    defineField({name: 'description', type: 'text', rows: 3, group: 'business', description: 'Business description used in LocalBusiness/Organization structured data and default meta.'}),
    defineField({
      name: 'foundingYear',
      type: 'number',
      group: 'business',
      description: 'Optional. Leave empty until confirmed. No year is shown anywhere while empty.',
      validation: (r) => r.integer().min(1900).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'address',
      type: 'object',
      group: 'business',
      fields: [
        defineField({name: 'street', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'unit', title: 'Suite / unit', type: 'string', description: 'Single source for the suite everywhere (NAP, schema, footer, llms). Seeded "#27" per spec; the old site and Facebook say "Ste 23". PM/client to confirm (OQ-03).'}),
        defineField({name: 'city', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'region', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'postalCode', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'country', type: 'string', initialValue: 'US'}),
      ],
    }),
    defineField({name: 'footerAddressShowUnit', type: 'boolean', group: 'business', initialValue: false}),
    defineField({name: 'telephoneDisplay', title: 'Phone (as shown on site)', type: 'string', group: 'business', validation: (r) => r.required()}),
    defineField({name: 'telephoneE164', title: 'Phone (international, for Google)', type: 'string', group: 'business', description: 'Format +1-855-377-3339', validation: (r) => r.required().regex(/^\+1-\d{3}-\d{3}-\d{4}$/, {name: '+1-XXX-XXX-XXXX'})}),
    defineField({name: 'email', type: 'string', group: 'business', validation: (r) => r.required().email()}),
    defineField({name: 'notificationEmail', type: 'string', group: 'business', validation: (r) => r.email()}),
    defineField({name: 'geo', type: 'geopoint', group: 'business', description: 'Optional; only fill from a verified source.'}),
    defineField({name: 'googleListingName', type: 'string', group: 'business'}),
    defineField({name: 'spectrumAuthorizedRetailer', type: 'boolean', group: 'business', initialValue: true}),
    defineField({
      name: 'paymentMethods',
      type: 'array',
      group: 'business',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ['visa', 'mastercard', 'amex', 'discover', 'paypal', 'venmo']},
    }),
    defineField({
      name: 'hours',
      type: 'array',
      group: 'hours',
      of: [defineArrayMember({type: 'openingHours'})],
      description: 'Optional. While empty the site shows the placeholder below and omits hours from structured data.',
    }),
    defineField({name: 'hoursPlaceholder', type: 'string', group: 'hours', initialValue: 'Hours coming soon'}),
    defineField({name: 'hoursNote', type: 'string', group: 'hours'}),
    defineField({name: 'reviewRating', title: 'Google rating (e.g. 4.9)', type: 'number', group: 'links', description: 'Optional. Leave empty until verified in Google Business Profile (design P4). Never shown or emitted while empty.', validation: (r) => r.min(1).max(5)}),
    defineField({name: 'reviewCount', title: 'Google review count', type: 'number', group: 'links', description: 'Optional, verified count only.', validation: (r) => r.integer().min(0)}),
    defineField({name: 'mapsUrl', type: 'url', group: 'links'}),
    defineField({name: 'mapEmbedUrl', type: 'url', group: 'links'}),
    defineField({name: 'reviewUrl', type: 'url', group: 'links'}),
    defineField({name: 'scheduleUrl', type: 'url', group: 'links'}),
    defineField({name: 'financingUrl', type: 'url', group: 'links'}),
    defineField({name: 'homeInternetFormUrl', type: 'url', group: 'links'}),
    defineField({name: 'ebayUrl', type: 'url', group: 'links'}),
    defineField({
      name: 'socials',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({name: 'platform', type: 'string', options: {list: ['facebook', 'twitter', 'instagram', 'youtube']}, validation: (r) => r.required()}),
            defineField({name: 'url', type: 'url', validation: (r) => r.required()}),
            defineField({name: 'handle', type: 'string'}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({name: 'logo', type: 'image', group: 'brand', fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({name: 'logoDark', type: 'image', group: 'brand', fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({
      name: 'brandColor',
      title: 'Brand red (hex)',
      type: 'string',
      group: 'brand',
      readOnly: true,
      description: 'Sampled from the logo (#ED1C24). Reference only: the site uses design tokens. Fallback #E63946 if unsampled.',
      validation: (r) => r.regex(/^#[0-9A-F]{6}$/i, {name: 'hex'}),
    }),
    defineField({name: 'defaultSeo', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Business Info & Site Settings'})},
})

export const navigation = defineType({
  name: 'navigation',
  type: 'document',
  fields: [
    defineField({name: 'headerLinks', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({name: 'headerCta', type: 'cta'}),
    defineField({name: 'footerQuickLinks', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({name: 'footerLegalLinks', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({name: 'copyright', type: 'string'}),
  ],
  preview: {prepare: () => ({title: 'Navigation & Footer'})},
})

export const llmsContent = defineType({
  name: 'llmsContent',
  title: 'GEO: llms.txt content',
  type: 'document',
  fields: [
    defineField({name: 'shortVersion', title: '/llms.txt', type: 'text', rows: 30, description: 'Served verbatim as text/plain at /llms.txt (markdown).', validation: (r) => r.required()}),
    defineField({name: 'fullVersion', title: '/llms-full.txt', type: 'text', rows: 60, description: 'Served verbatim as text/plain at /llms-full.txt (markdown).', validation: (r) => r.required()}),
    defineField({name: 'lastReviewed', type: 'date'}),
  ],
  preview: {prepare: () => ({title: 'llms.txt / llms-full.txt'})},
})

const keyLabel = [
  defineField({name: 'key', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
]

export const quoteConfig = defineType({
  name: 'quoteConfig',
  title: 'Quote & Trade-in Options',
  type: 'document',
  fields: [
    defineField({
      name: 'deviceTypes',
      title: 'Repair quote: device types',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'deviceType', fields: [...keyLabel, defineField({name: 'models', type: 'array', of: [defineArrayMember({type: 'string'})], description: 'Empty = free-text model input.'})]})],
    }),
    defineField({name: 'repairIssues', type: 'array', of: [defineArrayMember({type: 'object', name: 'issue', fields: keyLabel})]}),
    defineField({name: 'tradeInDeviceTypes', type: 'array', of: [defineArrayMember({type: 'object', name: 'tradeInDeviceType', fields: keyLabel})]}),
    defineField({name: 'tradeInBrands', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({
      name: 'tradeInConditions',
      type: 'array',
      of: [defineArrayMember({type: 'object', name: 'condition', fields: [...keyLabel, defineField({name: 'description', type: 'string'})]})],
    }),
    defineField({
      name: 'tradeInModels',
      title: 'Trade-in: models per brand',
      type: 'array',
      description: 'Optional. Brands without a list get a free-text model field (design R05).',
      of: [defineArrayMember({type: 'object', name: 'brandModels', fields: [defineField({name: 'brand', type: 'string', validation: (r) => r.required()}), defineField({name: 'models', type: 'array', of: [defineArrayMember({type: 'string'})]})]})],
    }),
    defineField({name: 'consentLabel', title: 'Form consent checkbox label', type: 'string', description: 'Optional (design LeadFlow). Needs client approval before it is shown.'}),
    defineField({name: 'showPrices', type: 'boolean', initialValue: false, readOnly: true, description: 'Locked off: no public pricing (decision 5).'}),
    defineField({name: 'successMessage', type: 'string'}),
    defineField({name: 'errorMessage', type: 'string'}),
  ],
  preview: {prepare: () => ({title: 'Quote & Trade-in Options'})},
})

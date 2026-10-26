import {defineArrayMember, defineField, defineType} from 'sanity'
import {LEAD_ICONS} from '../objects'

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
    defineField({name: 'headerLinks', type: 'array', description: 'Design: 7 links (Services has a dropdown) + the Schedule Repair CTA.', of: [defineArrayMember({type: 'navLink'})], validation: (r) => r.max(7)}),
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
  defineField({name: 'key', type: 'string', readOnly: true, description: 'The value the form submits. Must match the site form schema (lib/forms/schemas.ts); change only with a code change.', validation: (r) => r.required()}),
  defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'description', type: 'string', description: 'Optional line under the option (v1.4).'}),
  defineField({name: 'icon', type: 'string', options: {list: LEAD_ICONS}, description: 'Icon drawn by the site (v1.4).'}),
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
      of: [defineArrayMember({type: 'object', name: 'condition', fields: keyLabel})],
    }),
    defineField({
      name: 'tradeInModels',
      title: 'Trade-in: models per brand',
      type: 'array',
      description: 'Optional. Brands without a list get a free-text model field (design R05).',
      of: [defineArrayMember({type: 'object', name: 'brandModels', fields: [defineField({name: 'brand', type: 'string', description: 'Must equal a trade-in brand value (lib/forms/schemas.ts).', options: {list: ['Apple', 'Samsung', 'LG', 'Google', 'Motorola', 'OnePlus', 'Other']}, validation: (r) => r.required()}), defineField({name: 'models', type: 'array', of: [defineArrayMember({type: 'string'})], description: 'Shown as a searchable list on the Model step. Empty = free-text input.'})]})],
    }),
    defineField({name: 'consentLabel', title: 'Form consent checkbox label', type: 'string', description: 'Optional (design LeadFlow). Needs client approval before it is shown.'}),
    defineField({name: 'showPrices', type: 'boolean', initialValue: false, readOnly: true, description: 'Locked off: no public pricing (decision 5).'}),
    defineField({name: 'successMessage', type: 'string'}),
    defineField({name: 'errorMessage', type: 'string'}),
  ],
  preview: {prepare: () => ({title: 'Quote & Trade-in Options'})},
})

/** v1.4 shared UI labels that were Frontend fixtures: embed frames, footer, policy layout. Field names = web types. */
const lbl = (name: string, title?: string) => defineField({name, type: 'string', ...(title ? {title} : {})})
export const uiCopy = defineType({
  name: 'uiCopy',
  title: 'Site labels',
  type: 'document',
  groups: [
    {name: 'embeds', title: 'Embeds', default: true},
    {name: 'footer', title: 'Footer'},
    {name: 'policies', title: 'Policy pages'},
    {name: 'shop', title: 'Product page & cart'},
    {name: 'a11y', title: 'Screen-reader text'},
    {name: 'notFound', title: '404 page'},
  ],
  fields: [
    defineField({name: 'embeds', type: 'object', group: 'embeds', fields: [
      defineField({name: 'square', title: 'Square booking', type: 'embedCopy'}),
      defineField({name: 'jotform', title: 'Jotform Home Internet sign-up', type: 'embedCopy'}),
      defineField({name: 'map', title: 'Google map', type: 'embedCopy'}),
    ]}),
    defineField({name: 'footer', type: 'object', group: 'footer', fields: [
      lbl('quickLinksLabel'), lbl('legalLabel'), lbl('paymentsLabel'), lbl('hoursLabel'), lbl('socialLabel'), lbl('spectrumLabel'), lbl('locality', 'Locality line'),
      defineField({name: 'paymentLabels', type: 'object', fields: ['paypal', 'venmo', 'visa', 'mastercard', 'amex', 'discover'].map((m) => lbl(m))}),
    ]}),
    defineField({name: 'policyChrome', title: 'Policy page labels', type: 'object', group: 'policies', description: 'Per-policy sub-lines live on each Policy page (subline).', fields: [
      lbl('tocLabel'), lbl('introLabel'), lbl('lastUpdatedLabel'), lbl('sourceLabel'), lbl('otherPoliciesLabel'), lbl('reviewLabel', 'Pending-review note'),
    ]}),
    defineField({name: 'productPage', title: 'Product page buy box', type: 'object', group: 'shop', fields: [
      lbl('optionLabel'), lbl('addLabel', 'Add to cart'), lbl('addingLabel', 'Adding (busy)'), lbl('addedLabel', 'Added'), lbl('soldOutLabel'), lbl('viewCartLabel'),
      // v1.6: design shop-product.html buy box + related row
      lbl('inStockLabel', 'In stock'), lbl('viewLabel', 'Product card "View" link'),
      lbl('acimaLabel', 'Acima button label'), lbl('acimaNote', 'Note under the Acima button'),
      defineField({name: 'assurances', title: 'Assurance rows', type: 'array', description: 'Shown under the buy box, in this order. Keep the policy facts in line with the Shipping & Return Policy page.', of: [{
        type: 'object', name: 'pdpAssurance',
        fields: [
          defineField({name: 'key', title: 'Icon', type: 'string', options: {list: ['shipping', 'returns', 'store', 'payments']}, validation: (r) => r.required()}),
          defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
          defineField({name: 'body', type: 'string'}),
          defineField({name: 'linkLabel', type: 'string'}),
          defineField({name: 'linkHref', title: 'Link URL or path', type: 'string', description: 'e.g. /policies/shipping-return'}),
        ],
        preview: {select: {title: 'title', subtitle: 'key'}},
      }]}),
      defineField({name: 'related', title: 'Related products heading', type: 'object', fields: [lbl('eyebrow'), lbl('heading')]}),
    ]}),
    defineField({name: 'notFound', title: '404 page', type: 'object', group: 'notFound', description: 'Shown for any URL that does not exist.', fields: [
      lbl('heading'), defineField({name: 'body', type: 'text', rows: 2}), lbl('homeLabel', 'Button label'), lbl('homeHref', 'Button link (path)'),
    ]}),
    defineField({name: 'cartDrawer', title: 'Cart drawer', type: 'object', group: 'shop', fields: [
      lbl('title'), lbl('closeLabel'), lbl('emptyTitle'), lbl('emptyBody'), lbl('subtotalLabel'), lbl('checkoutNote'), lbl('checkoutLabel'), lbl('continueLabel'),
      lbl('quantityLabel'), lbl('decreaseLabel'), lbl('increaseLabel'),
    ]}),
    defineField({name: 'a11y', title: 'Screen-reader-only text', type: 'object', group: 'a11y', description: 'Not visible on screen; read by screen readers.', fields: [
      lbl('loading', 'Loading'),
      defineField({name: 'opensInNewTab', title: 'Opens in a new tab', type: 'string', description: 'Appended to external links, e.g. "(opens in a new tab)". A leading space is added automatically.'}),
    ]}),
  ],
  preview: {prepare: () => ({title: 'Site labels'})},
})

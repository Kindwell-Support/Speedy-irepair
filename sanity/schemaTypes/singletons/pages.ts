import {defineArrayMember, defineField, defineType} from 'sanity'
import {heroField, seoField, seoGroups} from '../helpers'

const g = 'content'
const refs = (name: string, to: string, extra: Record<string, unknown> = {}) =>
  defineField({name, type: 'array', group: g, of: [defineArrayMember({type: 'reference', to: [{type: to}]})], ...extra})
const heading = (name: string) => defineField({name, type: 'sectionHeading', group: g})
const steps = (name: string, n?: number) =>
  defineField({name, type: 'array', group: g, of: [defineArrayMember({type: 'step'})], validation: n ? (r) => r.length(n) : undefined})
const ctas = (name = 'ctas') => defineField({name, type: 'array', group: g, of: [defineArrayMember({type: 'cta'})]})
const strings = (name: string) => defineField({name, type: 'array', group: g, of: [defineArrayMember({type: 'string'})]})

/** v1.3: every page has `intro` (visible page intro under the hero; G4 copy on quote/schedule = Service schema description). */
const introField = defineField({name: 'intro', title: 'Page intro (visible, under the hero)', type: 'text', rows: 3, group: g})
const page = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineType({
    name,
    title,
    type: 'document',
    groups: seoGroups,
    fields: [heroField, ...(fields.some((f) => f.name === 'intro') ? [] : [introField]), ...fields, seoField],
    preview: {prepare: () => ({title})},
  })

export const homePage = page('homePage', 'Home', [
  defineField({name: 'heroPoster', title: 'Hero poster image (3D fallback / LCP)', type: 'image', group: g, fields: [defineField({name: 'alt', type: 'string'})]}),
  defineField({name: 'speakable', type: 'boolean', group: g, initialValue: true}),
  heading('servicesHeading'),
  refs('services', 'service', {validation: (r: {length: (n: number) => unknown}) => r.length(8)}),
  heading('howItWorksHeading'),
  steps('howItWorksSteps', 4),
  heading('brandsHeading'),
  refs('brands', 'brand'),
  heading('whyChooseUsHeading'),
  defineField({
    name: 'valueProps',
    type: 'array',
    group: g,
    of: [defineArrayMember({type: 'object', name: 'valueProp', fields: [defineField({name: 'title', type: 'string', validation: (r) => r.required()}), defineField({name: 'description', type: 'string'}), defineField({name: 'statValue', title: 'Stat value (e.g. 45)', type: 'string', description: 'Optional. Only a real number from the brief; otherwise the icon shows.'}), defineField({name: 'statLabel', title: 'Stat unit (e.g. min)', type: 'string'}), defineField({name: 'icon', type: 'riveIcon'})]})],
  }),
  heading('testimonialsHeading'),
  defineField({name: 'showLeaveReviewLink', type: 'boolean', group: g, initialValue: true}),
  defineField({name: 'testimonialsMax', type: 'number', group: g, initialValue: 6}),
  heading('promotionsHeading'),
  heading('faqHeading'),
  refs('faqs', 'faq'),
  heading('locationHeading'),
  heading('contactHeading'),
  defineField({name: 'directionsLabel', type: 'string', group: g, initialValue: 'Get Directions'}),
  defineField({name: 'showContactForm', type: 'boolean', group: g, initialValue: true}),
  defineField({
    name: 'newsletter',
    type: 'object',
    group: g,
    fields: [
      defineField({name: 'eyebrow', type: 'string'}),
      defineField({name: 'heading', type: 'string'}),
      defineField({name: 'placeholder', type: 'string'}),
      defineField({name: 'buttonLabel', type: 'string'}),
      defineField({name: 'successMessage', type: 'string'}),
    ],
  }),
])

export const servicesPage = page('servicesPage', 'Services', [
  defineField({name: 'intro', type: 'text', group: g}),
  refs('services', 'service', {validation: (r: {length: (n: number) => unknown}) => r.length(14)}),
  heading('faqHeading'),
  refs('faqs', 'faq'),
])

export const shopPage = page('shopPage', 'Shop', [
  defineField({
    name: 'categories',
    type: 'array',
    group: g,
    of: [
      defineArrayMember({
        type: 'object',
        name: 'category',
        fields: [
          defineField({name: 'key', type: 'string', options: {list: ['iphones', 'ipads', 'apple-watch', 'macbooks', 'accessories']}, validation: (r) => r.required()}),
          defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
          defineField({name: 'shopifyCollectionHandle', type: 'string', description: 'Only used if the shop is headless Shopify.'}),
        ],
      }),
    ],
  }),
  defineField({name: 'emptyStateText', type: 'string', group: g}),
  defineField({name: 'ctaFallback', type: 'cta', group: g}),
])

export const sellYourDevicePage = page('sellYourDevicePage', 'Sell Your Device', [
  heading('howItWorksHeading'),
  steps('howItWorksSteps', 3),
  heading('formHeading'),
  defineField({name: 'formIntro', type: 'text', group: g}),
  heading('brandsHeading'),
  refs('brandsAccepted', 'brand'),
  ctas(),
])

export const instantQuotePage = page('instantQuotePage', 'Instant Quote', [
  defineField({name: 'intro', title: 'Intro (visible; also the Service schema description)', type: 'text', group: g}),
  heading('formHeading'),
  strings('stepLabels'),
  defineField({name: 'noPricingNote', type: 'text', group: g}),
  defineField({name: 'ctaAfterSubmit', type: 'cta', group: g}),
])

export const scheduleRepairPage = page('scheduleRepairPage', 'Schedule Repair', [
  defineField({name: 'intro', title: 'Intro (visible; also the Service schema description)', type: 'text', group: g}),
  heading('whatToExpectHeading'),
  defineField({name: 'whatToExpect', type: 'richText', group: g}),
  strings('whatToBring'),
  heading('bookingHeading'),
  heading('locationHeading'),
  defineField({name: 'showLocation', type: 'boolean', group: g, initialValue: true}),
  defineField({name: 'squareEmbedUrl', type: 'url', group: g, description: 'Defaults to Site Settings → scheduleUrl.'}),
  defineField({name: 'embedFallbackCta', type: 'cta', group: g}),
])

export const faqPage = page('faqPage', 'FAQ', [refs('faqs', 'faq')])

export const aboutPage = page('aboutPage', 'About', [
  heading('whoWeAreHeading'),
  defineField({name: 'aboutBusiness', type: 'richText', group: g}),
  defineField({name: 'aboutIsPlaceholder', type: 'boolean', group: g, initialValue: true}),
  defineField({name: 'mission', type: 'text', group: g}),
  heading('storyHeading'),
  defineField({name: 'story', title: 'Why we started', type: 'richText', group: g}),
  defineField({name: 'storyIsPlaceholder', type: 'boolean', group: g, initialValue: true}),
  heading('valuesHeading'),
  defineField({
    name: 'values',
    type: 'array',
    group: g,
    of: [defineArrayMember({type: 'object', name: 'value', fields: [defineField({name: 'title', type: 'string'}), defineField({name: 'description', type: 'string'})]})],
  }),
  heading('teamHeading'),
  refs('team', 'teamMember'),
  defineField({name: 'spectrumBadge', type: 'image', group: g, fields: [defineField({name: 'alt', type: 'string'})]}),
  defineField({name: 'spectrumText', type: 'string', group: g}),
  ctas(),
  heading('locationHeading'),
  defineField({name: 'showMap', type: 'boolean', group: g, initialValue: true}),
  heading('contactHeading'),
  defineField({name: 'showContactForm', type: 'boolean', group: g, initialValue: true}),
])

export const financingPage = page('financingPage', 'Financing', [
  heading('whatIsAcimaHeading'),
  defineField({name: 'whatIsAcima', type: 'richText', group: g}),
  heading('howItWorksHeading'),
  steps('howItWorksSteps', 3),
  heading('whatYouCanFinanceHeading'),
  strings('whatYouCanFinance'),
  defineField({name: 'applyCta', type: 'cta', group: g}),
  defineField({name: 'acimaLogo', type: 'image', group: g, description: 'Licensed Acima logo (design open issue 7).', fields: [defineField({name: 'alt', type: 'string'})]}),
  heading('faqHeading'),
  refs('faqs', 'faq'),
])

export const homeInternetPage = page('homeInternetPage', 'Home Internet', [
  heading('whatYouGetHeading'),
  strings('whatYouGet'),
  heading('whoItsForHeading'),
  defineField({name: 'whoItsFor', type: 'text', group: g}),
  heading('howToSignUpHeading'),
  defineField({name: 'howToSignUp', type: 'text', group: g}),
  heading('signUpHeading'),
  defineField({name: 'embedMode', type: 'string', group: g, options: {list: ['iframe', 'wrapper']}, initialValue: 'iframe'}),
  defineField({name: 'jotformUrl', type: 'url', group: g}),
  defineField({name: 'spectrumBadge', type: 'image', group: g, description: 'Licensed Spectrum Authorized Retailer badge.', fields: [defineField({name: 'alt', type: 'string'})]}),
  heading('faqHeading'),
  refs('faqs', 'faq'),
])

export const pageSingletons = [homePage, servicesPage, shopPage, sellYourDevicePage, instantQuotePage, scheduleRepairPage, faqPage, aboutPage, financingPage, homeInternetPage]

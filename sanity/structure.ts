import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {SHOP_SOURCE} from './schemaTypes'

/** Page singletons in route order: [_id/_type, title, route]. */
export const PAGE_SINGLETONS: [string, string, string][] = [
  ['homePage', 'Home', '/'],
  ['servicesPage', 'Services', '/services'],
  ['shopPage', 'Shop', '/shop'],
  ['sellYourDevicePage', 'Sell Your Device', '/sell-your-device'],
  ['instantQuotePage', 'Instant Quote', '/instant-quote'],
  ['scheduleRepairPage', 'Schedule Repair', '/schedule-repair'],
  ['faqPage', 'FAQ', '/faq'],
  ['aboutPage', 'About', '/about'],
  ['financingPage', 'Financing', '/financing'],
  ['homeInternetPage', 'Home Internet', '/home-internet'],
]

export const structure: StructureResolver = (S, context) => {
  const singleton = (id: string, title: string) =>
    S.listItem().id(id).title(title).child(S.document().schemaType(id).documentId(id).title(title))
  const ordered = (type: string, title: string, extra: {filter?: string; id?: string; params?: Record<string, unknown>} = {}) =>
    orderableDocumentListDeskItem({type, title, S, context, ...extra})

  return S.list()
    .title('Speedy iRepair')
    .items([
      S.listItem().id('pages').title('Pages').child(S.list().title('Pages').items(PAGE_SINGLETONS.map(([id, t]) => singleton(id, t)))),
      ordered('service', 'Services'),
      S.listItem()
        .id('shop')
        .title('Shop')
        .child(
          S.list()
            .title('Shop')
            .items([
              singleton('shopPage', 'Shop page'),
              ordered('shopCollectionConfig', 'Categories (Shopify collections, editorial)', {id: 'shop-categories'}),
              ...(SHOP_SOURCE === 'sanity' ? [ordered('product', 'Products', {id: 'products'})] : []),
            ]),
        ),
      S.listItem()
        .id('faqs')
        .title('FAQs')
        .child(
          S.list()
            .title('FAQs')
            .items([
              ordered('faq', 'All FAQs (drag to reorder)', {id: 'faq-all'}),
              S.listItem().id('faq-flagged').title('Flagged for review').child(S.documentList().title('Flagged for review').schemaType('faq').filter('_type == "faq" && flaggedForReview == true')),
              S.divider(),
              ...['general', 'repair', 'financing', 'homeInternet', 'shop', 'tradeIn'].map((c) =>
                S.listItem().id(`faq-${c}`).title(`Category: ${c}`).child(S.documentList().title(c).schemaType('faq').filter('_type == "faq" && $c in categories').params({c})),
              ),
            ]),
        ),
      ordered('testimonial', 'Testimonials'),
      ordered('promotion', 'Promotions & banner'),
      ordered('teamMember', 'Team'),
      S.documentTypeListItem('policyPage').id('policies').title('Policies'),
      S.divider(),
      S.listItem()
        .id('seo')
        .title('SEO')
        .child(
          S.list()
            .title('SEO')
            .items([
              S.listItem().id('seo-all').title('Every page with SEO fields').child(S.documentList().title('Pages with SEO').filter('defined(seo) || _type in $t').params({t: PAGE_SINGLETONS.map(([id]) => id)})),
              S.listItem().id('seo-missing').title('Missing meta title/description').child(S.documentList().title('Missing SEO').filter('_type in $t && (!defined(seo.metaTitle) || !defined(seo.metaDescription))').params({t: [...PAGE_SINGLETONS.map(([id]) => id), 'service', 'policyPage', 'product']})),
              singleton('siteSettings', 'Default SEO / OG image (Site Settings)'),
            ]),
        ),
      singleton('llmsContent', 'GEO / AI Discovery (llms.txt)'),
      S.listItem()
        .id('business')
        .title('Business Info')
        .child(
          S.list()
            .title('Business Info')
            .items([
              singleton('siteSettings', 'Business info & hours'),
              singleton('navigation', 'Navigation & footer'),
              singleton('quoteConfig', 'Quote & trade-in options'),
              ordered('brand', 'Brands', {id: 'brands'}),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id('submissions')
        .title('Submissions')
        .child(
          S.list()
            .title('Submissions')
            .items([
              S.listItem().id('sub-new').title('New (all forms)').child(S.documentList().title('New').schemaType('formSubmission').filter('_type == "formSubmission" && status == "new"').defaultOrdering([{field: 'submittedAt', direction: 'desc'}])),
              ...[
                ['quote', 'Instant quotes'],
                ['tradeIn', 'Trade-ins'],
                ['contact', 'Contact'],
                ['newsletter', 'Newsletter'],
              ].map(([k, t]) =>
                S.listItem().id(`sub-${k}`).title(t).child(S.documentList().title(t).schemaType('formSubmission').filter('_type == "formSubmission" && type == $k').params({k}).defaultOrdering([{field: 'submittedAt', direction: 'desc'}])),
              ),
            ]),
        ),
    ])
}

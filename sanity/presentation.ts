import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'
import {PAGE_SINGLETONS} from './structure'

/** Maps documents ⇄ staging routes for the Presentation tool (Next draft mode). */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    ...PAGE_SINGLETONS.map(([id, , route]) => ({route, filter: `_id == "${id}"`})),
    {route: '/policies/:slug', filter: `_type == "policyPage" && slug.current == $slug`},
    {route: '/shop/:slug', filter: `_type == "product" && slug.current == $slug`},
  ]),
  locations: {
    ...Object.fromEntries(
      PAGE_SINGLETONS.map(([id, title, route]) => [id, defineLocations({message: title, locations: [{title, href: route}]})]),
    ),
    service: defineLocations({
      select: {title: 'title', slug: 'slug.current', home: 'showOnHomepage'},
      resolve: (d) => ({
        locations: [
          {title: `${d?.title} on /services`, href: `/services#${d?.slug}`},
          ...(d?.home ? [{title: 'Homepage services grid', href: '/'}] : []),
        ],
      }),
    }),
    faq: defineLocations({locations: [{title: 'FAQ', href: '/faq'}, {title: 'Home', href: '/'}]}),
    testimonial: defineLocations({locations: [{title: 'Home (testimonials)', href: '/'}]}),
    promotion: defineLocations({locations: [{title: 'Home (banner + promotions)', href: '/'}]}),
    teamMember: defineLocations({locations: [{title: 'About', href: '/about'}]}),
    brand: defineLocations({locations: [{title: 'Home (brands)', href: '/'}, {title: 'Sell Your Device', href: '/sell-your-device'}]}),
    policyPage: defineLocations({select: {title: 'title', slug: 'slug.current'}, resolve: (d) => ({locations: [{title: d?.title ?? 'Policy', href: `/policies/${d?.slug}`}]})}),
    siteSettings: defineLocations({message: 'Used on every page (header, footer, contact, JSON-LD)', locations: [{title: 'Home', href: '/'}]}),
    navigation: defineLocations({message: 'Header + footer on every page', locations: [{title: 'Home', href: '/'}]}),
  },
}

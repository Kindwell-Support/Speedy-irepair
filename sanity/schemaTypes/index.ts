import {objectTypes} from './objects'
import {llmsContent, navigation, quoteConfig, siteSettings} from './singletons/settings'
import {pageSingletons} from './singletons/pages'
import {brand, faq, formSubmission, policyPage, product, promotion, service, teamMember, testimonial} from './documents'

/** Set from the Architect's shop decision (OQ-09). 'sanity' = option (a), 'shopify' = option (b). */
export const SHOP_SOURCE: 'sanity' | 'shopify' = (process.env.SANITY_STUDIO_SHOP_SOURCE as 'sanity' | 'shopify') || 'shopify'

export const SINGLETON_IDS = ['siteSettings', 'navigation', 'llmsContent', 'quoteConfig', ...pageSingletons.map((p) => p.name)] as const

export const schemaTypes = [
  ...objectTypes,
  siteSettings,
  navigation,
  llmsContent,
  quoteConfig,
  ...pageSingletons,
  service,
  faq,
  testimonial,
  promotion,
  teamMember,
  brand,
  policyPage,
  formSubmission,
  ...(SHOP_SOURCE === 'sanity' ? [product] : []),
]

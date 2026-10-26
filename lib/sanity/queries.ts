/**
 * ALL GROQ lives here (enforced by ESLint: `groq`/`defineQuery` may only be imported in lib/sanity).
 *
 * ADAPTER: reads the CMS Engineer's frozen schema (cms/SCHEMA_CONTRACT.md v1.1, vendored into
 * sanity/schemaTypes) and projects it into the Frontend view-model types in lib/sanity/types.ts.
 * Components never see raw Sanity field names. Missing/null fields are back-filled from fixtures
 * by lib/sanity/content.ts (mergeFallback), so a half-filled dataset never breaks a page.
 * Field-by-field mapping table: docs/CONTRACT_SANITY.md §3.
 */
import { defineQuery } from "next-sanity";

const image = /* groq */ `{
  "src": asset->url,
  "alt": coalesce(alt, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  "isSanity": true
}`;

/** contract `link`/`cta` → CtaLink */
const cta = /* groq */ `{
  label,
  "href": select(linkType == "external" => externalUrl, internalPath),
  "external": linkType == "external",
  "variant": select(variant == "ghost" => "link", variant)
}`;

/** contract `seo` → Seo (noindex → noIndex) */
const seoFields = /* groq */ `{ metaTitle, metaDescription, "noIndex": noindex, canonicalOverride, "ogImage": ogImage${image} }`;
const seo = `"seo": seo${seoFields}`;

/** contract `hero` (heading/subheading/ctas[max 2]) → PageHero */
const hero = /* groq */ `"hero": hero{ eyebrow, "headline": heading, "subline": subheading, "primaryCta": ctas[0]${cta}, "secondaryCta": ctas[1]${cta} }`;

/** contract `sectionHeading` → SectionCopy */
const heading = /* groq */ `{ "heading": heading, "intro": subheading }`;

const promoWindow = /* groq */ `active == true && (!defined(startsAt) || startsAt <= now()) && (!defined(endsAt) || endsAt > now())`;

// ---------- Global ----------
export const siteSettingsQuery = defineQuery(`{
  "business": *[_id == "siteSettings"][0]{
    "name": businessName, legalName, tagline,
    "address": address{ street, "suite": unit, city, "state": region, "zip": postalCode, country },
    "footerAddressLine": address.street + select(footerAddressShowUnit == true && defined(address.unit) => " " + address.unit, "") + ", " + address.city + ", " + address.region + " " + address.postalCode,
    "phone": telephoneDisplay, email,
    "hoursRows": hours[]{ days, opens, closes, closed },
    "hoursPlaceholderText": hoursPlaceholder,
    "hoursSource": hoursNote,
    foundingYear,
    "geo": select(defined(geo.lat) => { "lat": geo.lat, "lng": geo.lng }, null),
    "socials": socials[]{ platform, "label": platform, url, handle },
    "externalLinks": {
      "schedule": scheduleUrl, "financing": financingUrl, "homeInternetSignup": homeInternetFormUrl,
      "ebay": ebayUrl, "review": reviewUrl, "maps": mapsUrl,
      "facebook": socials[platform == "facebook"][0].url, "twitter": socials[platform == "twitter"][0].url,
      "instagram": socials[platform == "instagram"][0].url, "youtube": socials[platform == "youtube"][0].url
    },
    "paymentsAccepted": paymentMethods, notificationEmail,
    "googleMapsEmbedUrl": mapEmbedUrl, spectrumAuthorizedRetailer,
    "logo": logo${image}, "logoInverse": logoDark${image}
  },
  "navigation": *[_id == "navigation"][0]{
    "primary": headerLinks[]${cta}, "headerCta": headerCta${cta},
    "footerQuickLinks": footerQuickLinks[]${cta}, "footerLegalLinks": footerLegalLinks[]${cta}
  },
  "copyright": *[_id == "navigation"][0].copyright,
  "defaultSeo": *[_id == "siteSettings"][0].defaultSeo${seoFields}
}`);

/** Banner = first active promotion with "banner" placement inside its date window (contract §3.4). */
export const announcementQuery = defineQuery(`*[_type == "promotion" && "banner" in placements && ${promoWindow}] | order(orderRank asc)[0]{
  "id": _id, text,
  "href": select(link.linkType == "external" => link.externalUrl, link.internalPath),
  "external": link.linkType == "external", "enabled": true
}`);

export const promotionsQuery = defineQuery(`*[_type == "promotion" && "homepage" in placements && ${promoWindow}] | order(orderRank asc){
  "id": _id, title, "body": text, "cta": link${cta}, "order": 0
}`);

// ---------- Collections ----------
/** /services sections in servicesPage reference order (14). */
export const servicesQuery = defineQuery(`*[_id == "servicesPage"][0].services[]->{
  "id": _id, "slug": slug.current, title, "summary": snippetParagraph, body, "ctas": ctas[]${cta},
  "riveIcon": slug.current, "order": 0, "isPlaceholder": flaggedForReview, ${seo}
}`);

const faqFields = /* groq */ `{ "id": _id, question, answer, "categories": [], "order": 0, "isPlaceholder": flaggedForReview }`;
/** FAQs shown on a page = that page's references, in order (contract §3.2). $pageId: homePage|faqPage|servicesPage|financingPage|homeInternetPage */
export const faqsForPageQuery = defineQuery(`*[_id == $pageId][0].faqs[]->${faqFields}`);
export const allFaqsQuery = defineQuery(`*[_type == "faq"] | order(orderRank asc)${faqFields}`);

/** Featured testimonials. Placeholders keep rating/body null; UI renders "Reviews coming soon" (contract §3.3). */
export const testimonialsQuery = defineQuery(`*[_type == "testimonial" && featured != false] | order(orderRank asc)[0...12]{
  "id": _id, "author": coalesce(authorName, ""), rating, "text": coalesce(body, ""), source, sourceUrl,
  "date": reviewDate, isPlaceholder
}`);

export const teamMembersQuery = defineQuery(`*[_type == "teamMember"] | order(orderRank asc){
  "id": _id, name, role, bio, "photo": photo${image}, "order": 0, isPlaceholder
}`);

export const brandsQuery = defineQuery(`*[_type == "brand"] | order(orderRank asc){
  "id": _id, name, "shortName": coalesce(tradeInLabel, name), "logo": logo${image},
  "repairs": coalesce(repaired, true), "acceptsTradeIn": coalesce(acceptedForTradeIn, false), "order": 0
}`);

/** Value props are embedded in homePage (contract §2.5). */
export const valuePropsQuery = defineQuery(`*[_id == "homePage"][0].valueProps[]{
  "id": _key, title, "detail": description, "speakable": true, "order": 0
}`);

/** Steps are embedded per page: home → homePage, sell → sellYourDevicePage, financing → financingPage. */
export const howItWorksStepsQuery = defineQuery(`*[_id == $pageId][0].howItWorksSteps[]{
  "id": _key, "set": $set, title, "body": description, "order": 0
}`);

// ---------- Page singletons ----------
export const homePageQuery = defineQuery(`*[_id == "homePage"][0]{
  "title": hero.heading, ${hero}, "heroPoster": heroPoster${image}, ${seo},
  "serviceCardsSection": servicesHeading${heading},
  "serviceCards": services[]->{
    "id": _id, "title": coalesce(cardTitle, title), "description": coalesce(cardDescription, ""),
    "href": coalesce(cardHref, "/services#" + slug.current), "riveIcon": slug.current, "order": 0
  },
  "howItWorksSection": howItWorksHeading${heading},
  "brandsSection": brandsHeading${heading},
  "whySection": whyChooseUsHeading${heading},
  "testimonialsSection": testimonialsHeading${heading},
  "promotionsSection": promotionsHeading${heading},
  "faqSection": faqHeading${heading},
  "locationSection": locationHeading{ "heading": heading, "intro": subheading, "directionsLabel": ^.directionsLabel },
  "newsletter": newsletter{ heading, "emailLabel": placeholder, buttonLabel, successMessage }
}`);

/**
 * Other page singletons: hero + seo + the page-specific fields that map 1:1 onto the view model.
 * Everything the contract does not model (section wrappers, labels) is back-filled from fixtures.
 */
export const pageSingletonQuery = defineQuery(`*[_id == $type][0]{
  "title": hero.heading, ${hero}, ${seo},
  "faqSection": faqHeading${heading},
  "squareBookingUrl": coalesce(squareEmbedUrl, *[_id == "siteSettings"][0].scheduleUrl),
  "jotformUrl": coalesce(jotformUrl, *[_id == "siteSettings"][0].homeInternetFormUrl),
  "applyCta": applyCta${cta},
  "intro": intro
}`);

export const policyPageQuery = defineQuery(`*[_type == "policyPage" && slug.current == $slug][0]{
  "slug": slug.current, title, body, sourceUrl, isPlaceholder, ${seo}
}`);

export const llmsDocumentQuery = defineQuery(`*[_id == "llmsContent"][0]{ "llms": shortVersion, "llmsFull": fullVersion }`);

/** Shop category labels + Shopify collection handles (contract §2.5 shopPage.categories, §3.6 option b). */
export const shopCategoriesQuery = defineQuery(`*[_id == "shopPage"][0].categories[]{
  "handle": coalesce(shopifyCollectionHandle, key), "title": label, "featuredProductHandles": [], "order": 0
}`);

/**
 * Cache tags = contract `_type` names (contract §5.3). /api/revalidate revalidates the changed `_type`
 * plus "sanity", "seo" (and "llms" for llmsContent). siteSettings/navigation are also tagged on every page.
 */
export const TAGS = {
  siteSettings: "siteSettings",
  navigation: "navigation",
  promotion: "promotion",
  service: "service",
  faq: "faq",
  testimonial: "testimonial",
  teamMember: "teamMember",
  brand: "brand",
  policyPage: "policyPage",
  llmsContent: "llmsContent",
  homePage: "homePage",
  servicesPage: "servicesPage",
  shopPage: "shopPage",
  sellYourDevicePage: "sellYourDevicePage",
  instantQuotePage: "instantQuotePage",
  scheduleRepairPage: "scheduleRepairPage",
  faqPage: "faqPage",
  aboutPage: "aboutPage",
  financingPage: "financingPage",
  homeInternetPage: "homeInternetPage",
} as const;

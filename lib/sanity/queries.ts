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
  "isSanity": string::startsWith(coalesce(asset->url, ""), "https://cdn.sanity.io")
}`;

/** contract `link`/`cta` → CtaLink */
const cta = /* groq */ `{
  label,
  "href": select(linkType == "external" => externalUrl, internalPath),
  "external": linkType == "external" && !string::startsWith(coalesce(externalUrl, ""), "tel:") && !string::startsWith(coalesce(externalUrl, ""), "mailto:"),
  "variant": select(variant == "ghost" => "link", variant)
}`;

/** contract `seo` → Seo (noindex → noIndex) */
const seoFields = /* groq */ `{ metaTitle, metaDescription, "noIndex": noindex, canonicalOverride, "ogImage": ogImage${image} }`;
const seo = `"seo": seo${seoFields}`;

/** contract `hero` (heading/subheading/ctas[max 2]) → PageHero */
const hero = /* groq */ `"hero": hero{ eyebrow, "headline": heading, "subline": subheading, "primaryCta": ctas[0]${cta}, "secondaryCta": ctas[1]${cta} }`;

/** contract `sectionHeading` → SectionCopy */
const heading = /* groq */ `{ "eyebrow": eyebrow, "heading": heading, "intro": subheading }`;

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
    "primary": headerLinks[]{ ${cta.slice(1, -1)}, "children": children[]${cta} }, "headerCta": headerCta${cta},
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
  "id": _id, title, "body": text, badge, "cta": link${cta}, "order": 0
}`);

// ---------- Collections ----------
/** /services sections in servicesPage reference order (14). */
export const servicesQuery = defineQuery(`*[_id == "servicesPage"][0].services[]->{
  "id": _id, "slug": slug.current, title, "summary": snippetParagraph, "body": coalesce(body, []), "ctas": coalesce(ctas[]${cta}, []),
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
  "id": _key, title, "detail": description, "speakable": true, "order": 0,
  "stat": select(defined(statValue) => { "value": statValue, "label": statLabel }, null)
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
  "locationSection": locationHeading{ eyebrow, "heading": heading, "intro": subheading, "directionsLabel": ^.directionsLabel },
  "contactSection": contactHeading${heading},
  "intro": intro,
  "newsletter": newsletter{ eyebrow, heading, "emailLabel": placeholder, buttonLabel, successMessage }
}`);

/**
 * Other page singletons: hero + seo + the page-specific fields that map 1:1 onto the view model.
 * Everything the contract does not model (section wrappers, labels) is back-filled from fixtures.
 */
export const pageSingletonQuery = defineQuery(`*[_id == $type][0]{
  "title": hero.heading, ${hero}, ${seo},
  "faqSection": faqHeading${heading},
  "intro": intro,
  // v1.3 section headings (eyebrow/heading/intro). Keys absent on a page project to null and are ignored.
  "howItWorksSection": howItWorksHeading${heading},
  "formSection": formHeading{ eyebrow, heading, "intro": coalesce(subheading, ^.formIntro) },
  "brandsSection": brandsHeading${heading},
  "whatToExpect": whatToExpectHeading{ eyebrow, heading, "intro": subheading, "body": ^.whatToExpect },
  "bookingSection": bookingHeading${heading},
  "locationSection": locationHeading${heading},
  "aboutSection": whoWeAreHeading{ eyebrow, heading, "intro": subheading, "body": ^.aboutBusiness, "isPlaceholder": coalesce(^.aboutIsPlaceholder, false) },
  "storySection": storyHeading{ eyebrow, heading, "intro": subheading, "body": ^.story, "isPlaceholder": coalesce(^.storyIsPlaceholder, false) },
  "valuesSection": valuesHeading{ eyebrow, heading, "intro": subheading, "items": ^.values[]{ title, "body": description } },
  // v1.5 pre-footer CTA band (about, financing): ctaHeading + the page's ctas[].
  "ctaSection": ctaHeading{ eyebrow, heading, "intro": subheading, "ctas": ^.ctas[]${cta} },
  "teamSection": teamHeading${heading},
  "contactSection": contactHeading${heading},
  "whatIsSection": whatIsAcimaHeading{ eyebrow, heading, "intro": subheading, "body": ^.whatIsAcima, "highlights": ^.whatIsAcimaHighlights, "visualLabel": ^.acimaVisualLabel },
  // v1.5: financeItems[{title, description}] wins over the deprecated whatYouCanFinance[]; itemBodyList → itemBodies (Record) in content.ts.
  "whatYouCanFinanceSection": whatYouCanFinanceHeading{ eyebrow, heading, "intro": subheading,
    "items": select(count(^.financeItems) > 0 => ^.financeItems[].title, ^.whatYouCanFinance),
    "itemBodyList": ^.financeItems[defined(description)]{ title, description } },
  "whatYouGetSection": whatYouGetHeading{ eyebrow, heading, "intro": subheading, "items": ^.whatYouGet },
  "whoItsForSection": whoItsForHeading{ eyebrow, heading, "intro": coalesce(subheading, ^.whoItsFor) },
  "howToSignUpSection": howToSignUpHeading{ eyebrow, heading, "intro": coalesce(subheading, ^.howToSignUp) },
  "signUpSection": signUpHeading${heading},
  "squareBookingUrl": coalesce(squareEmbedUrl, *[_id == "siteSettings"][0].scheduleUrl),
  "jotformUrl": coalesce(jotformUrl, *[_id == "siteSettings"][0].homeInternetFormUrl),
  "applyCta": applyCta${cta},
}`);

export const policyPageQuery = defineQuery(`*[_type == "policyPage" && slug.current == $slug][0]{
  "slug": slug.current, eyebrow, title, subline, body, sourceUrl, lastUpdated, isPlaceholder,
  "needsReview": coalesce(needsReview, false), reviewNote, ${seo}
}`);

export const llmsDocumentQuery = defineQuery(`*[_id == "llmsContent"][0]{ "llms": shortVersion, "llmsFull": fullVersion }`);

/**
 * Shop category editorial (contract v1.2 §3.6, headless Shopify): one `shopCollectionConfig` per Shopify
 * collection, in Studio drag order. Falls back to the v1.1 `shopPage.categories` list while none exist.
 */
export const shopCategoriesQuery = defineQuery(`select(
  count(*[_type == "shopCollectionConfig"]) > 0 => *[_type == "shopCollectionConfig"] | order(orderRank asc){
    handle, title, description, "heroImage": heroImage${image}, "featuredProductHandles": coalesce(featuredProductHandles, []), "order": 0, ${seo}
  },
  *[_id == "shopPage"][0].categories[]{
    "handle": coalesce(shopifyCollectionHandle, key), "title": label, "featuredProductHandles": [], "order": 0
  }
)`);

/**
 * Cache tags = contract `_type` names (contract §5.3). /api/revalidate revalidates the changed `_type`
 * plus "sanity", "seo" (and "llms" for llmsContent). siteSettings/navigation are also tagged on every page.
 */
// ---------- v1.4 chrome copy (was fixture-only). Shapes = types.ts LeadFlowPageCopy / EmbedCopy / … ----------
/** quoteConfig option → LeadOption (key = the value the form submits). */
const leadOption = /* groq */ `{ key, label, description, icon }`;
const qc = /* groq */ `*[_id == "quoteConfig"][0]`;

/** $pageId = "instantQuotePage" | "sellYourDevicePage", $kind = "quote" | "tradein". Options come from quoteConfig. */
export const leadFlowQuery = defineQuery(`*[_id == $pageId][0]{
  "flow": leadFlow{
    ariaLabel, stepCounter,
    "steps": steps[]{ "id": stepId, label, title, lede },
    model{ searchLabel, inputLabel, placeholder, notSureLabel, help, error },
    "contact": contact{ nameLabel, phoneLabel, emailLabel, detailsLabel, "consentLabel": coalesce(consentLabel, ${qc}.consentLabel), consentError },
    chooseError,
    buttons{ back, next, submit, submitting, retry },
    submittingLede,
    "success": success{ title, body, "ctas": ctas[]${cta} },
    submitError{ title, body },
    stagingNote,
    // v1.5: model lists (quoteConfig.deviceTypes[].models by device key; tradeInModels[].models by brand). → flow.models in content.ts.
    "modelLists": select(
      $kind == "quote" => ${qc}.deviceTypes[count(models) > 0]{ "k": key, models },
      ${qc}.tradeInModels[count(models) > 0]{ "k": brand, models }
    ),
    "options": select(
      $kind == "quote" => { "device": ${qc}.deviceTypes[]${leadOption}, "issue": ${qc}.repairIssues[]${leadOption} },
      { "device": ${qc}.tradeInDeviceTypes[]${leadOption}, "condition": ${qc}.tradeInConditions[]${leadOption} }
    )
  },
  "asideLabel": leadFlow.asideLabel,
  "aside": leadFlow.aside[]{ label, "items": items[]{ strong, text }, body },
  "contactCardLabel": leadFlow.contactCardLabel
}`);

const embedFields = /* groq */ `{ title, barLabel, loadLabel, description, directLabel, fallbackTitle, fallbackBody, callLabel, loadingLabel }`;
/** $kind = "square" | "jotform" | "map" */
export const embedCopyQuery = defineQuery(`*[_id == "uiCopy"][0]{
  "copy": select($kind == "square" => embeds.square${embedFields}, $kind == "jotform" => embeds.jotform${embedFields}, embeds.map${embedFields})
}.copy`);

export const footerCopyQuery = defineQuery(`*[_id == "uiCopy"][0].footer{
  quickLinksLabel, legalLabel, paymentsLabel, hoursLabel, socialLabel, spectrumLabel, locality,
  paymentLabels{ paypal, venmo, visa, mastercard, amex, discover }
}`);

/** labels from uiCopy.policyChrome + per-policy sublines from policyPage.subline (flattened in content.ts). */
export const policyChromeQuery = defineQuery(`{
  "labels": *[_id == "uiCopy"][0].policyChrome{ tocLabel, introLabel, lastUpdatedLabel, sourceLabel, otherPoliciesLabel, reviewLabel },
  "sublines": {
    "privacy": *[_type == "policyPage" && slug.current == "privacy"][0].subline,
    "terms": *[_type == "policyPage" && slug.current == "terms"][0].subline,
    "shipping-return": *[_type == "policyPage" && slug.current == "shipping-return"][0].subline
  }
}`);

export const heroChipsQuery = defineQuery(`*[_id == "homePage"][0].heroChips[]{ icon, label }`);

export const servicesChromeQuery = defineQuery(`*[_id == "servicesPage"][0]{
  indexLabel, indexAriaLabel, chipsAriaLabel,
  "ctaSection": ctaHeading{ eyebrow, heading, "intro": subheading, "ctas": ^.ctas[]${cta} }
}`);

export const shopChromeQuery = defineQuery(`*[_id == "shopPage"][0]{
  categoriesHeading, productsHeading, filterAriaLabel, allLabel, otherCategoryLabel, sortLabel,
  sortOptions{ featured, newest, priceAsc, priceDesc },
  loadingLabel,
  emptyCategory{ title, body, callLabel, showAllLabel },
  emptyCatalog{ title, body, ebayLabel }
}`);

/** v1.5: /shop/[product] buy box (uiCopy.productPage) + cart drawer (uiCopy.cartDrawer). Shape = PdpChromeCopy. */
export const pdpChromeQuery = defineQuery(`*[_id == "uiCopy"][0]{
  ...productPage{
    optionLabel, addLabel, addingLabel, addedLabel, soldOutLabel, viewCartLabel,
    inStockLabel, viewLabel, acimaLabel, acimaNote,
    assurances[]{ key, title, body, linkLabel, linkHref },
    related{ eyebrow, heading }
  },
  "drawer": cartDrawer{ title, closeLabel, emptyTitle, emptyBody, subtotalLabel, checkoutNote, checkoutLabel, continueLabel, quantityLabel, decreaseLabel, increaseLabel }
}`);

/** v1.6: 404 page copy (uiCopy.notFound). Shape = NotFoundCopy. */
export const notFoundCopyQuery = defineQuery(`*[_id == "uiCopy"][0].notFound{ heading, body, homeLabel, homeHref }`);

/** v1.5: screen-reader-only strings (uiCopy.a11y). Shape = A11yCopy. */
export const a11yCopyQuery = defineQuery(`*[_id == "uiCopy"][0].a11y{ loading, opensInNewTab }`);

export const TAGS = {
  shopCollectionConfig: "shopCollectionConfig",
  quoteConfig: "quoteConfig",
  uiCopy: "uiCopy",
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

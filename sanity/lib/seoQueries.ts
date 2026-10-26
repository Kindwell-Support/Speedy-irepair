/**
 * GROQ for seo/schema/lib/seo/getSeoData.ts, adapted to the CMS schema (SCHEMA_CONTRACT.md §6b).
 * Projections return EXACTLY the shapes SEO's builders expect (SiteSettings, FaqItem, ServiceSeo,
 * ReviewInput, team rows), so SEO swaps these strings in and changes nothing else.
 */

export const SETTINGS_QUERY = /* groq */ `*[_id == "siteSettings"][0]{
  "name": businessName, legalName, description,
  telephoneE164, telephoneDisplay, email,
  "address": {
    "streetAddress": address.street,
    "addressLocality": address.city, "addressRegion": address.region,
    "postalCode": address.postalCode, "addressCountry": coalesce(address.country, "US")
  },
  "suite": address.unit,
  "hasMap": mapsUrl,
  "geo": select(defined(geo.lat) => {"latitude": geo.lat, "longitude": geo.lng}),
  "openingHours": hours[]{ days, opens, closes, closed },
  hoursPlaceholder,
  "sameAs": array::compact([...socials[].url, ebayUrl]),
  "paymentAccepted": array::compact([
    select(count(paymentMethods[@ in ["visa","mastercard","amex","discover"]]) > 0 => "Credit Card"),
    select(count(paymentMethods[@ in ["visa","mastercard","amex","discover"]]) > 0 => "Debit Card"),
    select("paypal" in paymentMethods => "PayPal"),
    select("venmo" in paymentMethods => "Venmo")
  ]),
  "brandsServiced": *[_type == "brand" && repaired == true] | order(orderRank asc).name,
  "logoUrl": logo.asset->url,
  "defaultOgImageUrl": defaultSeo.ogImage.asset->url,
  "twitterHandle": socials[platform == "twitter"][0].handle
}`;

/** $pageId: homePage | faqPage | servicesPage | financingPage | homeInternetPage. Order = editor's order on that page. */
export const FAQ_QUERY = /* groq */ `(*[_id == $pageId][0].faqs[]->{
  question, answer, "draft": flaggedForReview == true
})[$includeDrafts || draft != true]`;
export const FAQ_PAGE_IDS = {
  home: "homePage",
  faq: "faqPage",
  services: "servicesPage",
  financing: "financingPage",
  homeInternet: "homeInternetPage",
} as const;

/** The 14 /services sections in page order (excludes the homepage-only "Smartphone Repair" umbrella card). */
export const SERVICES_QUERY = /* groq */ `*[_id == "servicesPage"][0].services[]->{
  "slug": slug.current, "name": title, serviceType,
  "snippet": snippetParagraph,
  "detail": pt::text(body),
  "cta": ctas[]{ label, "href": coalesce(internalPath, externalUrl) }
}`;

export const TEAM_QUERY = /* groq */ `*[_type == "teamMember" && isPlaceholder != true] | order(orderRank asc){
  "slug": slug.current, name, "jobTitle": role, "image": photo.asset->url, "description": bio
}`;

/** Placeholders never reach review schema: both flags checked + rating must exist. */
export const REVIEWS_QUERY = /* groq */ `*[_type == "testimonial" && isPlaceholder != true && source != "placeholder" && defined(rating) && defined(body)]
  | order(orderRank asc){ "author": authorName, "ratingValue": rating, "reviewBody": body, "datePublished": reviewDate, source }`;

/** Page SEO for buildMetadata(): same field names as the seo object. $id = page singleton _id. */
export const PAGE_SEO_QUERY = /* groq */ `*[_id == $id][0].seo{ metaTitle, metaDescription, "ogImageUrl": ogImage.asset->url, canonicalOverride, noindex }`;

/** llms routes: replaces `*[_type == "llmsTxt" && _id == "llmsTxt"]`. */
export const LLMS_TXT_QUERY = /* groq */ `*[_id == "llmsContent"][0]{ "llmsTxt": shortVersion }`;
export const LLMS_FULL_TXT_QUERY = /* groq */ `*[_id == "llmsContent"][0]{ "llmsFullTxt": fullVersion }`;

/** sitemap.ts: page singletons + policy pages (noindex field name is identical). v1.1 (G1): + slug so the 3 policyPage docs map to /policies/{slug}; + isPlaceholder (placeholder policies stay out of the sitemap). */
export const SITEMAP_DOCS_QUERY = /* groq */ `*[_type in $types]{ _type, _id, "slug": slug.current, _updatedAt, "noindex": seo.noindex, "isPlaceholder": coalesce(isPlaceholder, false) }`;

/** v1.1 (G3): SiteNavigationElement source. Visible header order: headerLinks then headerCta. Internal links only (external hrefs are skipped). */
export const NAV_QUERY = /* groq */ `*[_id == "navigation"][0]{
  "items": array::compact([...headerLinks[linkType != "external"]{ "name": label, "path": internalPath }, select(defined(headerCta.internalPath) => headerCta{ "name": label, "path": internalPath })])
}.items`;

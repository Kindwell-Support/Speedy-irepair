/**
 * ALL GROQ lives here (enforced by ESLint: `groq`/`defineQuery` may only be imported in lib/sanity).
 * Every projection must return the shapes in lib/sanity/types.ts.
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

/** Optional CMS image: null unless a file is actually uploaded, so callers can fall back to the built-in photo. */
const optImage = (field: string) => /* groq */ `"${field}": select(defined(${field}.asset) => ${field}${image})`;

const seo = /* groq */ `seo{ metaTitle, metaDescription, noIndex, canonicalOverride, "ogImage": ogImage${image} }`;
const cta = /* groq */ `{ label, href, external, variant }`;
const hero = /* groq */ `hero{ eyebrow, headline, subline, "primaryCta": primaryCta${cta}, "secondaryCta": secondaryCta${cta}, ${optImage("poster")} }`;
const section = /* groq */ `{ heading, intro, body, isPlaceholder, sourceNote }`;

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  "business": {
    name, legalName, tagline, address, footerAddressLine, phone, email, hours, hoursIsPlaceholder,
    hoursPlaceholderText, hoursSource, foundingYear, geo, socials, externalLinks, paymentsAccepted,
    notificationEmail, googleMapsEmbedUrl, spectrumAuthorizedRetailer,
    ${optImage("logo")}, ${optImage("logoInverse")}
  },
  navigation{ primary[]${cta}, "headerCta": headerCta${cta}, footerQuickLinks[]${cta}, footerLegalLinks[]${cta} },
  copyright,
  "defaultSeo": ${seo}
}`);

export const announcementQuery = defineQuery(`*[_type == "announcement" && enabled == true] | order(_updatedAt desc)[0]{
  "id": _id, text, href, external, enabled, isPlaceholder
}`);

export const promotionsQuery = defineQuery(`*[_type == "promotion"] | order(order asc){
  "id": _id, title, body, "cta": cta${cta}, order, isPlaceholder
}`);

export const servicesQuery = defineQuery(`*[_type == "service"] | order(order asc){
  "id": _id, "slug": slug.current, title, summary, body, "ctas": ctas[]${cta}, riveIcon, order,
  isPlaceholder, sourceNote, ${seo}, priceFrom, priceList[]{ label, price }, ${optImage("image")}
}`);

export const faqsQuery = defineQuery(`*[_type == "faq" && (!defined($category) || $category in categories)] | order(order asc){
  "id": _id, question, answer, categories, order, isPlaceholder
}`);

export const testimonialsQuery = defineQuery(`*[_type == "testimonial"] | order(coalesce(date, _createdAt) desc){
  "id": _id, author, rating, text, source, sourceUrl, date, isPlaceholder, sourceNote
}`);

export const teamMembersQuery = defineQuery(`*[_type == "teamMember"] | order(order asc){
  "id": _id, name, role, bio, ${optImage("photo")}, order, isPlaceholder
}`);

export const brandsQuery = defineQuery(`*[_type == "brand"] | order(order asc){
  "id": _id, name, shortName, "logo": logo${image}, repairs, acceptsTradeIn, order
}`);

export const valuePropsQuery = defineQuery(`*[_type == "valueProp"] | order(order asc){
  "id": _id, title, detail, speakable, order, isPlaceholder
}`);

export const howItWorksStepsQuery = defineQuery(`*[_type == "howItWorksStep" && set == $set] | order(order asc){
  "id": _id, set, title, body, order, isPlaceholder, ${optImage("image")}
}`);

export const homePageQuery = defineQuery(`*[_type == "homePage"][0]{
  title, ${hero}, ${seo}, ${optImage("photo")},
  "serviceCardsSection": serviceCardsSection${section},
  "serviceCards": serviceCards[]{ "id": _key, title, description, href, "externalLink": externalLink${cta}, riveIcon, "order": coalesce(order, 0), ${optImage("image")} },
  "howItWorksSection": howItWorksSection${section},
  "brandsSection": brandsSection${section},
  "whySection": whySection${section},
  "testimonialsSection": testimonialsSection${section},
  "promotionsSection": promotionsSection${section},
  "faqSection": faqSection${section},
  "locationSection": locationSection{ heading, intro, body, directionsLabel },
  newsletter,
  "contactSection": contactSection${section},
  splineSceneUrl
}`);

/** Generic singleton query for the simpler page types: everything except `seo`/`hero` is passed through. */
export const pageSingletonQuery = defineQuery(`*[_type == $type][0]{ ..., ${hero}, ${seo}, ${optImage("photo")} }`);

export const policyPageQuery = defineQuery(`*[_type == "policyPage" && slug.current == $slug][0]{
  "slug": slug.current, title, body, sourceUrl, isPlaceholder, sourceNote, ${seo}
}`);

export const llmsDocumentQuery = defineQuery(`*[_type == "llmsDocument"][0]{ llms, llmsFull }`);

const postSummary = /* groq */ `"id": _id, "slug": slug.current, title, publishedAt, author, excerpt, ${optImage("coverImage")}`;

/** Published posts only: drafts are excluded by the published perspective, future-dated posts by publishedAt. */
export const postsQuery = defineQuery(`*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc){
  ${postSummary}
}`);

export const postBySlugQuery = defineQuery(`*[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{
  ${postSummary},
  body[]{ ..., _type == "imageWithAlt" => ${image} },
  ${seo}
}`);

export const shopCategoriesQuery = defineQuery(`*[_type == "shopCollectionConfig"] | order(order asc){
  handle, title, description, "heroImage": heroImage${image}, featuredProductHandles, order, ${seo}
}`);

/** Used by /api/revalidate to map a changed document type to cache tags. */
export const TAGS = {
  siteSettings: "siteSettings",
  announcement: "announcement",
  promotion: "promotion",
  service: "service",
  faq: "faq",
  testimonial: "testimonial",
  teamMember: "teamMember",
  brand: "brand",
  valueProp: "valueProp",
  howItWorksStep: "howItWorksStep",
  post: "post",
  page: "page",
  policyPage: "policyPage",
  llmsDocument: "llmsDocument",
  shopCollectionConfig: "shopCollectionConfig",
} as const;

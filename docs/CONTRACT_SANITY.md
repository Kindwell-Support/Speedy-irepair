# CONTRACT_SANITY: how web/ consumes Sanity

**The schema contract is [`cms/SCHEMA_CONTRACT.md`](../../cms/SCHEMA_CONTRACT.md) (v1.1 current; v1.2 in progress; owner: CMS Engineer). It wins over anything in this file.**
This file documents only how the web app *consumes* that schema.

## 1. Where things live
| What | Source of truth | In web/ |
|---|---|---|
| Schema types | `cms/schemaTypes/` | `sanity/schemaTypes/`, vendored by `pnpm sync:cms` (see `sanity/VENDORED.txt`). **Never edit by hand.** |
| Desk structure / Presentation | `cms/structure.ts`, `cms/presentation.ts` | `sanity/structure.ts`, `sanity/presentation.ts` (vendored) |
| Studio config | `cms/sanity.config.ts` (standalone) | `sanity.config.ts`: the same rules, embedded at `/studio` |
| Seed | `cms/seed/seed.ndjson` | not copied. Import it with the CMS lane's scripts once a project exists |
| SEO adapter GROQ | `cms/adapters/seoQueries.ts` | `sanity/lib/seoQueries.ts` (SEO lane) |
| Frontend adapter GROQ | — | `lib/sanity/queries.ts` (Architect; CMS lane extends it for contract bumps) → `lib/sanity/content.ts` getters |
| Fixture mode / submission writer | — | `lib/sanity/fixture.ts` (groq-js over the committed seed) and `lib/sanity/mutations.ts` (the only `formSubmission` writer), both CMS lane |

**Shop source.** `SANITY_STUDIO_SHOP_SOURCE=shopify` (ARCHITECTURE D1). The `product` type is not registered, and Shopify owns the catalog. Embedded Studio note: Next.js only inlines `NEXT_PUBLIC_*` into client bundles, so the embedded Studio always uses the contract default, `shopify`. That is the correct value. The toggle only works in the standalone cms Studio.

**Version note.** `cms/` targets sanity 6.x and `@sanity/orderable-document-list` 2.x. `web/` pins sanity **4.22.1** and orderable 1.5.1 (ARCHITECTURE D3). The schema API (`defineType`/`defineField`/`orderRankField`) is identical. The vendored types build and lint cleanly under v4.

## 2. Rules for the Frontend
1. Pages read content **only** through `lib/sanity/content.ts` getters. Components get typed props (`lib/sanity/types.ts`) and never raw Sanity fields. ESLint rule 6 enforces this.
2. All GROQ is in `lib/sanity/queries.ts` (rule 5). The SEO lane's `sanity/lib/seoQueries.ts` is the only exception, and it mirrors `cms/adapters`.
3. **Fixture fallback.** With no project id, `sanityFetch` runs the *same* GROQ over the committed seed (`lib/sanity/fixture.ts`, groq-js). On a fetch error or empty document, the TS fixtures render. `mergeFallback` back-fills field by field, so a half-filled dataset never leaves holes.
4. **Never invent.** Empty `foundingYear`, `hours`, `geo`, reviews or team members render the contract §6 empty states. Hours rows are flattened per day, and empty hours set `hoursIsPlaceholder` ("Hours coming soon").
5. **Draft rule.** `flaggedForReview` maps to `isPlaceholder` for FAQs and services. Those items are shown on staging, hidden when `NEXT_PUBLIC_SITE_ENV=production`, and excluded from FAQPage there.
6. Cache tags = contract `_type` names (`TAGS` in queries.ts). The `/api/revalidate` webhook revalidates `_type`, `sanity` and `seo`, plus `llms` for `llmsContent`. siteSettings and navigation also revalidate the root layout.

## 3. Field mapping (contract → view model)
| Contract | View model (`lib/sanity/types.ts`) |
|---|---|
| `link`/`cta` `{label, linkType, internalPath, externalUrl, variant}` | `CtaLink {label, href, external, variant}`; variant `ghost` → `link` |
| `seo.noindex` | `Seo.noIndex` |
| `hero {eyebrow, heading, subheading, ctas[≤2]}` | `PageHero {eyebrow, headline, subline, primaryCta, secondaryCta}`; `homePage.heroPoster` → `hero.poster` |
| `sectionHeading {heading, subheading}` | `SectionCopy {heading, intro}` (the eyebrow is not rendered yet) |
| `siteSettings.businessName / telephoneDisplay / address.{unit,region,postalCode}` | `business.name / phone / address.{suite,state,zip}` |
| `siteSettings.{scheduleUrl, financingUrl, homeInternetFormUrl, ebayUrl, reviewUrl, mapsUrl}` + `socials[]` | `business.externalLinks.{schedule, financing, homeInternetSignup, ebay, review, maps, facebook…}` |
| `siteSettings.hours[] {days[], opens, closes, closed}` | `business.hours[] {day, …}` (one per day) + `hoursIsPlaceholder` |
| `navigation.{headerLinks, headerCta, footerQuickLinks, footerLegalLinks, copyright}` | `navigation.{primary, headerCta, footerQuickLinks, footerLegalLinks}`, `copyright` |
| `promotion` with `banner` placement, active, in window | `Announcement` |
| `promotion` with `homepage` placement | `Promotion {title, body←text, cta←link}` |
| `servicesPage.services[]->` | `Service {summary←snippetParagraph, isPlaceholder←flaggedForReview}` (reference order) |
| `homePage.services[]->` | `ServiceCard {title←cardTitle‖title, description←cardDescription, href←cardHref‖/services#slug}` |
| `<page>.faqs[]->` | `Faq`. View category `general/services/financing/internet` = `faqPage/servicesPage/financingPage/homeInternetPage` |
| `testimonial {authorName, rating, body, reviewDate, source, isPlaceholder}` | `Testimonial {author, rating (null for placeholders), text ("Reviews coming soon"), date, source}` |
| `brand {tradeInLabel, repaired, acceptedForTradeIn}` | `Brand {shortName, repairs, acceptsTradeIn}` |
| `homePage.valueProps[]`, `<page>.howItWorksSteps[]` (step) | `ValueProp`, `HowItWorksStep` (home/sell/financing; homeInternet uses fixtures) |
| page singleton ids `sellYourDevicePage`, `instantQuotePage`, `scheduleRepairPage` | `getSellPage`, `getQuotePage`, `getSchedulePage` |
| `scheduleRepairPage.squareEmbedUrl` ‖ `siteSettings.scheduleUrl` | `SchedulePage.squareBookingUrl` |
| `homeInternetPage.jotformUrl` ‖ `siteSettings.homeInternetFormUrl` | `HomeInternetPage.jotformUrl` |
| `shopPage.categories[] {key, label, shopifyCollectionHandle}` | `ShopCategoryEditorial {handle, title}` |
| `llmsContent {shortVersion, fullVersion}` | `LlmsDocument {llms, llmsFull}` |

Not mapped yet (the fixtures supply them; follow-ups for Frontend + CMS):
- `aboutPage` richText blocks, `values` and `spectrumBadge`
- `financingPage.whatIsAcima` and `whatYouCanFinance`
- `homeInternetPage.whoItsFor`, `whatYouGet` and `howToSignUp`
- `scheduleRepairPage.whatToExpect` and `whatToBring`
- `sellYourDevicePage.formIntro` and `brandsAccepted`
- `quoteConfig` (F1/F5 option lists)

The view model wraps these in `SectionCopy` objects, while the contract stores them as flat fields. Add each as one projection line in `pageSingletonQuery`, or as a per-page query.

Verification: all 17 queries were parsed and evaluated with `groq-js` against `cms/seed/seed.ndjson` (Oct 27 2026), and each returned the expected shapes.

## 4. Form submissions (contract §3.9)
- Path: `app/api/forms/[type]` → `lib/forms/submit.ts` (webhook first) → `lib/sanity/mutations.ts` (`buildFormSubmissionDoc` + `storeFormSubmission`). This runs server-side only, with `SANITY_WRITE_TOKEN`.
- **The field names follow the contract version in force**, so read §3.9. v1.2 renames `formType` → `type` (`quote|tradeIn|contact|newsletter`).
- Invariants that never change:
  - private `_id: submissions.<uuid>`
  - `status:"new"`, `submittedAt`, `webhookDelivered`, `pagePath`, a truncated `userAgent`
  - **no IP stored**
  - never read through the CDN or public client
- With no Sanity configured (and not on production), documents go to a local JSONL sink (`FORM_FIXTURE_FILE`).
- QA can send the `x-qa-dry-run: 1` header: the form validates and returns success, but nothing is stored or sent.

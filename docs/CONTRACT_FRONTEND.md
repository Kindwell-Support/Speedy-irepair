# CONTRACT_FRONTEND: rules for pages, sections and components

## 1. Layers
```
app/(site)/**/page.tsx   Server Component. Fetches (content.ts / lib/shop / getSeoData), renders sections, JSON-LD, one <h1>.
components/sections/**    Server by default. Props only (types from lib/sanity/types, lib/shop/types).
components/ui/**          Primitives (ButtonLink, Section, PageHero, Notice, EmbedFacade, RichText, …).
components/motion|3d|rive Motion lane primitives. Use via props / data-attributes (docs/CONTRACT_MOTION.md).
```
- `"use client"` only on interactive leaves: forms, AddToCart, ShopBrowser, EmbedFacade and motion wrappers.
- **Never** fetch in `useEffect`. Never import `lib/sanity/{content,fetch,client}`, `lib/shop` adapters, `lib/env.server` or `lib/forms/submit` from `components/`. ESLint rule 6 fails the build. Type-only imports are fine.

## 2. Page checklist (every route)
1. `generateMetadata` → `pageMetadata(path, page.seo)`, which calls the SEO lane's `buildMetadata`, which adds canonical, OG and robots.
2. `<JsonLd data={jsonLdForX(await getSeoData())} />`. Use the builder from `lib/seo/routes.ts` that matches the route.
3. **Exactly one `<h1>`**, normally from `PageHero` (`hero.headline`). Section headings start at h2. Merchant HTML gets its h1 demoted.
4. Landmarks: the layout provides the skip link → `<main id="main">`. Sections use `<Section id>` with `aria-labelledby`.
5. Empty states (contract §6): placeholder copy comes from content and is wrapped in `<PlaceholderMark>`. Never hard-code a fact.
6. ISR: `export const revalidate = 300` on shop routes only. Everything else relies on tags.

## 3. Content getters (lib/sanity/content.ts)
`getSiteSettings, getAnnouncement, getServices, getFaqs(category), getTestimonials, getTeamMembers, getBrands, getValueProps, getHowItWorksSteps(set), getPromotions, getShopCategories, getHomePage, getServicesPage, getShopPage, getSellPage, getQuotePage, getSchedulePage, getFaqPage, getAboutPage, getFinancingPage, getHomeInternetPage, getPolicyPage(slug), getLlmsDocument`. Each is wrapped in React `cache()` and always resolves, falling back to fixtures.

## 4. Shop (lib/shop)
- `getCatalog()` → `CatalogProvider` (`listProducts`, `getProduct`, cart ops, `supportsCheckout`).
- `Product.source` is `"shopify"` or `"fixture"`. **Fixture products carry no prices.** Render `PRICE_PLACEHOLDER` ("Price from Shopify") through `formatPrice(amount, code, fallback)`. JSON-LD Offer is emitted only when a real price exists.
- States (Design HANDOFF):
  - loading: `app/(site)/shop/loading.tsx` skeleton
  - empty: the ShopBrowser empty card with an eBay CTA
  - Storefront error: degrades to empty
  - checkout unavailable: the staging `Notice`
- Checkout = Shopify-hosted `checkoutUrl`. The site never handles card data.

## 5. Forms (lead capture only, ARCHITECTURE §6)
- Client: `useFormSubmit(type)` posts `{...fields, company_website:"", startedAt, pagePath, turnstileToken?}` to `/api/forms/{quote|tradein|contact|newsletter}`.
- Response `FormResponse`: `ok` | `validation` (fieldErrors keyed by field) | `spam` | `rate_limited` | `server` | `not_configured`. Every form shows idle, submitting, success (copy from Sanity) and error states, with `aria-live`.
- The same zod schema (`lib/forms/schemas.ts`) validates on the client and the server. **No prices** appear in any form or success message.
- F3 Home Internet = the Jotform `EmbedFacade`.

## 6. Embeds
`<EmbedFacade src title loadLabel directHref directLabel heightClass />` handles Square (/schedule-repair), Jotform (/home-internet) and Google Maps. Its frames are idle facade → skeleton → loaded, and a **fallback** with the direct link appears if the iframe has not loaded within 12 s. Its state is exposed as `data-embed-state` for tests.

## 7. Motion wiring (Architect side)
- `app/layout.tsx` → `MotionBootScript` (head) + `MotionShell`. `/studio` is bare, `/motion-lab` gets the provider and transitions, and every other route gets `MotionProvider`. `app/(site)/layout.tsx` wraps `<main>` in `PageTransition`.
- Sections opt in with attributes only (`data-animate="reveal|stagger|parallax|split-heading"`, `data-pin="how"` + `data-step`, `data-faq`). They never import gsap or framer.
- Name mapping (spec → Motion lane):
  - TextScramble → `ScrambleText`
  - Marquee → `BrandMarquee`
  - StepTransition → `MultiStepForm`
  - LayoutGrid → `ShopGrid`
  - ParallaxImage → `data-animate="parallax"`
  - HeroScene → `HeroDevice`
  - PhoneModel → `PhoneScene`
  - GsapProvider → `MotionProvider` + `registerGsap`
  - Spline → `components/3d/SplineScene` (lazy, poster-first)
- Pass your own `alt` to `HeroDevice`. Its default alt makes a timing claim.

## 8. Styling
Tokens only (docs/DESIGN_TOKENS.md):
- No raw hex.
- No inline `style`, except `cssVars()`.
- The spacing scale is a 4px grid, so there are no fractional Tailwind steps.
- Focus is always visible (`shadow-focus`).
- Test at 375 / 768 / 1280 / 1440 / 1920.

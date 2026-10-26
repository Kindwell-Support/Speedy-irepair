# Speedy iRepair: Architecture (v1.0, Technical Architect)

Status: **decided**. The decisions below are final for v1. To change one, raise it with the Technical Architect; do not change it in a PR.
Companion docs: [CONTRACT_SANITY](./CONTRACT_SANITY.md) · [CONTRACT_FRONTEND](./CONTRACT_FRONTEND.md) · [CONTRACT_MOTION](./CONTRACT_MOTION.md) · [DESIGN_TOKENS](./DESIGN_TOKENS.md) · [ENV](./ENV.md) · [CODE_REVIEW](./CODE_REVIEW.md) · [HANDOFF_DEVOPS](./HANDOFF_DEVOPS.md) · [REVIEW_FINDINGS](./REVIEW_FINDINGS.md) · DevOps: [../README.md](../README.md), [../STAGING_SETUP.md](../STAGING_SETUP.md)

Ground rules for every lane:
- Never deploy to production and never change domains. DevOps is the only lane that deploys, and only to staging.
- Never invent facts: founding year, hours, prices, reviews, or team members. Every gap is a **Sanity-editable placeholder** with a defined empty state (CMS contract §6). Nobody waits on the client.

## 1. Stack (pinned)
| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router, React Server Components, TypeScript `strict` | next 15.5.x, react 19.x, TS 5.9 |
| Styling | Tailwind v3. The theme only references Design's CSS custom properties (`styles/tokens.css` = `design/tokens.css`) | tailwind 3.4.19 |
| CMS | Sanity Studio embedded at `/studio`; next-sanity, draft mode and the Presentation tool | sanity **4.22.1**, next-sanity 11.6.13 (see §9 D3) |
| Commerce | Headless **Shopify Storefront API** behind a `CatalogProvider` adapter, with a fixture fallback | — |
| Motion | GSAP + ScrollTrigger, Lenis, framer-motion (LazyMotion), R3F + drei, Spline (lazy), Rive, vendored React Bits | gsap 3.15, lenis 1.3, framer 14, three 0.186, R3F 9, drei 10, rive 4.37 |
| Validation | zod (forms and env) | 4.x |
| Tests | Playwright on 5 viewports (375/768/1280/1440/1920); axe (WCAG 2.1 AA); Lighthouse CI | 1.64 / lhci 0.15 |
| Tooling | pnpm 10, Node 20, ESLint 9 flat config, Prettier with the Tailwind plugin | — |

No `src/` directory. The `@/*` path alias maps to the repo root.

## 2. Directory map and ownership
```
app/
  layout.tsx                root: fonts, metadata base, MotionBootScript, MotionShell   [Architect]
  (site)/layout.tsx         skip link, AnnouncementBanner, header, <main id="main">, footer [Frontend]
  (site)/**/page.tsx        the 14 routes (§3)                                          [Frontend]
  studio/[[...tool]]        embedded Studio (noindex)                                   [CMS]
  api/forms/[type]          form pipeline (§6)                                          [Architect]
  api/revalidate            Sanity webhook → revalidateTag                              [Architect/CMS]
  api/draft-mode/*          enable/disable draft mode                                   [CMS]
  llms.txt, llms-full.txt, robots.ts, sitemap.ts                                        [SEO]
  motion-lab/               motion QA harness (404 in production)                       [Motion]
components/
  ui/ layout/ sections/     presentational + section components                         [Frontend]
  motion/ 3d/ rive/         motion primitives (contract: CONTRACT_MOTION)               [Motion]
  seo/                      JsonLd                                                      [SEO]
lib/
  sanity/                   client, fetch (tags), queries, types, fixtures              [CMS ↔ Architect]
  shop/                     CatalogProvider, shopify-adapter, fixture-adapter, fixtures [Architect]
  forms/                    zod schemas, spam, submit (delivery)                        [Architect]
  seo/                      metadata, JSON-LD builders, route SEO, llms defaults        [SEO]
  motion/                   gsap registration, bindings, tokens, reduced-motion         [Motion]
  env.ts / env.server.ts    typed env (server secrets never imported client-side)       [Architect]
sanity/                     schemas (to be replaced by cms/schemaTypes, §4), desk, preview [CMS]
styles/                     tokens.css (Design, verbatim), globals.css                  [Design/Frontend]
tests/e2e/                  smoke (DevOps), a11y + contract (Architect)                 [DevOps/QA]
docs/                       this folder                                                 [Architect]
```
An owner is the person who approves changes to their area. Others may open PRs against it (CODE_REVIEW §2).

## 3. Routes (14 + root files)
| ID | Route | Rendering | Data |
|---|---|---|---|
| R01 | `/` | static + ISR (tags) | homePage, services, testimonials, promotions, brands |
| R02 | `/services` | static + ISR | servicesPage, services, faqs |
| R03 | `/shop` | ISR 300 s | shopPage + CatalogProvider.listProducts |
| R04 | `/shop/[product]` | SSG via generateStaticParams + ISR 300 s, dynamicParams | CatalogProvider.getProduct |
| R05 | `/sell-your-device` | static + ISR | sellYourDevicePage, quoteConfig (F5) |
| R06 | `/instant-quote` | static + ISR | instantQuotePage, quoteConfig (F1) |
| R07 | `/schedule-repair` | static + ISR | scheduleRepairPage + Square embed facade |
| R08 | `/faq` | static + ISR | faqPage, faqs |
| R09 | `/about` | static + ISR | aboutPage, teamMembers |
| R10 | `/financing` | static + ISR | financingPage (Acima link) |
| R11 | `/home-internet` | static + ISR | homeInternetPage + Jotform facade (F3) |
| R12–14 | `/policies/[slug]` (`shipping-return`, `privacy`, `terms`) | SSG, `dynamicParams=false` | policyPage |
| — | `/llms.txt`, `/llms-full.txt` | static + ISR (tag `llms`) | llmsContent; the fallback is byte-exact spec §5.3 |
| — | `/robots.txt`, `/sitemap.xml` | static | env + documents |
| — | `/studio` | client only | — |

Invariants (checked in tests): each route has **exactly one `<h1>`**, at least one valid JSON-LD block, metadata built by `lib/seo/metadata.buildMetadata`, and a canonical made from `NEXT_PUBLIC_SITE_URL` + path. Merchant HTML (Shopify descriptions) has its `<h1>` demoted to `<h2>`.

## 4. Content: Sanity
- **The schema source of truth is `cms/SCHEMA_CONTRACT.md` (v1.1, frozen, CMS Engineer).** The schema code lives in `cms/schemaTypes/`, the SEO adapter in `cms/adapters/seoQueries.ts`, and the seed in `cms/seed/seed.ndjson`. `web/` does not keep a second schema set. `web/sanity/schemas` is replaced by `cms/schemaTypes` when the CMS lane moves it in. Until then, CONTRACT_SANITY lists every field-name mismatch between `lib/sanity/queries.ts` and the contract.
- **Fixture fallback.** When `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset, every getter in `lib/sanity/content.ts` returns typed fixtures (`lib/sanity/fixtures`), seeded with spec facts and placeholders. The site builds and runs with zero credentials. A Sanity fetch error also falls back to fixtures, never to a 500.
- **Caching.** Use `sanityFetch` with `next: { tags: [_type, …] }`. The webhook calls `/api/revalidate` (HMAC check through `next-sanity/webhook`), which calls `revalidateTag` (CMS contract §5.3). The time-based safety net is 60 s.
- **Draft mode.** `/api/draft-mode/enable` uses `defineEnableDraftMode` with the Viewer token. Stega and visual editing load only in draft mode.
- **Shop source:** `SANITY_STUDIO_SHOP_SOURCE=shopify`. Studio hides the Sanity `product` type, and products come only from Shopify.

## 5. Commerce: Shopify adapter + fixtures
- `lib/shop/types.ts` defines `CatalogProvider { listProducts, getProduct, listCategories, createCheckout }` and the view model `ShopProduct` (CMS contract §5 shape).
- `lib/shop/index.ts#getCatalog()` returns `shopify-adapter` when `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` are set, and `fixture-adapter` otherwise.
- **Prices are never invented.** In fixture mode the price renders as the placeholder "Price from Shopify", not a number. Add to cart shows a staging notice instead of a checkout. Loading (skeleton), empty ("No devices in this category yet" + eBay CTA) and error states are required on `/shop` and on the PDP (Design HANDOFF).
- Checkout is a hosted Shopify checkout (Storefront `cartCreate` → `checkoutUrl`). The site never collects payment data.
- JSON-LD `Product`/`Offer` is emitted **only** for live Shopify items, never for fixtures.

## 6. Forms (lead capture only)
| ID | Form | Route | Transport |
|---|---|---|---|
| F1 | Instant Quote (no prices shown) | /instant-quote | `POST /api/forms/quote` |
| F2 | Newsletter | footer | `POST /api/forms/newsletter` |
| F3 | Home Internet | /home-internet | Jotform embed (facade) |
| F4 | Contact | Location & Contact | `POST /api/forms/contact` |
| F5 | Trade-in (multi-step) | /sell-your-device | `POST /api/forms/tradein` |

The pipeline in `app/api/forms/[type]/route.ts` runs these steps in order:
1. Per-IP rate limit.
2. Spam fields: honeypot `company_website` and a minimum fill time. Spam gets a fake 200.
3. Optional Turnstile.
4. zod schema check (`lib/forms/schemas.ts`).
5. `deliverSubmission`: signed webhook POST (`x-speedy-signature`, HMAC-SHA256) **and** a Sanity `formSubmission` document written with the Editor token.

In production with no delivery configured, the route returns `503 not_configured`, so failures are never silent. In staging it logs and returns 200. The client hook `useFormSubmit` and `MultiStepForm` handle the idle, submitting, success and error states. PII never goes to analytics or the browser console.

## 7. Rendering, performance, motion
- Server Components by default. `"use client"` is allowed only on leaves (interactive components and motion). Pages and sections stay server-side.
- **3D hero over a poster.** The poster (`next/image`, priority) is the LCP element. HeroDevice/R3F or Spline loads after idle or intersection, never under `prefers-reduced-motion`, Save-Data or low-end GPU (`components/3d/capabilities.ts`), and never in first-load JS.
- Third-party embeds (Square, Jotform, Google Maps) use the **click-to-load `EmbedFacade`** with skeleton, loaded and fallback-link frames.
- Budgets: LCP < 2.5 s, CLS < 0.1, INP < 200 ms, **first-load JS < 250 kB gzipped per route**, Lighthouse Perf ≥ 90 and A11y ≥ 95 (`lighthouserc.json`).
- Motion runs through one `MotionProvider` (Lenis + GSAP ticker) mounted in `MotionShell`. Sections opt in with `data-animate` attributes and never import gsap directly (CONTRACT_MOTION).

## 8. Environments, SEO, noindex
- `NEXT_PUBLIC_SITE_ENV=production` is set **only** in the Vercel Production environment, and only after launch sign-off. Any other value means staging.
- **Staging noindex is enforced three ways:**
  1. `X-Robots-Tag: noindex, nofollow, noarchive` on every path (`next.config.ts` headers).
  2. `robots.txt` → `Disallow: /`, and the sitemap is empty.
  3. `<meta name="robots" content="noindex,nofollow">` from `buildMetadata`.

  Playwright asserts all three. `vercel.json` disables Git auto-deploy for `main`.
- JSON-LD (LocalBusiness/Organization/Service/FAQPage/BreadcrumbList/Product) is built in `lib/seo/routes.ts` from `getSeoData()`. It **omits** anything unverified: `foundingDate` always, `openingHoursSpecification` when hours are empty, Review/AggregateRating for placeholders, and `geo` when empty.

## 9. Decisions log
| # | Decision | Rationale |
|---|---|---|
| D1 | Shopify Storefront adapter + fixtures (not a Sanity product catalog) | Client already sells on Shopify/eBay; prices/stock must come from the system of record. |
| D2 | 3D hero over a static poster | Keeps LCP/CLS budgets while allowing the premium hero. |
| D3 | sanity 4.22.1 (not 5.x) | Sanity 5 imports `useEffectEvent` from React 19.2, and Next 15.5's vendored React does not export it, so the build fails. Re-evaluate when moving to Next 16. pnpm override `@portabletext/sanity-bridge@1.2.14` fixes a broken peer resolution. |
| D4 | Forms: webhook + Sanity `formSubmission`, both | Webhook = instant notification; Sanity = durable record + status workflow for staff. |
| D5 | ISR with tag revalidation; 300 s for shop | Content freshness without SSR cost; shop prices tolerate 5 min staleness. |
| D6 | Staging noindex ×3 + tests | One layer failing must not leak staging into the index. |
| D7 | Sanity fixture fallback | No lane waits on credentials; CI builds with zero secrets. |
| D8 | `noUncheckedIndexedAccess` off | Vendored React Bits + motion code would need wide rewrites; `strict` stays on. |
| D9 | Embedded Studio at `/studio` | One deploy, one domain; noindexed and excluded from sitemap. |

## 10. Known risks / open items
- Home first-load JS was ≈254 kB before the Motion lane's LazyMotion change and is **225 kB** after (last build). Keep watching it: the root layout carries the motion stack for every route.
- Hours: SEO/CMS seed Mon–Sat 12:00–18:00 "verified" from Square and Google mirrors, while the web fixtures show the "Hours coming soon" placeholder. The client must confirm. Until then the fixtures stay as placeholders (no-invention rule).
- Blockers (ClickUp): Vercel auth, GitHub auth, Shopify Storefront token, Sanity project and tokens. None of them blocks development, because of D7 and the fixtures.

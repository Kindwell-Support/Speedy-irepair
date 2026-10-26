# FRONTEND_STATUS — Speedy iRepair (web/)

Last updated: 2026-10-27, PKT (UTC+5). Owner: Frontend Engineer. Branch: `feature/foundation`. The `origin` remote now exists (github.com/Kindwell-Support/Speedy-irepair) but this box has no credentials, so **nothing was pushed** and `git pull --rebase` was skipped; DevOps pushes. Nothing has been deployed.

## 1. Check / build status (design-parity batch, after `8850a66`)

| Check | Status |
|---|---|
| `pnpm build` (clean, isolated copy `/tmp/fe-verify`) | **PASS**. First-load JS: `/` **145 kB** (target ≤ ~150), `/shop` 145, `/instant-quote` 143, `/sell-your-device` 143, `/services` 138, `/about` 126, `/policies/[slug]` 108. Shared 104 kB |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS (the earlier non-owned `fixture-mode.test.ts` error is no longer reported) |
| Overflow + one-H1 + HTTP 200 | **PASS 84/84**: 14 routes × 375/768/1024/1280/1440/1920, `scrollWidth ≤ clientWidth`, exactly one `<h1>` |
| LeadFlow functional (Playwright) | PASS. `/instant-quote` (4 steps) and `/sell-your-device` (5 steps) reach the success frame with `x-qa-dry-run: 1` (staging-preview note shown); aborted `/api/forms/*` shows the error alert with answers kept + phone |
| Shop functional | PASS. Category tile filters in place and writes `?category=`; deep link `/shop?category=ipads` preselects and shows the empty-category frame; sort select present (`data-testid="shop-sort"`) |

## 2. Routes

All 14 routes have one H1, `<JsonLd/>`, `generateMetadata`, and breadcrumb UI rendered from the page's BreadcrumbList. Staging is `noindex`; no raw `<img>`.

## 3. Commits this batch (on `feature/foundation`, not pushed)

| Commit | What |
|---|---|
| `b744be6` | LeadFlow copy types + fixtures (design verbatim, no prices), `getLeadFlow`; additive MultiStepForm props |
| `76c4849` | Multi-step LeadFlow for /instant-quote and /sell-your-device (stepper, `form-progress`/`form-option`, validation, submitting/success/error; submits via `/api/forms/[type]` with shared zod schemas); NumberedSteps, BrandStrip, CtaBand |
| `3a1fd36` | CMS v1.3: 7 nav links + Services dropdown, contact heading from contactSection, G4 text from page.intro |
| **`e774b82`** | **Merge `perf/first-load-js`** — kept LeadFlow + lazy-zod; enum option lists computed server-side (`components/sections/forms/lead/enumOptions.ts`, `server-only`) and passed as props; TradeInForm removed |
| `e2a98a9` | EmbedShell parity: branded bar, **8 s fallback** alert (direct link + call), static skeleton with shimmer hook |
| `74390e9` | PolicyLayout: sub-line, **Last updated** + Source meta, sticky contents list ≥lg / disclosure below, h2 anchors, visible **pending-legal-review** note, Other policies |
| `d1f2ae4` | Home Why ruled grid + `valueProp.stat` big numbers |
| `5711cf6` | Footer (4/2/3/3 grid, social icon buttons, payment-method chips, oversized wordmark, bottom row) + hero eyebrow, line-split H1, trust chips |
| `57f591d` | /services sticky numbered contents ≥lg, jump chips <lg, row styling, pre-footer CTA band |
| `8850a66` | /shop category tiles, sticky shop-bar with sort select, empty-category / empty-catalog frames, skeleton loading frame |

All chrome copy comes from Sanity-shaped fixture getters (`getLeadFlow`, `getEmbedCopy`, `getPolicyChrome`, `getFooterCopy`, `getHeroChips`, `getServicesChrome`, `getShopChrome`) — no hardcoded editable copy in components. Remaining literal: sr-only "Loading" in `shop/loading.tsx`.

### Architect / Motion-owned files touched (smallest additive changes)

1. `components/motion/MultiStepForm.tsx`: optional `header`, `progressTestId`, `titleClassName`.
2. `components/motion/ValueProps.tsx`: optional `lead?: ReactNode` slot.
3. `components/motion/ShopGrid.tsx`: optional controlled `value`, `emptyState`, `toolbarEnd`, `barClassName` (uncontrolled behaviour unchanged).
4. `lib/sanity/types.ts`: LeadFlow, EmbedCopy/EmbedKind, PolicyChromeCopy, `PolicyPage.lastUpdated`, FooterCopy, HeroChip, ServicesChromeCopy, ShopChromeCopy.
5. `lib/sanity/fixtures/*`: leadFlows, embeds, policyChrome, footer, heroChips, servicesChrome, shopChrome (+ index exports).
6. `lib/sanity/content.ts`: the seven `cache()` getters above.
7. `lib/sanity/queries.ts`: policy `lastUpdated` projection.
8. Earlier: `lib/utils/cn.ts` tailwind-merge font-size keys; `SectionCopy.eyebrow` + query.

## 4. SEO G-items

| # | Item | Status | Owner |
|---|---|---|---|
| G1–G3 | CMS fields / content | Open | CMS & Content Engineer |
| G4 | Visible Service text on /instant-quote and /schedule-repair | ✅ Done with `ServiceSummary`, rendered from the same graph. The copy currently lives in `lib/seo/routes.ts`; it should move to a Sanity page-intro field so it is editable | SEO + CMS |
| G5 | Per-page `noindex` field | ✅ GROQ `"noIndex": noindex` → `pageMetadata` → `buildMetadata({noindex})` | — |
| G6 | No `foundingDate`; no Google review markup | ✅ Verified in rendered HTML on all routes. `reviewsRenderedOnPage: false` | — |
| G7 | llms from the `llmsContent` singleton | ✅ | — |
| G8 | Staging/previews noindex | ✅ `isIndexable()` drives both robots.txt and the metadata robots tag | — |
| G9 | | Open | CMS / PM |
| G10 | | Open | Technical Architect |
| G11 | | Open | QA |

## 5. Design parity (for the UI/UX Design Lead)

Comparisons (design left, build right): `docs/screenshots/compare/<slug>-{1440,375}.png` (28 pairs, regenerated after `8850a66`).

**Now matching design**
- /instant-quote, /sell-your-device: multi-step LeadFlow (progress, stepper, option cards, model field, consent, success/error frames), sticky aside, no prices.
- Global footer: grid, social icons, payment-method row, oversized wordmark, bottom row.
- Home: hero eyebrow + trust chips; Why ruled grid with stat numbers (when CMS fills `stat`).
- /services: sticky numbered contents list ≥lg, jump chips on mobile, CTA band.
- /policies/*: layout with sticky contents list, Last updated, pending-legal-review note, Other policies.
- /schedule-repair, /home-internet, map: EmbedShell bar + 8 s fallback.
- /shop: category tiles, sticky filter/sort bar, loading skeleton, empty-category and empty-catalog frames.

**Still deviates**
| Area | Gap | Owner / note |
|---|---|---|
| Home How It Works | Large step visuals not built (plain cards + pin hooks) | Frontend, next |
| Home Promotions | Card imagery/gradient styling not built | Frontend, next |
| /about, /financing | Design layout blocks (team grid, 3-step row) not built | Frontend, next; copy TBD (P8) |
| /shop/[product] | Cart drawer markup not built | Frontend (markup) + Motion |
| /shop hero | "Browse products / Finance with Acima" CTAs come from CMS hero ctas (empty in seed); no "Newest" sort (no createdAt) | CMS / Shopify |
| Home hero H1 | Design's 4 fixed lines approximated by sentence splits | Design accept or CMS line field |
| Why | Icons not rendered; `valueProp.stat` has no seed values | CMS |
| Policies | `lastUpdated` has no seed values (meta row hides) | CMS |
| Footer | Hours kept (not in design) | Design Lead to accept |
| Embeds | Idle click-to-load facade kept (privacy/perf) | Design Lead to accept |
| Lead aside | Icons, static shimmer (no animation code) | Motion |
| Quote H1 | Seed differs from design text | CMS |
| Testimonials | Rating hidden (D2) | — |

Decisions in force: D1 4px scale, D2 rating hidden, D3 7 links + Services dropdown.

## 6. Contract gaps / blockers (with owners)

- **CMS & Content Engineer:** schema fields for the chrome-copy fixtures (leadFlow, embeds, policyChrome, footer, heroChips, servicesChrome, shopChrome); seed values for `policyPage.lastUpdated`, `valueProp.stat`, shop hero ctas; quote H1 text.
- **Technical Architect:** repo-wide `format:check` (other lanes' files).
- **SEO:** `public/og/default.jpg`.
- **DevOps:** push `feature/foundation` (no credentials on this box).

## 7. QA hooks (qa/README.md)

All Frontend hooks present, including `form-progress`, `form-option`, `quote-form`, `trade-in-form`, `field-error`, `form-success`, `footer-wordmark`, `payment-methods`, `shop-sort`, `shop-loading`, `data-section` ×12, `service-section` ×14, `product-card`. `x-qa-dry-run` is honoured by `/api/forms` (verified). Pending: `star-rating` (P4), `window.__QA__` (Motion).

## 8. Markup ready for Motion & 3D

- `/` (hero split + chips, `data-pin="how"`/`data-step`, Why stagger, HeroDevice poster)
- `/instant-quote`, `/sell-your-device` (MultiStepForm step transitions, progress)
- `/services` (reveal per section, `data-animate="toc-spy"` + `data-toc-link`)
- `/policies/*` (toc-spy)
- `/shop` (ShopGrid layout animation, `data-animate="shimmer"` skeletons)
- `/faq` (Accordion), `/schedule-repair` + `/home-internet` (embed shimmer)
- Not yet: `/shop/[product]` cart drawer, `/about`, `/financing` layout blocks.

## 9. Screenshots

- Build: `docs/screenshots/frontend/<slug>-{375,768,1024,1280,1440,1920}.png`, 14 routes, regenerated after `8850a66` (reduced motion).
- Design vs build: `docs/screenshots/compare/` (28 pairs).

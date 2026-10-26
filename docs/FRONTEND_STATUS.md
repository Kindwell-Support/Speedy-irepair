# FRONTEND_STATUS — Speedy iRepair (web/)

Last updated: 2026-10-27, PKT (UTC+5). Owner: Frontend Engineer. Branch: `feature/foundation`. The `origin` remote now exists (github.com/Kindwell-Support/Speedy-irepair) but this box has no credentials, so **nothing was pushed** and `git pull --rebase` was skipped; DevOps pushes. Nothing has been deployed.

## 1. Check / build status (batch 2, verified on committed HEAD `fb64602` via `git archive`, incl. CMS v1.4 `e49cbc5`)

| Check | Status |
|---|---|
| `pnpm build` (clean, isolated copy `/tmp/fe-verify`) | **PASS**. First-load JS: `/` **146 kB** (target ≤ ~150), `/shop` 145, `/instant-quote` 143, `/sell-your-device` 143, `/services` 138, `/about` 127, `/shop/[product]` 126 (drawer is `next/dynamic`, loaded after first add), `/financing` 125, `/policies/[slug]` 108. Shared 104 kB |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test:unit` | PASS (20) |
| Overflow + one-H1 + HTTP 200 | **PASS 84/84**: 14 routes × 375/768/1024/1280/1440/1920, `scrollWidth ≤ clientWidth`, exactly one `<h1>` |
| LeadFlow functional (Playwright) | PASS. `/instant-quote` (4 steps) and `/sell-your-device` (5 steps) reach the success frame with `x-qa-dry-run: 1` (staging-preview note shown); aborted `/api/forms/*` shows the error alert with answers kept + phone |
| Shop functional | PASS. Category tile filters in place and writes `?category=`; deep link `/shop?category=ipads` preselects and shows the empty-category frame; sort select present (`data-testid="shop-sort"`) |
| Cart drawer (Playwright, `/shop/iphone-xr-64gb-unlocked`) | PASS. Add to Cart opens `cart-drawer` (`data-state=open`) with the staging notice (fixture mode); Esc and `cart-drawer-close` close it; focus returns to `add-to-cart`; no overflow at 375 |

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
| `5eaa6ab` | Home How It Works step visuals (rail + progress track, tall tiles, outlined numerals, step icons, `data-state` active/done styles) and promo cards (feature card with glow + optional badge, link-style cards); `LineIcon` set |
| `793c4dc` | /about (split with lede + Spectrum badge, value info cards, story split, 4-up team grid, CTA band) and /financing (split with check-list + partner panel, numbered steps, finance info cards, CTA band) |
| `3e82938` | /shop/[product] cart drawer markup (native `<dialog>`, line items with qty stepper, subtotal, checkout, empty/staging/error states, `data-animate="drawer"`); buy-box states (Adding / Added / Sold out) from `getPdpChrome`; sr-only a11y strings moved to `components/ui/a11yStrings.ts`; shop sort renders only implemented keys |
| **`fb64602`** | Drawer: focus returns to Add to Cart on close |

All chrome copy comes from Sanity-shaped fixture getters (`getLeadFlow`, `getEmbedCopy`, `getPolicyChrome`, `getFooterCopy`, `getHeroChips`, `getServicesChrome`, `getShopChrome`) — no hardcoded editable copy in components. The sr-only "Loading" / "(opens in a new tab)" strings are a11y chrome, kept as constants in `components/ui/a11yStrings.ts`. Icons are decorative and picked by index/href. Not editable copy.

### Architect / Motion-owned files touched (smallest additive changes)

1. `components/motion/MultiStepForm.tsx`: optional `header`, `progressTestId`, `titleClassName`.
2. `components/motion/ValueProps.tsx`: optional `lead?: ReactNode` slot.
3. `components/motion/ShopGrid.tsx`: optional controlled `value`, `emptyState`, `toolbarEnd`, `barClassName` (uncontrolled behaviour unchanged).
4. `lib/sanity/types.ts`: LeadFlow, EmbedCopy/EmbedKind, PolicyChromeCopy, `PolicyPage.lastUpdated`, FooterCopy, HeroChip, ServicesChromeCopy, ShopChromeCopy.
5. `lib/sanity/fixtures/*`: leadFlows, embeds, policyChrome, footer, heroChips, servicesChrome, shopChrome (+ index exports).
6. `lib/sanity/content.ts`: the seven `cache()` getters above.
7. `lib/sanity/queries.ts`: policy `lastUpdated` projection.
8. Batch 2: `Promotion.badge?` (type + `promotionsQuery`); `valuesSection.items` projected from `values[]{title, description}`; FinancingPage `whatIsSection.highlights/visualLabel`, `whatYouCanFinanceSection.itemBodies`, `ctaSection`; About `ctaSection` + values bodies in `fixtures/pages.ts`; `PdpChromeCopy` type, `fixtures/pdpChrome.ts`, `getPdpChrome` (the CMS lane has since wired it to GROQ in `e49cbc5`).
9. Earlier: `lib/utils/cn.ts` tailwind-merge font-size keys; `SectionCopy.eyebrow` + query.

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

Comparisons (design left, build right): `docs/screenshots/compare/<slug>-{1440,375}.png` (28 pairs, regenerated on `fb64602`).

**Now matching design**
- /instant-quote, /sell-your-device: multi-step LeadFlow (progress, stepper, option cards, model field, consent, success/error frames), sticky aside, no prices.
- Global footer: grid, social icons, payment-method row, oversized wordmark, bottom row.
- Home: hero eyebrow + trust chips; Why ruled grid with stat numbers (when CMS fills `stat`).
- /services: sticky numbered contents list ≥lg, jump chips on mobile, CTA band.
- /policies/*: layout with sticky contents list, Last updated, pending-legal-review note, Other policies.
- /schedule-repair, /home-internet, map: EmbedShell bar + 8 s fallback.
- /shop: category tiles, sticky filter/sort bar, loading skeleton, empty-category and empty-catalog frames.
- Home How It Works: step rail, tall step tiles with numerals + icons, active/done visual states (driven by Motion's `data-state`).
- Home Promotions: 6/3/3 grid, feature card with glow, link-style secondary cards.
- /about, /financing: design block order and layouts (see `793c4dc`).
- /shop/[product]: cart drawer panel (header, lines, subtotal, checkout note, Checkout / Keep shopping).

**Still deviates**
| Area | Gap | Owner / note |
|---|---|---|
| Home How It Works | Steps look neutral until Motion sets `data-state`; pinned scroll + progress fill are Motion's | Motion |
| Home Promotions | Feature "Home Internet" badge needs CMS `promotion.badge`; no card imagery (none in CMS) | CMS |
| /about | Hero headline/CTAs from seed differ from design; 2 team members in fixtures vs 4 in design; story/team copy and photos TBD (P8); design's separate map + "Send us a message" blocks are the shared LocationContact block | CMS / Content |
| /financing | Highlights, partner label, item bodies and CTA band are fixture values until CMS fields exist; hero copy from seed | CMS |
| /shop/[product] | Only the drawer was built. The full design buy box (qty stepper, Acima line, assurances, related products) is not built. Drawer slide-in is Motion's. With no Storefront token the drawer shows the staging notice and an empty cart (no real lines to review) | Frontend next / Motion / DevOps (token) |
| /shop "Featured" | Sold-out items can sort first (Extended Phone Warranty) | Design/PM to decide |
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

- **CMS & Content Engineer:** `promotion.badge`; about `intro`/values descriptions/`ctaSection`; financing `highlights`, `visualLabel`, `itemBodies`, `ctaSection`; 4 team members + bios (some of these may already be covered by the in-progress v1.4 work). Earlier: schema fields for the chrome-copy fixtures (leadFlow, embeds, policyChrome, footer, heroChips, servicesChrome, shopChrome); seed values for `policyPage.lastUpdated`, `valueProp.stat`, shop hero ctas; quote H1 text.
- **Technical Architect:** repo-wide `format:check` (other lanes' files).
- **SEO:** `public/og/default.jpg`.
- **DevOps:** push `feature/foundation` (no credentials on this box).

## 7. QA hooks (qa/README.md)

All Frontend hooks present, including `form-progress`, `form-option`, `quote-form`, `trade-in-form`, `field-error`, `form-success`, `footer-wordmark`, `payment-methods`, `shop-sort`, `shop-loading`, `promo-card`, `spectrum-badge`, `team-grid`, `check-list`, `cta-band`, `buy-box`, `add-to-cart`, `cart-drawer`, `cart-drawer-close`, `cart-empty`, `cart-line`, `cart-checkout`, `data-section` ×12, `service-section` ×14, `product-card`. `x-qa-dry-run` is honoured by `/api/forms` (verified). Pending: `star-rating` (P4), `window.__QA__` (Motion).

## 8. Markup ready for Motion & 3D

- `/` (hero split + chips, `data-pin="how"`/`data-step`, Why stagger, HeroDevice poster)
- `/instant-quote`, `/sell-your-device` (MultiStepForm step transitions, progress)
- `/services` (reveal per section, `data-animate="toc-spy"` + `data-toc-link`)
- `/policies/*` (toc-spy)
- `/shop` (ShopGrid layout animation, `data-animate="shimmer"` skeletons)
- `/faq` (Accordion), `/schedule-repair` + `/home-internet` (embed shimmer)
- `/` How It Works: `[data-steps-progress]` track + `data-state="active|done"` styles on `[data-step]`; promos `data-animate="stagger"`
- `/shop/[product]`: cart `<dialog data-animate="drawer" data-state="open|closed">` (no animation code; native open/close today)
- `/about`, `/financing`: section reveal hooks on the new blocks

## 9. Screenshots

- Build: `docs/screenshots/frontend/<slug>-{375,768,1024,1280,1440,1920}.png`, 14 routes, regenerated on `fb64602` (reduced motion). Drawer: `shop-product-drawer-{1280,375}.png`.
- Design vs build: `docs/screenshots/compare/` (28 pairs).

# FRONTEND_STATUS — Speedy iRepair (web/)

Last updated: 2026-10-27 (batch 4), PKT (UTC+5). Owner: Frontend Engineer. Branch: `feature/foundation`. The `origin` remote now exists (github.com/Kindwell-Support/Speedy-irepair) but this box has no credentials, so **nothing was pushed** and `git pull --rebase` was skipped; DevOps pushes. Nothing has been deployed.


## 0. Batch 4 (QA run 3 at `ef1fab0`): summary

Batch 4 builds on top of `e7d4e64`. It includes CMS v1.6 `02b286d` and Motion `aaa3d38`/`ef1fab0`/`2711713`, which were already local. Nothing was pushed, `pull --rebase` was skipped (no credentials) and nothing was deployed.

**Checks.** All checks ran on committed HEAD in an isolated `git archive` copy:
- lint 0, typecheck 0, unit 23/23, build OK.
- Home first-load JS is **147 kB**.
- 84-check (overflow, one H1, HTTP 200) at 375/768/1024/1280/1440/1920: 0 failures.
- axe at 375/1280/1440 on 14 URLs: 42/42 clean (target-size included).
- Quote and trade-in flows OK. Shop OK.
- The server HTML H1 (curl, no JS) reads "Cracked screen? Dead battery? We fix it in 45 minutes."

**Commits** (in order):
- `9c40520`, `58e3701`: BUG-002, mobile menu scrolls within the viewport.
  - max-height = 100dvh minus the **measured** panel top, exposed as the CSS var `--menu-top`. The announcement banner wraps to 55px at 375, so the token math alone overshot the viewport by 15px.
  - overflow-y auto, overscroll-contain, data-lenis-prevent.
- `907e1d1`: PolicyToc targets are `min-h-8` block links.
  - Also replaced half-step classes, which the 4px scale (D1) does not generate, with arbitrary values.
- `54fb476`: CMS v1.6 switches.
  - 404 is async and uses `getNotFoundCopy()`.
  - ShopBrowser uses `copy.otherCategoryLabel`.
- `4119bd5`: BUG-001 on the /services index (`min-h-8` rows), plus:
  - `navTitle()` drops the spec parenthetical in the index and jump chips. Section headings keep the full CMS title.
  - Chips are capped at the viewport width with truncation.
  - /home-internet first offer card shows the $40 (from the CMS hero headline) via CountUp (`data-countup`, testid `offer-price`).
- `1066400`: additive lib fields, see below.
- `4596870`: BUG-004, "Learn more" + arrow foot on home service cards.
- `c6b7aff` + `f1b829f`: BUG-005 and BUG-007.
  - Home FAQ in `.faq-layout`: left side has the heading, "Can't find it? Call {phone}." and an All FAQs link to /faq; right side has the accordion with the first item open (`aria-expanded="true"` in the SSR HTML).
  - Location: NAP/hours card (beside the map when an embed URL exists; full width with 2 internal columns otherwise).
  - Full-width 4/8 "contact us" card.
  - Newsletter: heading on the left, inline email + Subscribe on the right (`FormShell inline`).
- `43b4e5e`: BUG-008, hero CTAs full width below 480px.
- `6e1f31f`: BUG-011, header phone tel link (`settings.business.phone`) before Schedule Repair from 1440 up, matching design `.nav__phone`.
- `1343fa7`: real spaces between the hero H1 line spans (BUG-003 follow-up).
- `fc928d5`: BUG-006 services intro, see the lib changes below.

**Architect / CMS files touched (smallest additive changes):**
- `lib/sanity/types.ts`: optional `HomePage.serviceCardLinkLabel` and `faqSection.allLabel` / `faqSection.callPrompt`.
- `lib/sanity/fixtures/pages.ts`: fixture defaults "Learn more", "All FAQs", "Can't find it? Call", and `serviceCardsSection.intro` (approved design copy).
- **CMS ask:** add these four fields to the homePage schema and seed. Seed `servicesHeading` has no intro today, so the fixture fills it via mergeFallback.

**QA status:**

| Bug | Status |
| --- | --- |
| BUG-001 | Fixed |
| BUG-002 | Fixed. Verified at 375x667 in chromium and webkit: 22/22 links reachable, clickable, and focus-visible on Tab. |
| BUG-004 | Fixed |
| BUG-005 | Fixed |
| BUG-006 | Intro fixed. The Google rating stays hidden per D2 (no verified rating data). |
| BUG-007 | Fixed |
| BUG-008 | Fixed |
| BUG-011 | Fixed |
| BUG-003 | Motion (`2711713`); Frontend added the H1 spaces |
| BUG-009 | Motion |
| BUG-010 | Architect |

**Motion asks:**
- WhyStat already renders via CountUp (`data-countup`). Adding `data-animate="countup"` as well would count twice (the engine rewrites the first numeric text node), so I did not add it.
- /home-internet `$40` also uses CountUp only, for the same reason.
- The prepaid chip is truncated and fits within 375: there is no page overflow, and the chip sits inside the horizontal chip scroller.

**Still deviating:**
- No map tile when `googleMapsEmbedUrl` is unset (env and seed are both empty). The NAP card spans the row instead.
- The "Call us" ghost button only renders if `map.callLabel` copy exists, which it currently does not.
- The newsletter email label is visible, not sr-only as in the design (a11y).
- The "Hours" label in LocationContact is still a literal from an earlier batch.

## 1. Check / build status (batch 3, verified on committed HEAD `2f3f943` via `git archive`, incl. CMS v1.5 `4561b28`)

| Check | Status |
|---|---|
| `pnpm build` (clean, isolated copy `/tmp/fe-verify`) | **PASS**. First-load JS: `/` **146 kB** (target ≤ ~150), `/shop` 146, `/instant-quote` 143, `/sell-your-device` 143, `/services` 138, `/home-internet` 137, `/about` 127, `/shop/[product]` 127 (Motion `<Drawer>` still `next/dynamic`, `ssr:false`), `/faq` 125, `/financing` 125, `/policies/[slug]` 108. Shared 104 kB |
| `pnpm lint` / `pnpm typecheck` | PASS |
| `pnpm test:unit` | **20/21**. `fixture-mode.test.ts` "v1.5" (CMS lane's test, line 228) compares the GROQ projection of the **seed** `uiCopy.productPage` with `fx.pdpChrome`. My additive optional fields (`inStockLabel`, `viewLabel`, `acimaLabel`, `acimaNote`, `assurances`, `related`) are in the fixture but not in the seed/schema/query yet. `getPdpChrome()` itself still equals the fixture (line 229 passes). Needs the CMS lane to add the fields (section 6) |
| Overflow + one-H1 + HTTP 200 | **PASS 84/84** (14 routes × 375/768/1024/1280/1440/1920) |
| axe (wcag2a/aa + best-practice, 14 routes + a 404 URL, 375 and 1280) | Clean except **`/` colour-contrast**: Motion's `ValueProps` sets inactive Why-detail lines to inline `opacity: 0.6` (Motion-owned, section 6) |
| LeadFlow functional | PASS. Both flows reach success with `x-qa-dry-run: 1`; an aborted `/api/forms/*` shows the error alert, keeps answers, shows the phone number; `form-progress` present on both routes |
| WebKit keyboard focus (Tab ×70 on /sell-your-device, /instant-quote, /shop, PDP, /policies/privacy at 375 and 1280) | PASS. Every focused element shows an outline or box-shadow; `<select>` shows a 2px solid outline |
| Shop | PASS. Default "Featured" lists 8 in-stock items, then Extended Phone Warranty (sold out) last; `?category=ipads` shows the empty frame |
| Cart drawer + buy box (`/shop/iphone-xr-64gb-unlocked`, 375 and 1280) | PASS. `pdp-qty`, `pdp-acima` (Acima URL, new tab), `pdp-assurances`, `related-products`, `stock-badge` present. Add to Cart opens the Motion Drawer (`[data-drawer][data-state=open]`, `cart-drawer`) with the staging notice. Esc and `cart-drawer-close` both close it, and focus returns to `add-to-cart`. No overflow at 375 |
| Banner / nav | Rendered banner `<a href="https://form.jotform.com/253200750312037">` (new tab). Header order: Services, Shop, Sell Your Device, Home Internet, Financing, FAQ, About + Schedule Repair CTA |

## 2. Routes

All 14 routes have one H1, `<JsonLd/>`, `generateMetadata`, and breadcrumb UI rendered from the page's BreadcrumbList. Staging is `noindex`; no raw `<img>`.

## 3. Commits this batch (batch 3, on `feature/foundation` on top of `bfbf28d`, not pushed)

| Commit | What |
|---|---|
| `c3bc8fe` | `data-testid="star-rating"` on the per-review star row (still only rendered for verified non-placeholder ratings, so D2 is unchanged). Review button label comes from CMS navigation. sr-only strings consolidated in `components/ui/a11yStrings` (`A11Y`, `A11yProps`). `/shop` passes `getA11yCopy()` to ShopBrowser |
| `b383e9a` | Motion `CountUp` on purely numeric Why stats and on the `/home-internet` $40 figure (parsed from the CMS item text; SSR renders the final value). New `OfferCard` (`offer-card`) |
| `d62dce2` | HomeHero passes the rendered `/hero/phone-poster.{avif,webp,png}` poster (`DEFAULT_POSTER`). SVG placeholder removed |
| `0d34870` | Cart drawer now uses Motion `<Drawer>` (focus trap, Esc, aria-modal, inert, scroll lock). Native `<dialog>` code removed. Same content, states and testids (own sticky header keeps `cart-drawer-close`). Still lazy |
| `6775cbe` | Shop "Featured" sort puts sold-out items last (**decision for the Design Lead to confirm**). ProductCard "View" / "Sold out" labels come from pdpChrome. Additive `PdpChromeCopy` fields + fixture values |
| `1e6fae3` | PDP buy box: category eyebrow, In stock badge, option button groups (`variant-options`), `QuantityStepper` (`pdp-qty`, also used in cart lines), Finance with Acima + note (`pdp-acima`), assurances (`pdp-assurances`; the store row shows the siteSettings address), related products (`related-products`; same category first, in-stock first, max 4). The price still reads "Price from Shopify" |
| `511fdcf` | Fixture fallback nav fixed to Services, Shop, Sell Your Device, Home Internet, Financing, FAQ, About (removed Instant Quote, swapped Financing/Home Internet). The seed was already correct |
| `a7db485` | WebKit: real `outline` on `select`/`input`/`textarea` focus, since native selects ignore box-shadow (BUG-005/006). The announcement banner is a named `role="region"` (BUG-032) and its link gets a white focus outline (a red ring on the red bar was invisible). Small red text uses `primary-text` |
| `bc7cbff` | axe: /faq questions are h2 (BUG-033). PDP Shopify description headings normalised under the H1 with no skipped levels. The `/` brands section is a plain section because the marquee is already the "Brands we repair" region (BUG-031). Services index numbers changed to `text-tertiary` (AA) |
| `2f3f943` | `app/(site)/[...missing]` so unknown URLs render the branded 404 inside the header/main/footer landmarks (they previously got Next's bare root 404) |
| *(this doc)* | FRONTEND_STATUS + screenshots |

### Architect / Motion / CMS-owned files touched (smallest additive changes)

Batch 3:
1. `lib/sanity/types.ts`: optional `PdpChromeCopy.inStockLabel/viewLabel/acimaLabel/acimaNote/assurances/related`; new `PdpAssurance`, `PdpAssuranceKey`.
2. `lib/sanity/fixtures/pdpChrome.ts`: values for those fields (assurance copy from design/pages; return link `/policies/shipping-return`).
3. `lib/sanity/fixtures/business.ts`: `navigation.primary` order (fallback only; the seed already matched).
4. `styles/globals.css`: added the form-control `outline` focus rule (global wiring).
5. No Motion files changed this batch (Drawer, CountUp and HeroDevice are used as delivered).

Earlier batches:
1. `components/motion/MultiStepForm.tsx` (header/progressTestId/titleClassName), `ValueProps.tsx` (`lead`), `ShopGrid.tsx` (controlled value/emptyState/toolbarEnd/barClassName).
2. `lib/sanity/*`: LeadFlow, EmbedCopy, PolicyChromeCopy, FooterCopy, HeroChip, ServicesChromeCopy, ShopChromeCopy, PdpChromeCopy types/fixtures/getters; `Promotion.badge?`; about/financing projections; policy `lastUpdated`; `lib/utils/cn.ts` font-size keys.

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

Comparisons (design left, build right): `docs/screenshots/compare/<slug>-{1440,375}.png` (28 pairs, regenerated on `2f3f943`).

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
- /shop/[product]: full buy box (eyebrow, stock badge, options, qty stepper, Acima line, assurances, related products) and the Motion drawer.
- /home-internet: offer cards with icons and the CountUp $40 figure.

**Still deviates**
| Area | Gap | Owner / note |
|---|---|---|
| Home How It Works | Steps look neutral until Motion sets `data-state`; pinned scroll + progress fill are Motion's | Motion |
| Home Promotions | Feature "Home Internet" badge needs CMS `promotion.badge`; no card imagery (none in CMS) | CMS |
| /about | Hero headline/CTAs from seed differ from design; 2 team members in fixtures vs 4 in design; story/team copy and photos TBD (P8); design's separate map + "Send us a message" blocks are the shared LocationContact block | CMS / Content |
| /financing | Highlights, partner label, item bodies and CTA band are fixture values until CMS fields exist; hero copy from seed | CMS |
| /shop/[product] | The buy box is built. With no Storefront token: price reads "Price from Shopify", the drawer shows the staging notice and an empty cart, and fixture products have no option groups (the `variant-options` UI renders only when Shopify returns options). The related-products list uses the fixture catalog | DevOps (token) |
| /shop "Featured" | **Decision to confirm:** in-stock first, sold-out last (Extended Phone Warranty now sorts last). Price sorts leave stock order alone | Design Lead |
| /shop hero | "Browse products / Finance with Acima" CTAs come from CMS hero ctas (empty in seed); "Newest" stays hidden: `CatalogProvider` has no sort parameter. When it exists, map to Storefront `sortKey: CREATED_AT, reverse: true` (products) / `CREATED` (collection products) | CMS / **Architect** |
| Home hero H1 | Design's 4 fixed lines approximated by sentence splits | Design accept or CMS line field |
| Why | Icons not rendered; `valueProp.stat` has no seed values | CMS |
| Policies | `lastUpdated` has no seed values (meta row hides) | CMS |
| Footer | Hours kept (not in design) | Design Lead to accept |
| Embeds | Idle click-to-load facade kept (privacy/perf) | Design Lead to accept |
| Lead aside | Icons, static shimmer (no animation code) | Motion |
| Quote H1 | Seed differs from design text | CMS |
| Testimonials | Rating hidden (D2); `star-rating` row renders only for verified ratings | — |
| Home Why | Inactive detail lines at inline `opacity:0.6` fail AA contrast (axe serious) | **Motion** (`ValueProps`) |
| 404 page | Heading/body/button copy is hardcoded in `app/(site)/not-found.tsx` (pre-existing) | CMS field wanted (`uiCopy.notFound`) |
| Shop | "Other" category fallback label is hardcoded in ShopBrowser | CMS (shopChrome) |
| Hero poster | HeroDevice renders a raw `<picture>` (Motion-owned); the H1 remains the LCP candidate | Motion |

Decisions in force: D1 4px scale, D2 rating hidden, D3 7 links + Services dropdown.

## 6. Contract gaps / blockers (with owners)

- **CMS & Content Engineer:**
  - Add `uiCopy.productPage` fields `inStockLabel`, `viewLabel`, `acimaLabel`, `acimaNote`, `assurances[] {key: shipping|returns|store|payments, title, body?, linkLabel?, linkHref?}` and `related {eyebrow?, heading}` to the schema, seed and `pdpChromeQuery`. Copy the values from `fixtures/pdpChrome.ts`. This makes the v1.5 unit test pass again.
  - Banner: the seed `promotion-free-smartphone` (placements banner+homepage) already links to `https://form.jotform.com/253200750312037`, and so does the fixture. No change needed.
  - Nav: the seed `navigation.headerLinks` order is correct. Only the fixture fallback was wrong (fixed in `511fdcf`).
  - Still open from earlier: `uiCopy.notFound`, the shopChrome "Other" label, `valueProp.stat` / `policyPage.lastUpdated` seed values, about team (4), quote H1.
- **Technical Architect:** `CatalogProvider` sort support (`sortKey`/`reverse`) before "Newest" can ship; repo-wide `format:check`.
- **Motion:**
  - `ValueProps` inactive opacity 0.6 fails AA (raise to about 0.8 or animate colour instead).
  - `LogoLoop` is `role="region"` with the same name as the section heading. Frontend dropped the section's name to avoid duplication; if Motion removes the role, tell Frontend so the section label comes back.
- **Design Lead:** confirm "Featured" = in-stock first.
- **DevOps:** push `feature/foundation` (no credentials on this box); Storefront token.

## 7. QA

### Bug status (qa-bugs/INDEX.md, Frontend-assigned; QA ran against `e53843d`)
| Bug | Status at `2f3f943` | Evidence / fix |
|---|---|---|
| BUG-001 /instant-quote multi-step + progress (Critical) | **Fixed** (`76c4849`, batch 2) | `form-progress` present; flow reaches success / error frames |
| BUG-002 /sell-your-device multi-step (Critical) | **Fixed** (`76c4849`) | Same as BUG-001, 5 steps |
| BUG-004 step-1 device types + progress, no prices | **Fixed** (`76c4849`) | Progress bar present; no prices on /instant-quote |
| BUG-005 /sell-your-device WebKit focus on selects | **Fixed** (`a7db485`) | WebKit Tab sweep: 0 elements without an indicator; select outline 2px solid |
| BUG-006 /instant-quote WebKit focus | **Fixed** (`a7db485`) | Same sweep |
| BUG-007 /policies/privacy overflow at 375 | **Fixed** (`63aeac4`) | 84/84 overflow check incl. privacy at 375 |
| BUG-031 axe landmark-unique on / | **Fixed** (`bc7cbff`) | axe clean for this rule |
| BUG-032 axe region (14 routes) | **Fixed** (`a7db485`, `2f3f943`) | Banner is now a named region; the 404 renders inside the landmarks |
| BUG-033 axe heading-order /faq, /shop | **Fixed** (`bc7cbff`) | /faq questions h2; /shop clean at HEAD; PDP description normalised |

These need a QA re-run on a fresh snapshot to close formally. Not fixed by Frontend: the `/` colour-contrast item from Motion's ValueProps (above).

### Colour rule audit (#D9161E for normal text / white-text fills; #ED1C24 only for large text, logo, icons, focus ring, decoration)
- White-text fills: the banner, primary buttons and the checkout button use `bg-primary` (#D9161E). No `bg-brand` sits behind text anywhere in app/ or components/ (outside motion-lab).
- `text-brand` remains only on icons (LineIcon/LeadIcon/CategoryIcon, the star glyphs), decorative eyebrow squares, borders and progress fills.
- Fixed: `hover:text-brand` on the phone/email links (LocationContact) and the active services-index number now use `primary-text` (#FF4D53, the small-red-text token on dark).
- Not touched (Motion-owned `/motion-lab/*` demo pages): `text-brand` labels and numerals. These routes are not part of the site.

### Hooks
New this batch: `star-rating`, `offer-card`, `pdp-qty`, `variant-options`, `pdp-acima`, `pdp-assurances`, `related-products`, `stock-badge`, `cart-drawer` (on the Motion Drawer panel; portal root `[data-drawer][data-state]`). All earlier hooks are unchanged (`form-progress`, `form-option`, `quote-form`, `trade-in-form`, `shop-sort`, `buy-box`, `add-to-cart`, `cart-drawer-close`, `cart-empty`, `cart-line`, `cart-checkout`, `product-card`, `data-section` ×12, …).

## 8. Markup ready for Motion & 3D

- `/` hero (rendered poster), How It Works `data-step`/`data-state`, Why `CountUp`, promos stagger
- `/home-internet` offer cards `data-animate="stagger"` + CountUp
- `/shop/[product]` Motion `<Drawer>` (slide-in is Motion's)
- `/instant-quote`, `/sell-your-device`, `/services`, `/policies/*`, `/shop`, `/faq`, embeds, as before

## 9. Screenshots

- Build: `docs/screenshots/frontend/<slug>-{375,768,1024,1280,1440,1920}.png`, 14 routes, regenerated on `2f3f943` (reduced motion).
- Design vs build: `docs/screenshots/compare/` (28 pairs, regenerated on `2f3f943`).

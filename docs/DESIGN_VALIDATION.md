# DESIGN_VALIDATION: Speedy iRepair (R01–R14)

Owner: Technical Architect · 2026-10-27 (PKT, UTC+5) · Branch `perf/first-load-js` (rebased on `feature/foundation` 4ef0618, Sanity contract v1.3)
Inputs: `design/HANDOFF.md`, `design/pages/*.html` + `*.responsive-and-motion.md`, `design/home.animation-intent.md`, `docs/FRONTEND_STATUS.md`, plus the code in this branch.

**How to read this doc.** "Code" means it exists in the repo and I checked it in a production build: `pnpm build` + `next start`, curl, and Playwright (190/190 passed at 375/768/1280/1440/1920 on 2026-10-27). "Designed only" means it is in the design and not built yet. Sizes are gzip kB, counting page + root layout + (site) layout chunks. That is larger than Next's printed "First Load JS", which leaves out the layout chunks. The budget is <250 kB (spec §6).

## 0. Cross-cutting checks

| Check | Design | Code status | Verdict |
|---|---|---|---|
| Brand red `#ED1C24` / button fill `#D9161E` | ✔ | ✔ `styles/tokens.css` `--color-brand` / `--color-primary` (contrast notes in place) | OK |
| Inter font | ✔ (`--font-sans`) | ✔ `next/font` Inter → `--font-inter`; `--font-sans: var(--font-inter, "Inter"), …` in tokens; Tailwind `sans` → `--font-sans`. Same result as the design | OK |
| Quote & trade-in: **lead capture only, no prices** | ✔ (stepper, consent, webhook note) | ✔ No price in the UI or the schemas. `POST /api/forms/{quote,tradein}`: rate limit → honeypot `company_website` + fill time (+ optional Turnstile) → zod → `deliverSubmission()` = Sanity `formSubmission` doc (`lib/sanity/mutations.ts`, server write token; JSONL sink in fixture mode) **and** an HMAC-signed webhook (`x-speedy-signature`). Production returns 503 if neither is configured. QA `x-qa-dry-run: 1` validates the request and stores nothing. ✘ **Consent checkbox missing** (in the design on both flows) | Change requested: **Frontend** (consent field + LeadFlow), **CMS** (consent copy field) |
| Shop prices: "Price from Shopify" placeholder | ✔ (loading / empty frames) | ✔ `PRICE_PLACEHOLDER = "Price from Shopify"` is used when there is no price (ProductCard, PDP; verified in the PDP HTML). ✔ `app/(site)/shop/loading.tsx` skeleton. ✔ Storefront outage → empty state with eBay CTA, never a 500. Fixture adapter until Shopify credentials exist | OK (data: CMS / DevOps env) |
| Square & Jotform embeds: skeleton / loaded / fallback | ✔ EmbedShell: skeleton → loaded → **8 s** fallback (new tab + call), min-height reserved | ✔ `EmbedFacade`: idle facade → skeleton → loaded → fallback with direct link, fixed `heightClass` (no CLS). Δ fallback timer is **12 s**, not 8 s. Δ An extra click-to-load "idle" frame (perf/privacy) the design does not show. Δ Branded bar styling not matched. No "call" action in the fallback | Change requested: **Frontend** (8 s, call action, bar styling). Design Lead to accept the idle facade, or we auto-load on visibility |
| Privacy / Terms: live-site text marked pending legal review | ✔ "pending legal review before launch" note | ◐ The text is verbatim from the live site. CMS v1.2/1.3 added `needsReview` + `reviewNote` to the type, query and fixtures, but **`app/(site)/policies/[slug]/page.tsx` does not render them**: the Notice only shows when `isPlaceholder`, so the page shows no review note. `lastUpdated` is in the Sanity schema, but not in the type or the query | Change requested: **Frontend** (render the `needsReview` note + "Last updated"), **CMS** (expose `lastUpdated` in type and query) |
| Reduced motion | ✔ | ✔ All motion components have static fallbacks. Rive never mounts under reduced motion. 3D shows the poster | OK |
| 3D / Spline / Rive always dynamic + Suspense | ✔ | ✔ `HeroDevice` → `next/dynamic(PhoneScene, ssr:false)` in Suspense. `SplineScene` dynamic `ssr:false`. three / @react-three / @splinetool / @rive-app are **absent from every public route's first-load JS** (verified by the chunk matrix) | OK |
| Rive assets | Service icon state machines (P5) | ◐ Manifest + SVG fallbacks with the same state API. `public/rive/` has **no `.riv` files** (`AVAILABLE_RIV` is empty) → every page shows the SVG fallbacks | Change requested: **Motion & 3D** (author the .riv files to the manifest contract) |
| Inline styles | none | ◐ Only runtime styles from Framer (`style="opacity:…"`) and vendored React Bits `LogoLoop` (CSS-variable `style`) | Accept for vendored/runtime code, or **Motion & 3D** converts LogoLoop to CSS-var classes |
| First-load JS | <250 kB | ✔ 146–159 kB on all public routes (see §2) | OK |
| 1280/1920 design screens | home only | Phase 2 screens not shot | Design Lead (not an agent lane) |

## 1. Per-route table

Legend: ✔ built · ◐ partial · ✘ designed only · ○ static (SSG; Sanity → `/api/revalidate` webhook) · ● SSG with params · ISR = revalidate 300 s.
"Client boundary" lists the client islands only. Everything else is a Server Component.

| ID | Route | Design | Data source | Render | Client boundary | Embeds | Form states | Motion | 3D / Rive | Gaps (code vs design) | Perf risk | Verdict / owner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R01 | `/` | ✔ (+1280/1920) | Sanity (fixtures fallback): home, services, steps, brands, values, testimonials, promos, FAQ, settings | ○ | HeroDevice, ScrambleText, MagneticButton, BrandMarquee, ValueProps, Accordion, Newsletter/Contact forms | Google Map (facade) | Newsletter/contact: idle→submitting→success/error, lazy zod | SplitText hero, pinned How It Works (code ≥768 vs design ≥1280), LogoLoop marquee, value-prop cycle | Procedural R3F phone, lazy, poster `public/hero/phone-poster.*` is the LCP; Rive icons → SVG fallback | ◐ Hero chips + 4-line H1 spans; ✘ How It Works step visuals + "03" panel; ✘ Why 2-col stat numbers (`valueProp.stat` now in CMS v1.3; not rendered yet); testimonial rating hidden until P4 verified (intentional); promo imagery; footer wordmark / payments / social icons | Highest JS route (158.8). 3D chunk loads after idle on capable devices only; LogoLoop and Magnet chunks load during hydration (off the critical path) | Change requested: **Frontend** (hero chips, footer, Why layout), **Motion & 3D** (pin breakpoint ≥1280 per design or Design sign-off; .riv), **CMS** (fill `valueProp.stat` with real numbers only) |
| R02 | `/services` | ✔ | Sanity services ×14 + FAQ | ○ | Accordion, reveal hooks | — | — | `data-animate="reveal"` per section | Rive icons → SVG | ✘ Sticky side TOC ≥lg; ✘ pre-footer CTA band | 151.9 | Change requested: **Frontend** |
| R03 | `/shop` | ✔ | Shopify Storefront adapter (fixtures now) + Sanity shop page | ISR 300 s | ShopBrowser / ShopGrid (Framer layout filter) | — | loading.tsx skeleton, empty state | Framer layout filter (design: GSAP Flip; same effect) | — | ✘ Category tiles, sort select, Acima CTA, sell-CTA band; ◐ loading/empty frames not styled to the design | 149.4; `cdn.shopify.com` already in `images.remotePatterns` | Change requested: **Frontend**; **DevOps** (Shopify env) |
| R04 | `/shop/[product]` | ✔ | Shopify adapter (fixtures: 10 iPhones + $49.99 warranty) | ● ISR 300 s, `dynamicParams` | AddToCart (server actions, cart cookie) | — | add: pending / success / error / staging notice | Design: add-to-cart drawer | — | ✘ Cart drawer (code shows an inline notice + checkout link); hand-written breadcrumb (OK) | 147.9; `priority` image = LCP | Change requested: **Frontend** (drawer), **Motion & 3D** (drawer motion) |
| R05 | `/sell-your-device` | ✔ | Sanity sell page, brands, steps; enum options from `tradeInSchema` (server) | ○ | TradeInForm | — | idle→submitting→success/error, field errors (checked in the browser: 7 errors on empty submit) | Design: multi-step LeadFlow, progress, chips, RadioCards, ModelList search | — | ✘ **Multi-step LeadFlow** (code is single-page); ✘ consent; trade-in condition list is the proposed set (HANDOFF open issue) | 149.2 (zod is lazy now) | Change requested: **Frontend** (LeadFlow on `MultiStepForm`), **Motion & 3D** (step transitions), **CMS** (condition list sign-off) |
| R06 | `/instant-quote` | ✔ | Sanity quote page; Service summary from the SEO graph | ○ | QuoteForm | — | as R05 (checked: 6 errors on empty submit) | LeadFlow stepper | — | ✘ Multi-step LeadFlow; ✘ consent; G4 copy: CMS v1.3 added `page.intro`; ServiceSummary still reads `lib/seo/routes.ts` | 149.1 | Change requested: **Frontend**, **Motion & 3D**, **Frontend + SEO** (render `page.intro`, keep it equal to the Service JSON-LD description) |
| R07 | `/schedule-repair` | ✔ | Sanity schedule page + settings (Square URL) | ○ | EmbedFacade | **Square** | facade/skeleton/loaded/fallback | skeleton shimmer (reduced-motion: static) | — | Δ 12 s vs 8 s fallback, no call action, branded bar | 150.3; Square iframe only after a click | Change requested: **Frontend** |
| R08 | `/faq` | ✔ | Sanity FAQ | ○ | Accordion (`engine="gsap"`, async engine) | — | — | GSAP accordion | — | Category grouping per design to be confirmed | 148.1 | OK |
| R09 | `/about` | ✔ | Sanity about page, team, settings | ○ | Contact form (lazy) | Map facade | contact states | reveals | — | ◐ Team grid / layout blocks; copy TBD (P8) shown with `PlaceholderMark` | 150.4 | Change requested: **Frontend** (layout), **CMS** (P8 copy) |
| R10 | `/financing` | ✔ | Sanity financing page, steps, FAQ | ○ | Accordion | Acima apply = external link | — | 3-step row | — | ◐ 3-step row styling; copy TBD (P8) | 148.1 | Change requested: **Frontend**, **CMS** |
| R11 | `/home-internet` | ✔ | Sanity home-internet page + FAQ (Jotform URL) | ○ | EmbedFacade, Accordion | **Jotform** | facade/skeleton/loaded/fallback | $40 count-up | — | Δ same EmbedFacade deltas as R07; count-up ◐ to verify against the design | 149.5 | Change requested: **Frontend**, **Motion & 3D** (count-up) |
| R12 | `/policies/shipping-return` | ✔ | Sanity policyPage (verbatim live text) | ● (`dynamicParams=false`) | none | — | — | TOC IntersectionObserver | — | ✘ PolicyLayout (sticky TOC ≥1024, "On this page" disclosure); ✘ "Last updated"; return address Ste 23 vs #27 + typos are open issues (do not "fix" the copy without the client) | 146.1 | Change requested: **Frontend** (PolicyLayout), **CMS** (`lastUpdated`, address sign-off) |
| R13 | `/policies/privacy` | ✔ | as R12 | ● | none | — | — | as R12 | — | as R12 + ✘ **visible "pending legal review" note** (data is there: `needsReview`) | 146.1 | Change requested: **Frontend** (+ CMS `lastUpdated`) (see §0) |
| R14 | `/policies/terms` | ✔ | as R12 (also the Shopify ToS question, OQ-17) | ● | none | — | — | as R12 | — | as R13 | 146.1 | Change requested: **Frontend** (+ CMS `lastUpdated`) |

Not a public route: `/studio` (Sanity Studio, 1.98 MB, isolated, expected). `/motion-lab/*` (dev demos): already noindex and `notFound()` on production (`app/motion-lab/layout.tsx`). OK.

## 2. Perf snapshot (gz kB, after `perf/first-load-js`)

| Route | Next "First Load" | True (incl. layouts) |
|---|---|---|
| `/` | 144 | 158.8 |
| `/services` | 137 | 151.9 |
| `/shop` | 142 | 149.4 |
| `/shop/[product]` | 123 | 147.9 |
| `/instant-quote` | 119 | 149.1 |
| `/sell-your-device` | 119 | 149.2 |
| `/schedule-repair` | 120 | 150.3 |
| `/faq` | 125 | 148.1 |
| `/about` | 125 | 150.4 |
| `/financing` | 125 | 148.1 |
| `/home-internet` | 135 | 149.5 |
| `/policies/[slug]` | 107 | 146.1 |

On public routes the only remaining libraries above the framework are Framer core (motion-dom ≈ 18 + framer ≈ 8) and tailwind-merge (8.6). gsap, lenis, three, Rive, Spline, zod, Sanity and portabletext are all absent from public first-load JS.
Not measured here: LCP, INP and CLS on real devices. **DevOps / QA** should run Lighthouse CI on the staging preview.

## 3. Change requests by owner

- **Frontend:** LeadFlow multi-step for R05 and R06 (+ consent, `form-progress` / `form-option` hooks). EmbedShell parity (8 s fallback, call action, branded bar). PolicyLayout + `needsReview` note + Last updated. Render the v1.3 fields `intro`, `valueProp.stat` and the nav dropdown (eyebrows already render). Shop category tiles / sort / Acima / sell bands and styled loading/empty frames. Cart drawer. Services TOC + CTA band. Footer, hero chips, Why layout, About/Financing blocks.
- **Motion & 3D:** `.riv` files for the manifest. How It Works pin breakpoint (≥1280 per design vs ≥768 in code; get it agreed). LeadFlow step transitions. Cart drawer motion. $40 count-up check. Optional: LogoLoop inline-style cleanup.
- **CMS:** `PolicyPage.lastUpdated` in type and query (`needsReview` / `reviewNote` are done in v1.2). Consent copy field. Real `valueProp.stat` values. P8 copy. Return-address sign-off. Trade-in condition list sign-off. (v1.3 already delivered: nav 7 + Services ▾, eyebrows, page intro, `valueProp.stat` field.)
- **SEO:** `public/og/default.jpg` is missing. Keep the rating markup off until P4 is verified.
- **DevOps:** Shopify / Sanity / webhook env on staging.  Lighthouse CI on preview. **Add a git remote** (none is configured, so no branch can be pushed).

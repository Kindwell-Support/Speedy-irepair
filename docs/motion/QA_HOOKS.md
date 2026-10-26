# QA hooks audit (Motion & 3D), 2026-10-27

Sources: `qa/README.md` and `qa/tests/**`. Checked on isolated `/tmp` builds of `motion/followups`, rebased on
`feature/foundation` e774b82, with `next build` + `next start`. Raw output: `docs/motion/followups-prod.json` and
`docs/motion/followups-staging.json` (script `scripts/motion-followups-check.mjs`).

## `window.__QA__` (staging-only debug hook)
Gate: `components/motion/LenisProvider.tsx`, `process.env.NEXT_PUBLIC_SITE_ENV !== "production"`. The value is inlined at build time.

| Build | `window.__QA__` | Keys | `html.lenis` |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_ENV=production` | **absent** | none | yes |
| `NEXT_PUBLIC_SITE_ENV=staging` | present | `lenis, gsap, ScrollTrigger` | yes |

So production does not expose it, and the motion spec's Lenis detection still passes there via `.lenis` on `<html>`.

## Hooks present (home 1440, plus the listed routes)
- **`data-section`:** all 12 are present once on `/`: banner, hero, services, how-it-works, brands, why-choose-us, testimonials, promotions, faq, location, newsletter, footer.
- **`data-testid` on `/`:**
  - Once each: announcement-banner, logo, nav-toggle, mobile-nav, hero, hero-poster (inside `hero`), how-it-works, brands-marquee, testimonials, promotions, map-embed, newsletter-form, contact-form.
  - Counted: service-card ×8, testimonial-placeholder ×3.
- **Other routes:**
  - `/services`: service-section ×14.
  - `/shop`: product-card ×9.
  - `/instant-quote`: quote-form, form-progress, form-option ×6.
  - `/sell-your-device`: trade-in-form, form-progress, form-option ×5.
  - field-error and form-success render on interaction (in source: FieldMessage, LeadFlowSuccess, FormShell).
- **Other checks:**
  - Skip link `a[href="#main"]` and `#main` are present.
  - FAQ buttons carry `aria-expanded` and `aria-controls`.

## Added by Motion & 3D (my directories)
| Hook | Where | Why |
|---|---|---|
| `data-pinned="true\|false"` + `data-steps-mode="pin\|stack"` on the **`[data-testid="how-it-works"]` section** (and on `[data-pin="how"]`) | `lib/motion/bindings.ts` | REQ-026 selector `[data-testid="how-it-works"][data-pinned="true"]` needs both attributes on one element. The testid sits on the Frontend's `<Section>`, the pin on the inner `[data-pin]`. |
| `data-cursor-follower` on the cursor overlay root | `components/motion/reactbits/TargetCursor.tsx` | The visual spec hides `[data-cursor-follower], .cursor-follower`. Before this, nothing matched. |
| `[data-multistep][data-direction]`, `[data-drawer]…`, `[data-countup]…` | MultiStepForm / Drawer / CountUp | New, documented in HOOKS.md |

## Missing or conflicting, with owners
| # | Item | Owner | Detail |
|---|---|---|---|
| 1 | `data-testid="star-rating"` is absent on `/` | **Frontend** (`components/sections/home/Testimonials.tsx`) | `content.spec.ts:246` also accepts `[aria-label*="star"]` / `[role="img"][aria-label*="out of 5"]`. Only placeholders render now (no reviews in CMS), so add the testid/aria-label to the star row of both the real and the placeholder card |
| 2 | `data-testid="testimonial"` count is 0 | **Content / CMS** (then Frontend) | No real testimonials in the fixtures. The spec accepts `testimonial-placeholder`, so this is informational |
| 3 | **REQ-026 runs at every viewport**, but per design How It Works pins only at **≥1280** | **QA** (`qa/tests/e2e/motion.spec.ts`) | Below 1280 the section is now an unpinned stack (`data-pinned="false"`, `data-steps-mode="stack"`), so REQ-026 fails at 375/768/1024 by design. Fix: gate the pin assertion to `viewport.width >= 1280`, and below that assert `[data-testid="how-it-works"][data-steps-mode="stack"]` |
| 4 | `data-countup` on the `/home-internet` `$40` and the home "45" / "90" | **Frontend** (`app/(site)/home-internet/page.tsx`, `WhyChooseUs.tsx`) | `CountUp` is ready; usage is in HOOKS.md. Not wired, because no hook exists in Frontend markup |
| 5 | Cart drawer | **Frontend** (shop PDP `AddToCart.tsx`) | There's no drawer component in the Frontend yet. `Drawer` is ready (`testId="cart-drawer"` suggested); props are in HOOKS.md |

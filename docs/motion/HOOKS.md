# Motion hook contract (HOOKS.md)

Owner: Motion & 3D lane. Code: `lib/motion/bindings.ts` (selectors in `SEL`), `lib/motion/motion.css`, `lib/motion/boot-script.tsx`.
Sections never import gsap/lenis/framer. They opt in with the attributes below, which are server-rendered and work without JS.
Each hook accepts both the `data-animate="…"` contract form and the Design/Frontend shorthand already used in `design/pages/home.html`.

## 0. Global state (on `<html>`)
| Attribute / class | Set by | Values / meaning |
|---|---|---|
| `data-motion` | `MotionBootScript` (inline in `<head>`, before first paint) | `ok` = motion allowed, so CSS before-states apply. `reduce` = OS reduced motion or `?motion=reduce`. `fallback` = nothing bound within 2.5 s, so everything becomes visible. |
| `data-motion-ready` | `bindAnimations()` | The bindings ran. |
| `.lenis`, `.lenis-smooth` | Lenis | Smooth scroll is active. It is never present under reduced motion. |
| `window.__QA__ = { lenis, gsap, ScrollTrigger }` | `LenisProvider` (async engine) | Present everywhere except `NEXT_PUBLIC_SITE_ENV=production`. |

## 1. Scroll hooks (GSAP, bound by `useDataAnimate` inside `PageTransition`)
| Hook | Shorthand alias | Options | Behaviour (motion OK) | Reduced motion / no JS |
|---|---|---|---|---|
| `data-animate="reveal"` | `data-scroll-trigger` (any value; `="load"` reveals on load) | `data-reveal="children"` reveals the children with a stagger. `data-reveal-delay="0.1"`. `data-reveal-trigger="load"` | Fade plus y 24→0, 0.55 s power3.out, at top 85%, once | Visible, static |
| `data-animate="stagger"` | `data-stagger`, `data-stagger-group` (value = seconds per item, default 0.08) | Children, or `[data-animate-item]` / `[data-stagger-item]` descendants | `ScrollTrigger.batch` at 88%. Fade plus y, 0.55 s, stagger 0.08 | Visible |
| `data-animate="parallax"` | `data-parallax="8"` (% of element height) | n/a | yPercent ±N, scrubbed across the parent's viewport transit | Static |
| `data-animate="split-heading"` | `data-split="words\|chars\|lines"` | `data-split-trigger="load"`, `data-split-delay` | SplitText (masked lines/words, `aria:auto`, `autoSplit`). yPercent 110→0, words stagger 0.05 | Plain text |
| `data-animate="steps"` | `data-pin="how"` | Children: `[data-step]` tiles. `[data-steps-pin]` (optional; the element that gets pinned, defaults to the section). `[data-steps-progress]` or `.progress__fill` (bar) | Breakpoint = `STEPS_PIN_MIN_PX` (1280) in `lib/motion/tokens.ts`, the single source; `motion.css` mirrors it as `1279.98px`. **≥1280 (`pin`)**: the tile row pins from `top 30%` for `STEPS_PIN_VH` (2.5) × 100vh, scrub 0.3, snap per step. The previous tile tips like a domino (rotate −6° at its bottom-left origin), then settles to "done" (full opacity; heading colour drops to `text-secondary` #a3a3a3 via `motion.css` on `[data-done]`, never an opacity dim, so text keeps ≥ 4.5:1). The active tile lifts (y −8) and the bar scaleX goes 0→1. Clicking a tile scrolls to its step. **<1280 (`stack`)**: no pin; each card fades in and rises 16px on enter (0.48s, stagger 60ms); the rail is static. Once revealed a card stays visible (`data-revealed`): a failsafe re-checks on ScrollTrigger `scrollEnd`/`refresh`, on `resize` and 1.5s after bind, and force-shows any still-hidden card whose top is above the viewport bottom (QA BUG-008/009). `reveal`/`stagger` use the same failsafe. Sets `data-steps-mode="pin\|stack"` and `data-pinned="true\|false"` on `[data-pin]` **and** on the closest `[data-testid="how-it-works"]`. Also sets `data-testid="how-it-works"` (if absent); in pin mode `.is-active`/`.is-done`, `data-active`/`data-done`, `aria-current="step"` and `data-step-jump` on tiles | Plain ordered list, all tiles visible, no attributes |
| `data-animate="countup"` | n/a | `data-countup-from` (default 0), `data-countup-duration` (s, 0.3–1.2, default 0.6). The element's first text node must hold the number (`40`, `$40`, `4.9`, `1,200`); prefix/suffix and thousands separators are kept | Counts `from`→value on enter (top 85%, once), power3.out. Rewrites only that text node's `nodeValue` (React keeps its node) and restores the exact SSR text at the end and on cleanup. Sets `data-countup-state="idle\|running\|done"`. Use `<CountUp>` when you can render a component; this hook is for server components such as `WhyStat` | Final number (SSR text, untouched) |
| `data-faq` | n/a | `data-faq="single"` closes siblings | Progressive enhancement of native `<details class="accordion__item">` / `summary` / `.accordion__panel`: GSAP height + autoAlpha (open 0.42 s, close 0.3 s) | Native `<details>` toggling |

### 1b. Non-motion state hooks (bound under reduced motion too)

| Hook | Where | Behaviour | Reduced motion |
|---|---|---|---|
| `a[data-toc-link="<id>"]` | /services index + jump chips, /policies/* contents list (sticky ≥lg and the `<details>` list <lg) | `lib/motion/scroll-spy.ts` (inside the async engine chunk; no GSAP). The active section is the last `#<id>` whose top has crossed 30% of the viewport (the last one at page bottom). Every link for that id gets `aria-current="true"` (Frontend styles it with `aria-[current=true]:`). The active jump chip is scrolled into view inside its own horizontal scroller (never scrolls the page). Links get a 150ms colour/border transition (policies design) | Same `aria-current`, 0ms transitions |
| `data-animate="toc-spy"` (the sticky nav) | ServicesIndex, PolicyToc | Adds `data-toc-ready` and an `aria-hidden` `[data-toc-indicator]` bar that slides (transform + height, 200ms, services design) to the active link; while it is present the active link's own border is transparent | Bar jumps (0ms) |
| `data-animate="shimmer"` | `/shop` loading + `ProductSkeleton`, `EmbedFacade` skeleton | CSS only (`motion.css`): transform-only `::after` sweep, 1.2s linear, infinite (shop design) | Static block |

In-page `#anchor` clicks (TOC links, chips) go through Lenis: 600ms, offset −96px (design "Lenis smooth scroll, 600ms, offset for the nav"; matches the 96px scroll-margin).

## 2. Component hooks (Framer / Rive / 3D / React Bits)
| Markup | Component | Notes |
|---|---|---|
| `data-rive-host` (or `data-rive="icon-…"`) on a card | `<RiveIcon id>` inside it | Hover, focus and click on the host drive the icon state. Ids are in `components/rive/manifest.ts` (+ Design aliases `icon-repair` etc.). The icon sets `data-rive-icon`, `data-rive-mode="svg\|rive"` and `data-state` |
| `.magnetic` / `<MagneticButton>` | React Bits Magnet | Fine pointer only. Off under reduced motion |
| `data-scramble` / `<ScrambleText text>` | React Bits DecryptedText | Hover only, fine pointer. Real text stays in the DOM |
| `data-brand` / `<BrandMarquee brands>` | React Bits LogoLoop | Reduced motion gives a static wrapped list |
| `data-3d-poster` / `<HeroDevice poster?>` | R3F hero | Sets `data-3d="pending\|off:<reason>"` (reason: `disabled` (`?no3d=1`), `reduced-motion`, `save-data`, `low-power`, `no-webgl`, `software-gl`, `low-fps:<n>`; `?force3d=1` overrides all but save-data) and `data-phase="poster\|mounting\|live\|degraded"`. The poster `<img data-testid="hero-poster">` is the LCP element. The page wrapper should carry `data-testid="hero"` (QA) |
| `<Accordion engine="framer\|gsap">` | Framer / GSAP | Contract: `button[aria-expanded][aria-controls]` + `[role=region]`. Answers stay in the DOM |
| `data-speakable` | n/a | Not motion; listed so motion never wraps or splits away its text node (SplitText `aria:auto` keeps the label) |

## 3. Rules for authors
1. Animate only transforms and opacity. The only height tweens are the accordions (isolated with `contain`).
2. Never add `style=` for motion. The before-states live in `motion.css`, gated on `html[data-motion="ok"]`.
3. Don't nest a Framer-animated element inside a `data-stagger` child. Wrap it, because GSAP and Framer would fight over `transform`.
4. Lenis is the only scroller. Use `useLenis()` / `scrollToTarget()`, never `window.scrollTo` with smooth behaviour. Put `data-lenis-prevent` on embeds and modals.
5. The heavy libraries are never in first-load JS:
   - GSAP, ScrollTrigger, SplitText, Lenis and the bindings come through `loadMotionEngine()` (`lib/motion/engine.ts`).
   - Framer uses `LazyMotion` + `m.*`.
   - R3F, Rive and Spline use `next/dynamic`.


## Components added 2026-10-27 (follow-ups)

### `Drawer` (`components/motion/Drawer.tsx`)
A right-side modal sheet. Panel x 100%→0 and scrim opacity, 320ms (`DUR.drawer`) power-out in, power-in-out out. Reduced motion: 150ms fade (`DUR.fadeReduced`), no slide.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | Controlled by the Frontend |
| `onClose` | `() => void` | required | Escape, scrim click, close button |
| `title` | `ReactNode` | none | Visible `<h2>`, becomes `aria-labelledby` |
| `ariaLabel` | `string` | none | Accessible name when there is no `title` |
| `children` | `ReactNode` | required | Scrollable body (`data-lenis-prevent`) |
| `footer` | `ReactNode` | none | Sticky bottom (subtotal + Checkout) |
| `initialFocusRef` | `RefObject<HTMLElement>` | first focusable | Focus target on open |
| `closeLabel` | `string \| null` | `"Close"` | `null` hides the built-in button |
| `widthClassName` | `string` | `"w-full max-w-[420px]"` | Panel width |
| `className` | `string` | none | Extra panel classes |
| `testId` | `string` | none | `data-testid` on the dialog, e.g. `cart-drawer` |
| `id` | `string` | none | On the portal root |

Behaviour: portal to `body`, `role="dialog"` with `aria-modal="true"`, a Tab/Shift+Tab focus trap, Escape, `inert` on every other body child, and focus returned to the opener. Scroll lock: Lenis `stop()` plus `html[data-drawer-open]` (overflow hidden). Hooks: `[data-drawer][data-state]`, `[data-drawer-panel]`, `[data-drawer-scrim]`, `[data-drawer-close]`. Demo: `/motion-lab/drawer`. Timing follows the design (shop-product: "slides in from the right, 320ms"); the earlier 0.25s (`DUR.page`) was replaced on 2026-10-27.

### `CountUp` (`components/motion/CountUp.tsx`)
`<CountUp value={40} prefix="$" />` counts `from`→`value` once on enter. rAF, ease-out cubic, `duration` 0.6s (clamped 0.3–1.2), `tabular-nums`. SSR, no-JS and reduced motion render the final value. Screen readers get the final value as sr-only text; the ticking digits are `aria-hidden`. Props: `value`, `from` (0), `duration`, `decimals` (0), `prefix`, `suffix`, `ariaLabel` (overrides the sr-only text), `className`, `threshold` (0.4). Hooks: `[data-countup]`, `data-countup-value`, `data-countup-state="idle|running|done"`.

**Frontend wiring status (2026-10-27 pass, markup at `ef1ec7a`):** no count-up hook or element exists yet, so nothing counts on the live routes. Two ways in, both verified on `/motion-lab/drawer`:
- **Server component, one attribute (preferred for `WhyStat`):** put the number in its own element with `data-animate="countup"`, e.g. in `components/sections/home/WhyStat.tsx`: `<span data-animate="countup">{value}</span><small>{label}</small>`. The engine counts it on enter and restores the CMS string at the end; non-numeric strings are left alone. Seed values for `valueProp.stat` are still empty (CMS).
- **Client component:** `<CountUp value={40} prefix="$" />` (`/home-internet`). The page has no offer/price element yet; the `$40/mo` fact only appears inside CMS list text. Frontend needs to add the design's offer card with the price as its own element (either form above).
- Wrapper classes (size and colour) stay on the Frontend's element.

### `MultiStepForm` transitions (updated)
Direction-aware: the outgoing step goes x ∓24px with a fade, 160ms ease-in-out (`DUR.stepOut`). The incoming step comes from the opposite side, 240ms power3-out (`DUR.stepIn`). The progress bar is a scaleX tween over 0.3s. Reduced motion: instant. New hook: `[data-multistep][data-direction="forward|back"]`. The Frontend's props (`header`, `progressTestId`, `titleClassName`) are unchanged.

## Contrast rule for inactive / dimmed states (2026-10-27, axe BUG on `/`)

Motion components never dim **text** with opacity. Inactive text keeps the Frontend's colour token (`text-secondary` #a3a3a3 = 7.85:1 on #0a0a0a); active text brightens to `text-primary` with a 200ms colour transition (`motion.css`). Applies to:
- `ValueProps`: the `opacity: 0.6` on inactive lines is removed; `[data-value-props] > li[data-active] p` gets `text-primary`.
- How It Works pin mode: "done" tiles no longer go to `autoAlpha .6`; `[data-step][data-done]` headings get `text-secondary`.
- Audited and OK: `ScrambleText` (`scramble-enc` has no dimming rule, glyphs inherit the text colour), `LogoLoop` `--logoloop-dim` (only with `muted`, which `BrandMarquee` does not pass; the logos are `role="img"` and are not text), `BrandLogo` grey layer (`text-secondary`, aria-hidden).

## BrandMarquee landmark

`BrandMarquee` is its own labelled region in **both** branches: loop = `LogoLoop` root `role="region" aria-label="Brands we repair"`; reduced motion / static = a `<div role="region" aria-label="Brands we repair">` wrapping the `<ul>`. The Frontend's `Brands` section relies on this (`landmark={false}`); do not add a second label.

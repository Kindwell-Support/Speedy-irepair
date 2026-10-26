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
| `data-animate="reveal"` | n/a | `data-reveal="children"` reveals the children with a stagger. `data-reveal-delay="0.1"`. `data-reveal-trigger="load"` | Fade plus y 24→0, 0.55 s power3.out, at top 85%, once | Visible, static |
| `data-animate="stagger"` | `data-stagger` (value = seconds per item, default 0.08) | Children, or `[data-animate-item]` descendants | `ScrollTrigger.batch` at 88%. Fade plus y, 0.55 s, stagger 0.08 | Visible |
| `data-animate="parallax"` | `data-parallax="8"` (% of element height) | n/a | yPercent ±N, scrubbed across the parent's viewport transit | Static |
| `data-animate="split-heading"` | `data-split="words\|chars\|lines"` | `data-split-trigger="load"`, `data-split-delay` | SplitText (masked lines/words, `aria:auto`, `autoSplit`). yPercent 110→0, words stagger 0.05 | Plain text |
| `data-animate="steps"` | `data-pin="how"` | Children: `[data-step]` tiles. `[data-steps-pin]` (optional; the element that gets pinned, defaults to the section). `[data-steps-progress]` or `.progress__fill` (bar) | Breakpoint = `STEPS_PIN_MIN_PX` (1280) in `lib/motion/tokens.ts`, the single source; `motion.css` mirrors it as `1279.98px`. **≥1280 (`pin`)**: the tile row pins from `top 30%` for `STEPS_PIN_VH` (2.5) × 100vh, scrub 0.3, snap per step. The previous tile tips like a domino (rotate −6° at its bottom-left origin), then settles to "done" (α .6). The active tile lifts (y −8) and the bar scaleX goes 0→1. Clicking a tile scrolls to its step. **<1280 (`stack`)**: no pin; each card fades in and rises 16px on enter (0.48s, stagger 60ms); the rail is static. Sets `data-steps-mode="pin\|stack"` and `data-pinned="true\|false"` on `[data-pin]` **and** on the closest `[data-testid="how-it-works"]`. Also sets `data-testid="how-it-works"` (if absent); in pin mode `.is-active`/`.is-done`, `data-active`/`data-done`, `aria-current="step"` and `data-step-jump` on tiles | Plain ordered list, all tiles visible, no attributes |
| `data-faq` | n/a | `data-faq="single"` closes siblings | Progressive enhancement of native `<details class="accordion__item">` / `summary` / `.accordion__panel`: GSAP height + autoAlpha (open 0.42 s, close 0.3 s) | Native `<details>` toggling |

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
A right-side modal sheet. Panel x 100%→0 and scrim opacity, 0.25s power-out in, 0.2s out. Reduced motion: 120ms fade, no slide.

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

Behaviour: portal to `body`, `role="dialog"` with `aria-modal="true"`, a Tab/Shift+Tab focus trap, Escape, `inert` on every other body child, and focus returned to the opener. Scroll lock: Lenis `stop()` plus `html[data-drawer-open]` (overflow hidden). Hooks: `[data-drawer][data-state]`, `[data-drawer-panel]`, `[data-drawer-scrim]`, `[data-drawer-close]`. Demo: `/motion-lab/drawer`. Design asks for 320ms on the cart drawer; the brief fixed 0.25s (`DUR.page`).

### `CountUp` (`components/motion/CountUp.tsx`)
`<CountUp value={40} prefix="$" />` counts `from`→`value` once on enter. rAF, ease-out cubic, `duration` 0.6s (clamped 0.3–1.2), `tabular-nums`. SSR, no-JS and reduced motion render the final value. Screen readers get the final value as sr-only text; the ticking digits are `aria-hidden`. Props: `value`, `from` (0), `duration`, `decimals` (0), `prefix`, `suffix`, `ariaLabel` (overrides the sr-only text), `className`, `threshold` (0.4). Hooks: `[data-countup]`, `data-countup-value`, `data-countup-state="idle|running|done"`.

**Hook for the Frontend (not wired: no `data-countup` exists in the Frontend markup yet):**
- `/home-internet` offer card: replace the static `$40` with `<CountUp value={40} prefix="$" />`. The 600ms default matches the design note.
- Home "Why choose us" figures (`components/sections/home/WhyStat.tsx`, the CMS `valueProp.stat` string): when the value is numeric, use `<CountUp value={45} duration={0.48} />` and `<CountUp value={90} duration={0.48} />`.
- Wrapper classes (size and colour) stay on the Frontend's element.

### `MultiStepForm` transitions (updated)
Direction-aware: the outgoing step goes x ∓24px with a fade, 160ms ease-in-out (`DUR.stepOut`). The incoming step comes from the opposite side, 240ms power3-out (`DUR.stepIn`). The progress bar is a scaleX tween over 0.3s. Reduced motion: instant. New hook: `[data-multistep][data-direction="forward|back"]`. The Frontend's props (`header`, `progressTestId`, `titleClassName`) are unchanged.

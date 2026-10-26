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
| `data-animate="steps"` | `data-pin="how"` | Children: `[data-step]` tiles. `[data-steps-pin]` (optional; the element that gets pinned, defaults to the section). `[data-steps-progress]` or `.progress__fill` (bar) | ≥768 px: the tile row pins, the scrub moves between steps (snap), previous tiles tip over and the active tile lifts, and the bar scaleX goes 0→1. <768 px: a pinned **card stack** (tiles share one grid cell and cross-fade/tip over). Sets `data-pinned="true"`, `data-testid="how-it-works"` (if absent), `.is-active`/`.is-done`, `data-active`/`data-done` and `aria-current="step"` on tiles | Plain ordered list, all tiles visible |
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

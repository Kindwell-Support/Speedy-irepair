# Lenis + GSAP ScrollTrigger config (deliverable c)

Source: `lib/motion/lenis-gsap.ts` (config), `components/motion/LenisProvider.tsx` (lifecycle), `lib/motion/gsap.ts` (registration), `lib/motion/engine.ts` (async loading).

## Load order (hierarchy Lenis > GSAP > Framer > Rive > React Bits)
1. `MotionBootScript` (inline, in `<head>`) sets `html[data-motion]` before first paint.
2. Hydration: `LenisProvider` and `useDataAnimate` call `loadMotionEngine()`. One async chunk holds gsap, ScrollTrigger, SplitText, Lenis and the bindings, about 55 KB gz, and is **not** in first-load JS. The memoised promise means the chunk is fetched once.
3. The engine resolves:
   - `registerGsap()` registers the plugins once, with `gsap.defaults({ ease: "power3.out", duration: 0.55 })` and `ScrollTrigger.config({ ignoreMobileResize: true })`.
   - `createLenisGsap()` starts Lenis.
   - `bindAnimations(root)` binds the hooks inside `gsap.matchMedia()`.
4. Framer (`LazyMotion`, domMax loaded async), Rive (dynamic, IntersectionObserver-gated, self-hosted `/rive/rive.wasm`) and React Bits all mount independently. None of them owns the scroll.

## Lenis options (`LENIS_DEFAULTS`)
| Option | Value | Why |
|---|---|---|
| `lerp` | 0.14 | Snappier than the default 0.1, with no "floaty" feel (brief: fast, precise) |
| `smoothWheel` | true | n/a |
| `syncTouch` | false | Touch keeps native momentum, which gives better INP on iOS/Android |
| `wheelMultiplier` / `touchMultiplier` | 1 / 1 | n/a |
| `autoRaf` | **false** | Lenis runs from `gsap.ticker`, so Lenis, ScrollTrigger and tweens share one rAF |
| `anchors` | `{ offset: -80, duration: 0.8 }` | In-page `#hash` links clear the sticky header |
| `data-lenis-prevent` | on embeds/modals | Native scroll inside them |

## Wiring
```ts
const lenis = new Lenis({ ...LENIS_DEFAULTS, autoRaf: false });
lenis.on("scroll", ScrollTrigger.update);           // triggers read the same frame's scroll
gsap.ticker.add((t) => lenis.raf(t * 1000));        // single loop
gsap.ticker.lagSmoothing(0);                         // a long frame never makes scroll jump back
// destroy(): ticker.remove, lagSmoothing(500, 33) restored, lenis.off + destroy
```
- Lenis scrolls the **native window**, so ScrollTrigger needs **no `scrollerProxy`**. Pins use `position: fixed` + `.pin-spacer` as normal.
- Route change: `scrollToTarget(lenis, 0 | #hash, immediate)`, then `ScrollTrigger.refresh()` on the next frame. `PageTransition` reverts the old page's `gsap.matchMedia` context, which kills every tween, trigger, pin and split.
- `document.fonts.ready` triggers `ScrollTrigger.refresh()`. SplitText `autoSplit` re-splits when fonts load or the viewport resizes.
- Never override Lenis: no `window.scrollTo({behavior:"smooth"})` and no CSS `scroll-behavior: smooth`. Use `useLenis()` / `scrollToTarget()`.

## Reduced motion
- Lenis is never created, so `html.lenis-smooth` is absent and native scroll is used.
- `gsap.matchMedia` binds nothing under `(prefers-reduced-motion: reduce)`.
- The CSS before-states are gated on `html[data-motion="ok"]`, so content is visible from the very first paint.
- Framer uses `MotionConfig reducedMotion="user"`.
- No 3D, no Rive wasm, the marquee is static and the cursor follower is off.

## ScrollTrigger defaults used
| Use | start / end | Other |
|---|---|---|
| Reveal | `top 85%` | once |
| Stagger batch | `top 88%` | once, stagger 0.08 |
| Split heading | `top 85%` | once, or on load in the hero |
| Parallax | `top bottom` → `bottom top` | scrub: true |
| How It Works ≥1280 (`STEPS_MQ.pin`) | pin the tile row from `top 30%` (clear of the sticky header), end `+=STEPS_PIN_VH×vh` (2.5 × vh) | scrub 0.3, snap 1/(n-1), `invalidateOnRefresh`; a tile click goes through `lenis.scrollTo` (`getLenis()`) |
| How It Works <1280 (`STEPS_MQ.stack`) | **no pin**; `ScrollTrigger.batch` `top 88%`, once | Per-card fade + 16px rise, stagger 60ms |

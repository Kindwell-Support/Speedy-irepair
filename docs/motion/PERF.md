# Motion & 3D performance report

Run: 2026-10-26T22:12:18.099Z UTC (2026-10-27, Asia/Karachi), Playwright Chromium (headless, SwiftShader GL) against a production `next build && next start` of `feature/foundation` (isolated copy at /tmp/mb; `app/studio` was excluded). Raw data is in `perf-results.json`. The earlier run, made before the software-GL gate, is in `perf-results-pre-softgl-gate.json`.
Script: `WEB_ROOT=<build root> node scripts/motion-perf.mjs http://localhost:<port>`.

## Bundle budget: first-load JS before and after (Next build table, gzip)

| Route | Before (Architect baseline) | After LazyMotion + `m` | After async motion engine (now) | Budget |
|---|---|---|---|---|
| `/` | **254 kB** | 224 kB | **178 kB** | < 250 kB ✅ |
| `/services` | – | – | 136 kB | ✅ |
| `/faq` | – | – | 124 kB | ✅ |
| `/shop` | – | – | 142 kB | ✅ |
| `/instant-quote` | – | – | 143 kB | ✅ |
| `/about` | – | – | 149 kB | ✅ |
| `/motion-lab` | – | – | 150 kB | ✅ |

Shared by all routes: 103 kB. The home route by my own gzip-9 chunk sum went from 271.7 KB to 191.4 KB. The sum runs higher than Next's figure because Next uses a different gzip level and counts shared chunks once.

**Motion share of first load: ≈ 40 KB gz** against the ≤ 110 KB budget. Before the change it was about 96 KB. It breaks down as:
- framer-motion `m` + LazyMotion shell ≈ 15 KB.
- Our providers, hooks, Rive SVG icons and React Bits ≈ 25 KB.

GSAP, ScrollTrigger, SplitText, Lenis and the bindings now live in one async chunk (`lib/motion/engine-impl.ts`). It is fetched by `LenisProvider` / `useDataAnimate` after hydration. Framer's `domMax` features are also async (`components/motion/framer-features.ts`).

**Lazy chunks (never in first load):**
- three + R3F + drei, 4 chunks: **265 KB gz** (`1572.bd1d89e99626ab5f.js, 2f1ece83.ca57d980dbf434c5.js, cc7b4f70.3a29e35ea1915594.js, d21f0d8a.9db162b5c8756c8b.js`).
- @rive-app, 2 chunks: **77.1 KB gz**. Only loaded if a `.riv` file exists, and none do yet. The rive wasm was fetched in 0 of 32 runs.
- The static check `threeInFirstLoad=false` / `riveInFirstLoad=false` holds for every route.

The largest remaining non-motion first-load chunk is **zod (~24 KB gz)**, pulled in by the Frontend forms. It is the next lever if the budget tightens. The Architect has already lazy-loaded it on `perf/first-load-js` (5fa3b90), alongside a React Bits code-split (e63b531); neither is merged into `feature/foundation` yet, so neither is counted here.

## Per-route runs (375 / 768 / 1280 / 1440 / 1920)

Static budget (gzip-9 sum of the route's first-load chunks):

| Route | First-load JS (gzip-9 sum of route chunks) KB | three in first load | rive in first load |
|---|---|---|---|
| `/` | 191.4 | False | False |
| `/services` | 151.1 | False | False |
| `/faq` | 147.5 | False | False |
| `/shop` | 148.8 | False | False |
| `/instant-quote` | 172.6 | False | False |
| `/motion-lab` | 156.4 | False | False |

| Route | Viewport | LCP ms | LCP element | CLS | Long tasks | TBT ms | INP proxy ms | JS first-load KB | JS total KB | Heavy before DCL | 3D chunk fetched | Hero 3D |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 375x812 | 124 | `img[data-testid=hero-poster]` | 0 | 1 | 2 | 24 | 202.4 | 302.9 | none | no | off:software-gl |
| `/` | 768x1024 | 80 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 16 | 202.4 | 318 | none | no | off:software-gl |
| `/` | 1280x800 | 76 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 24 | 202.4 | 322.2 | none | no | off:software-gl |
| `/` | 1440x900 | 120 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 24 | 202.4 | 322.2 | none | no | off:software-gl |
| `/` | 1920x1080 | 104 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 24 | 202.4 | 322.2 | none | no | off:software-gl |
| `/services` | 375x812 | 192 | `p` | 0 | 0 | 0 | 16 | 160.2 | 307 | none | no | – |
| `/services` | 768x1024 | 176 | `p` | 0 | 0 | 0 | 16 | 160.2 | 318 | none | no | – |
| `/services` | 1280x800 | 176 | `p` | 0 | 0 | 0 | 16 | 160.2 | 322.2 | none | no | – |
| `/services` | 1440x900 | 172 | `p` | 0 | 0 | 0 | 24 | 160.2 | 322.2 | none | no | – |
| `/services` | 1920x1080 | 204 | `p` | 0 | 0 | 0 | 24 | 160.2 | 322.2 | none | no | – |
| `/faq` | 375x812 | 52 | `a` | 0 | 0 | 0 | 16 | 156 | 308.3 | none | no | – |
| `/faq` | 768x1024 | 52 | `span` | 0 | 0 | 0 | 16 | 156 | 311.8 | none | no | – |
| `/faq` | 1280x800 | 56 | `span` | 0 | 0 | 0 | 24 | 156 | 319.5 | none | no | – |
| `/faq` | 1440x900 | 48 | `span` | 0 | 0 | 0 | 24 | 156 | 319.5 | none | no | – |
| `/faq` | 1920x1080 | 56 | `span` | 0 | 0 | 0 | 24 | 156 | 319.5 | none | no | – |
| `/shop` | 375x812 | 48 | `div` | 0 | 0 | 0 | 0 | 157.3 | 307.4 | none | no | – |
| `/shop` | 768x1024 | 232 | `img` | 0 | 0 | 0 | 0 | 157.3 | 314.4 | none | no | – |
| `/shop` | 1280x800 | 140 | `img` | 0 | 0 | 0 | 0 | 157.3 | 324.8 | none | no | – |
| `/shop` | 1440x900 | 136 | `img` | 0 | 0 | 0 | 0 | 157.3 | 324.8 | none | no | – |
| `/shop` | 1920x1080 | 656 | `img` | 0 | 2 | 31 | 0 | 157.3 | 324.8 | none | no | – |
| `/instant-quote` | 375x812 | 176 | `p` | 0 | 2 | 48 | 0 | 181.7 | 308.3 | none | no | – |
| `/instant-quote` | 768x1024 | 168 | `p` | 0 | 2 | 18 | 0 | 181.7 | 311.8 | none | no | – |
| `/instant-quote` | 1280x800 | 108 | `p` | 0 | 1 | 1 | 0 | 181.7 | 322.2 | none | no | – |
| `/instant-quote` | 1440x900 | 48 | `p` | 0 | 0 | 0 | 0 | 181.7 | 322.2 | none | no | – |
| `/instant-quote` | 1920x1080 | 64 | `p` | 0 | 0 | 0 | 0 | 181.7 | 322.2 | none | no | – |
| `/motion-lab` | 375x812 | 100 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 16 | 165.5 | 262.3 | none | no | off:software-gl |
| `/motion-lab` | 768x1024 | 124 | `img[data-testid=hero-poster]` | 0 | 2 | 34 | 32 | 165.5 | 265.8 | none | no | off:software-gl |
| `/motion-lab` | 1280x800 | 84 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 32 | 165.5 | 265.8 | none | no | off:software-gl |
| `/motion-lab` | 1440x900 | 84 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 56 | 165.5 | 265.8 | none | no | off:software-gl |
| `/motion-lab` | 1920x1080 | 136 | `img[data-testid=hero-poster]` | 0 | 0 | 0 | 56 | 165.5 | 265.8 | none | no | off:software-gl |
| `/?force3d=1` | 375x812 | 104 | `img[data-testid=hero-poster]` | 0 | 50 | 30850 | 24 | 202.4 | 574.7 | none | yes | pending |
| `/?force3d=1` | 1440x900 | 168 | `img[data-testid=hero-poster]` | 0 | 29 | 23406 | 72 | 202.4 | 594.1 | none | yes | pending |

Legend:
- LCP = largest-contentful-paint (buffered).
- CLS = layout-shift sum without recent input.
- Long tasks = PerformanceObserver `longtask` count from navigation to load + 4 s.
- TBT = sum of (task − 50 ms).
- INP proxy = the longest event-to-next-paint over a scripted tap/click + key press (Event Timing).
- Heavy before DCL = any three/rive/wasm/.riv/.glb request before DOMContentLoaded.

## Findings

- **The hero poster is the LCP element** on `/` and `/motion-lab` at every width (`img[data-testid=hero-poster]`, 76–200 ms locally). CLS is **0** everywhere; the poster box has fixed aspect and width/height.
- **No heavy request before DCL** on any route or viewport. The 3D chunk is requested only after `load` → `requestIdleCallback` → IntersectionObserver.
- **Software GL gate (new).** In the first run, headless Chromium's SwiftShader passed `failIfMajorPerformanceCaveat`. The scene mounted, and the MeshTransmissionMaterial shader compile showed up as 1.8–2.7 s main-thread tasks (TBT 4–6 s). The FPS ladder then dropped it to the poster (`off:low-fps:2.5–5`).
  - Fix: `decide3D()` now also reads `WEBGL_debug_renderer_info` and returns `off:software-gl` for SwiftShader / llvmpipe / softpipe / "Basic Render".
  - Result: on `/`, TBT went from 4.4–6.1 s to **0–2 ms** and long tasks from 12–15 to **0–1**. Total JS fetched went from ~594 KB to ~322 KB because the 3D chunk is never fetched.
  - Real users on software rendering (blocklisted GPUs, VMs) get the same protection.
- **`?force3d=1` (QA override):** the 3D chunk loads and the scene runs on SwiftShader. Expect multi-second long tasks there (shader compile plus CPU rasterising the transmission pass). This is a **SwiftShader artefact**, not a production number.
- The INP proxy is ≤ 72 ms everywhere, under the 200 ms "good" threshold.

## Caveats (read before quoting numbers)

1. **SwiftShader / headless.** There is no GPU, so any WebGL cost is CPU-emulated and wildly pessimistic. Real-GPU hero numbers need a headed run on hardware, e.g. Lighthouse on a mid-range Android plus a desktop with a GPU. On a real GPU the MTM tier starts at 2/4 samples, 128/256 px, and steps down to `lite` below 45 fps and to the poster below 30 fps.
2. **Localhost with no throttling.** LCP is in tens to hundreds of ms because there is no network. Use the relative ordering (poster is LCP, no CLS, nothing heavy pre-DCL), not the absolute values. Field LCP must come from CrUX/RUM after staging.
3. **INP proxy** comes from synthetic interactions, so it is not field INP.
4. **Bundle figures** are from `feature/foundation` at the time of the run. Other lanes (CMS, FE forms, SEO JSON-LD) keep changing first load. Re-run `scripts/motion-perf.mjs` after merges.

## Follow-ups re-run (2026-10-27, `motion/followups` on `feature/foundation`)
These are isolated production builds (`NEXT_PUBLIC_SITE_ENV=production`, `next build` + `next start`). **Before** = e774b82 (perf/first-load-js merged). **After** = e774b82 + this follow-up work. Raw data: `perf-results-followups-before.json` / `perf-results-followups.json`.

| Route | Next table first load (before → after) | gz-9 sum (before → after) | CLS | heavy pre-DCL | 3D / Rive in first load |
|---|---|---|---|---|---|
| `/` | 144 kB → **144 kB** | 154.5 → 154.8 KB | 0 → 0 | none | no |
| `/instant-quote` | 142 kB → **142 kB** | 150.1 → 150.4 KB | 0 → 0 | none | no |

- The +0.3 KB gz is shared on both routes. It comes from the new tokens (`STEPS_MQ`, the step durations) and the direction-aware MultiStepForm variants.
- `Drawer` and `CountUp` add nothing to any site route, because no site page imports them yet. `/motion-lab/drawer` is 134 kB.
- The How It Works rewrite lives in the async engine chunk (`bindings.ts`).
- TBT on `/`: 0–15 ms at every viewport.

**How It Works pin.** ≥1280 pins (pin distance measured at 2.50 × vh). Below that it's a stack: 375 / 768 / 1024 / 1279 → `data-steps-mode="stack"`, no `.pin-spacer`. Each card reveal is a single `ScrollTrigger.batch`, with no pin-spacer reflow on mobile or tablet (cheaper than the old mobile card-stack pin). Screenshots: `docs/motion/screens/how-it-works-{375,768,1024,1279,1280,1440}-staging.png`, `-1440-step2-`, `-768-reduced-`, `-1440-reduced-`.

## Frontend-route wiring pass (2026-10-27, on top of `2647e1d`)

Production builds (`NEXT_PUBLIC_SITE_ENV=production`, isolated `/tmp` copies, same box, back-to-back). Raw: `perf-results-routes-before.json` / `perf-results-routes.json`; hook/reduced-motion/CLS matrix: `routes-check-staging.json` (`node scripts/motion-routes-check.mjs <base> <out>`).

| Route | Next "First Load JS" before → after | gz-9 first-load before → after | CLS 375/768/1280/1440 |
|---|---|---|---|
| / | 144 → 144 kB | 155.4 → 155.5 KB | 0 / 0 / 0 / 0 |
| /instant-quote, /sell-your-device | 142 → 142 kB | 150.4 → 150.6 KB | 0 |
| /services | 137 → 137 kB | 148.0 → 148.1 KB | 0 |
| /policies/[slug] | 107 → 107 kB | 142.2 → 142.4 KB | 0 |
| /shop | 144 → 144 kB | 147.8 → 148.0 KB | 0 |
| /faq | 124 → 124 kB | 144.3 → 144.4 KB | 0 |
| /schedule-repair | 120 → 120 kB | 146.9 → 147.0 KB | 0 |
| /home-internet | 135 → 135 kB | 146.2 → 146.4 KB | 0 |

The +0.1–0.2 KB gz is the same on every route (including /motion-lab), i.e. the shared tokens object (`DUR.drawer`, `fadeReduced`, `tocColor`, `tocBar`, `countUp`). Scroll-spy and the countup binder live in the existing async engine chunk (no new chunk, no new request); shimmer and TOC transitions are CSS. TBT stayed 0–11 ms on every route at 375–1440 (before-run 0–119 ms, noise).

## QA run 1 follow-up (2026-10-27, on `feature/foundation` `e7d4e64`)

Profiler: `scripts/motion-anim-profile.mjs` = the same drivers as `qa/scripts/anim-profile.ts` (desktop 1440×900 wheel 120 / 50ms; Pixel 7 + 4× CPU throttle, scrollBy 18 / rAF; 6s), repeatable, path-selectable, optional CPU profile; writes nothing into `qa/`. Local production builds, headless Chromium (software GL).

| Build | Desktop avg fps (3 runs) | Desktop blocking | Mobile avg fps (3 runs) | Mobile blocking |
|---|---|---|---|---|
| `e53843d` (QA run 1 source) | 34.1 / 15.3 / 15.3 | 4.1–4.2 s, 9–11 long tasks, max ~2 s | 22.6 / 56.4 / 34.5 | 0.3–4.6 s |
| `e53843d` `?no3d=1` | 60 / 60 | 0 | 60 / 60 | 0 |
| `e7d4e64` (before this commit) | 60 / 60 / 60 | 0 | 59.8–60 | 0 |
| this commit | 60 / 60 / 60 | 0 | 60 / 60 / 60 | 0 |

Cause (CPU profile on `e53843d`): ~3.9 s of `(program)` time in the three.js hero chunk (`r.render`, `makeRotationFromEuler`, `loseContext`). The R3F hero was rendering on SwiftShader (software GL) in headless Chrome, every frame, while scrolling. `?no3d=1` (poster only) gives 60 fps on the same build. Already fixed in `cd44625` (software-GL gate in `components/3d/capabilities.ts`: SwiftShader/llvmpipe → poster) which landed after `e53843d`. No scroll-handler, SplitText re-split, ScrollTrigger-refresh or Lenis/Framer cost showed up. Real-GPU frame rate for the 3D hero still needs a device check (QA's own caveat).

D1 (How It Works stuck hidden at 375): QA's `motion.spec.ts` "scroll-triggered animations reveal content" passes 20/20 for `/` and `/financing` at 375 and 768 on chromium, firefox, webkit, mobile-chrome and mobile-safari, both on `e7d4e64` (fixed by `06c2434`) and with this commit. An extra jump-past + resize-across-1280 check shows 0 of 4 cards hidden. `/financing` markup no longer carries the steps hook (static list). The failsafe is defence in depth.

Axe (QA `axe.spec.ts`, chromium, 375 + 1440, all 14 routes): `color-contrast` on `/` (ValueProps) fixed. The remaining serious finding is `target-size` on the TOC links of `/services` and `/policies/*` at 1440 (inline `<a>` 19.6px tall). That is Frontend markup and was also present before; fix: make `[data-toc-link]` `block` (py-1.5 then gives ~32px).

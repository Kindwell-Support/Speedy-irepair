# lib/motion

| File | Role |
|---|---|
| `tokens.ts` | Durations, staggers, GSAP + Framer eases, reveal distance, media queries. |
| `boot-script.tsx` | `<MotionBootScript/>` (in `<head>`). Sets `html[data-motion]` to ok, reduce or fallback before first paint. |
| `motion.css` | Before-states (gated on `data-motion="ok"`), the mobile How It Works card-stack layout, accordion containment and the reduced-motion kill switch. Imported by `styles/globals.css`. |
| `engine.ts` | `loadMotionEngine()` / `motionEngine()`. Memoised async import of `engine-impl.ts`. |
| `engine-impl.ts` | The async chunk: gsap, ScrollTrigger, SplitText, Lenis, bindings. |
| `gsap.ts` | Single registration point (`registerGsap`). Import it only through the engine. |
| `lenis-gsap.ts` | `LENIS_DEFAULTS` + `createLenisGsap()` (see `docs/motion/LENIS_SCROLLTRIGGER.md`). |
| `bindings.ts` | `bindAnimations(root)`: reveal, stagger, parallax, split, steps (pin), faq inside `gsap.matchMedia`. Selectors are in `SEL`. |
| `reduced-motion.ts` | `prefersReducedMotion`, `useReducedMotion`, `isLowPowerDevice`, `useFinePointer`. |

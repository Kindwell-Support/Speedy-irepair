# lib/motion

| File | Role |
|---|---|
| `tokens.ts` | Durations, staggers, GSAP + Framer eases, reveal distance, media queries. |
| `boot-script.tsx` | `<MotionBootScript/>` (in `<head>`). Sets `html[data-motion]` to ok, reduce or fallback before first paint. |
| `motion.css` | Before-states (gated on `data-motion="ok"`), the How It Works <1280 before-state, LogoLoop classes (`.logoloop`, `.logoloop-fade-x|y`), the Drawer scroll lock, the `data-animate="shimmer"` sweep, toc-spy transitions + indicator, accordion containment and the reduced-motion kill switch. Imported by `styles/globals.css`. |
| `engine.ts` | `loadMotionEngine()` / `motionEngine()`. Memoised async import of `engine-impl.ts`. |
| `engine-impl.ts` | The async chunk: gsap, ScrollTrigger, SplitText, Lenis, bindings, scroll-spy. |
| `gsap.ts` | Single registration point (`registerGsap`). Import it only through the engine. |
| `lenis-gsap.ts` | `LENIS_DEFAULTS` + `createLenisGsap()` (see `docs/motion/LENIS_SCROLLTRIGGER.md`). |
| `bindings.ts` | `bindAnimations(root)`: reveal, stagger, parallax, split, steps (pin ≥1280 / stacked reveal below, breakpoint `STEPS_PIN_MIN_PX` in `tokens.ts`), faq, countup inside `gsap.matchMedia`. Selectors are in `SEL` (aliases `data-scroll-trigger` → reveal, `data-stagger-group` → stagger). |
| `scroll-spy.ts` | `bindScrollSpy(root)`: `aria-current` on `a[data-toc-link]` + sliding `[data-toc-indicator]` in `[data-animate="toc-spy"]`. No GSAP; bound under reduced motion too (state, not motion). |
| `reduced-motion.ts` | `prefersReducedMotion`, `useReducedMotion`, `isLowPowerDevice`, `useFinePointer`. |

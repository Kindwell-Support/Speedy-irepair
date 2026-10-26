# components/motion

Motion primitives, owned by the Motion & 3D lane. The contract is in `docs/motion/HOOKS.md`; timing is in `docs/motion/ANIMATION_MAP.md`.
Rules:
- Import animation libraries only inside `components/motion|3d|rive` and `lib/motion` (ESLint enforces this).
- Use `m.*` (never `motion.*`) so Framer stays lazy.
- Never inline `style` except `cssVars()`.

| Component | Use | Props (main) | Reduced motion |
|---|---|---|---|
| `MotionProvider` | Root (via `components/layout/MotionShell`) | children | Provides `LazyMotion` (domMax, async) + `MotionConfig reducedMotion="user"` + Lenis + cursor follower |
| `LenisProvider`, `useLenis()`, `scrollToTarget()` | Smooth scroll, loaded from the async engine. `window.__QA__` outside production | `lerp`, `duration`, `options` | Not created |
| `PageTransition` | Wraps page content. Binds `data-animate` hooks per route (`useDataAnimate`) | children | Opacity only, 0 s |
| `useDataAnimate(ref, key)` | Bind GSAP hooks inside a subtree (async engine) | n/a | Binds nothing |
| `hooks.tsx`: `Reveal`, `Stagger`, `Parallax`, `SplitHeading` | Sugar that renders the `data-animate` attributes | `as`, `delay`, `trigger` … | n/a |
| `Accordion` | FAQ. `engine="framer"` (home) or `"gsap"` (/faq). Answers stay in the DOM, collapsed panels are `inert` | `items`, `engine`, `multiple`, `defaultOpen`, class props, `headingLevel` | Instant |
| `HoverCard` | Lift + glow card wrapper (wrap inside a `data-stagger` child, not on it) | `href`, `lift`, `ariaLabel` | Colour only |
| `MagneticButton` | React Bits Magnet around a CTA | `strength`, `padding` | Pass-through |
| `ScrambleText` | React Bits DecryptedText on hover | `text` | Plain text |
| `BrandMarquee` / `BrandLogo` | React Bits LogoLoop + monochrome → colour logo | `brands`, `speed`, `logoHeight`, `gap` | Static list |
| `ValueProps` | Framer layoutId highlight list | `items`, class props | Highlight jumps |
| `ShopGrid` | Layout + presence filter grid | `items`, `getKey`, `render`, filters | Instant |
| `MultiStepForm` + `useMultiStep` | Step slider for lead-capture forms (no prices) | `steps`, `index`, `direction`, `label`, `footer` | Instant |
| `CursorFollower` | Desktop fine-pointer follower (red on targets) | n/a | Not rendered |
| `framer-features.ts` | The domMax bundle for LazyMotion (async) | n/a | n/a |
| `reactbits/` | Vendored React Bits (MIT, see LICENSE.md), used as-is apart from `motion.` → `m.` in DecryptedText | n/a | n/a |

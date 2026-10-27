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
| `MultiStepForm` + `useMultiStep` | Step slider for lead-capture forms (no prices). Out 24px/160ms, in from the opposite side 240ms, bar scaleX | `steps`, `index`, `direction`, `label`, `footer`, `header`, `progressTestId`, `titleClassName` | Instant |
| `Drawer` | Right-side modal sheet (cart). Slide + scrim 320ms (`DUR.drawer`, design) power-out in / in-out out, focus trap, Escape, inert background, Lenis stop. Demo `/motion-lab/drawer` | `open`, `onClose`, `title`/`ariaLabel`, `footer`, `initialFocusRef`, `closeLabel`, `widthClassName`, `className`, `testId` (see HOOKS.md) | 150ms fade |
| `CountUp` | Number counts 0→value once on enter (rAF, tabular-nums); SSR renders the final value | `value`, `from`, `duration`, `decimals`, `prefix`, `suffix`, `ariaLabel`, `threshold` | Final value |
| `CursorFollower` | Desktop fine-pointer follower (red on targets) | n/a | Not rendered |
| `framer-features.ts` | The domMax bundle for LazyMotion (async) | n/a | n/a |
| `reactbits/` | Vendored React Bits (MIT, see LICENSE.md), used as-is apart from `motion.` → `m.` in DecryptedText | n/a | n/a |


## Drawer: usage (for the Frontend cart drawer)
`import { Drawer } from "@/components/motion/Drawer";`, file `components/motion/Drawer.tsx`. The full props table is in `docs/motion/HOOKS.md`; there's a live demo at `/motion-lab/drawer` (non-production builds).

```tsx
"use client";
const [open, setOpen] = useState(false);
const checkoutRef = useRef<HTMLButtonElement>(null);

<button type="button" onClick={() => setOpen(true)}>Add to cart</button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Your cart"                 // visible <h2> = accessible name (or ariaLabel="…" with title omitted)
  testId="cart-drawer"
  initialFocusRef={checkoutRef}     // optional; defaults to the first focusable element
  footer={<button ref={checkoutRef} type="button">Checkout</button>}
  // closeLabel="Close" (null hides it) · widthClassName="w-full max-w-[420px]" · className="…" · id
>
  {/* line items: the body scrolls (data-lenis-prevent) */}
</Drawer>
```

- The Drawer portals to `body` and sets `role="dialog"` + `aria-modal`. Escape and a scrim click both call `onClose`. Tab is trapped. Every other body child is `inert`. Focus returns to the opener. Lenis is stopped and the page scroll is locked.
- Motion: slide from the right + scrim fade, 320ms (`DUR.drawer`, per design shop-product: "slides in from the right, 320ms") power-out in, power-in-out out. Reduced motion uses a 150ms fade (`DUR.fadeReduced`), no slide.
- The Frontend owns `open` state, the content and the styles inside the panel.

## CountUp: usage
`<CountUp value={40} prefix="$" />` (`/home-internet`) or `<CountUp value={45} duration={0.48} />` (home Why stats).
- `WhyStat.tsx` receives `value` as a CMS string, e.g. "45". Parse it, and render `CountUp` only when it is purely numeric; otherwise keep the string.
- SSR renders the final value.

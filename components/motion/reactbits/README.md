# React Bits (vendored; small documented local patches)

Source: https://reactbits.dev — installed with the official CLI on 2026-10-27:

```
npx shadcn@latest add @react-bits/Magnet-TS-TW @react-bits/TargetCursor-TS-TW \
  @react-bits/LogoLoop-TS-TW @react-bits/DecryptedText-TS-TW
```

(registry `@react-bits` -> `https://reactbits.dev/r/{name}.json`, see `components.json`).

| File | React Bits component | Used for (spec A7 / M8) | Our wrapper |
|---|---|---|---|
| `Magnet.tsx` | Magnet | Magnetic hero CTAs "Schedule Repair", "Get Instant Quote" | `../MagneticButton.tsx` |
| `TargetCursor.tsx` | TargetCursor | Cursor follower (desktop, fine pointer only) | `../CursorFollower.tsx` |
| `LogoLoop.tsx` | LogoLoop | Infinite brand marquee (Apple, Samsung, LG, Google Pixel, Motorola, OnePlus) | `../BrandMarquee.tsx` |
| `DecryptedText.tsx` | DecryptedText (`animateOn="hover"`) | Text scramble on hover for nav items / section labels | `../ScrambleText.tsx` |

Rules:
- Files are kept **as-is** (do not edit; re-run the CLI to update). Lint rules relaxed for this folder only.
  **Exception, `LogoLoop.tsx` (2026-10-27, DESIGN_VALIDATION "inline styles"):** the root's inline
  `style` (width, gap, logo height, edge-fade mask) became classes and CSS custom properties:
  `.logoloop` / `.logoloop-fade-x|y` in `lib/motion/motion.css`, and `w-full` / `w-[var(--logoloop-width)]`.
  Only props that differ from the defaults are passed, through `cssVars()`. The defaults are gap 64 and
  logoHeight 32 (BrandMarquee's values; upstream is 32/28), so the site renders with **no style attribute**.
  The `style` prop was removed. Per-item `hoverColor` uses `cssVars`. The edge fade is the same
  12-stop smootherstep mask, parameterised by `--logoloop-fade`. The engine's imperative runtime
  writes (`--logoloop-pad`, track transform, tilt perspective) are unchanged. So are behaviour and the
  reduced-motion pause. Re-apply this patch if the CLI is re-run.
  **Exception, `TargetCursor.tsx`:** one attribute, `data-cursor-follower=""` on the portal root. QA's visual spec hides `[data-cursor-follower]`.
- All reduced-motion / pointer gating lives in our wrappers, not here.
- `DecryptedText` imports `motion/react`; we pin `motion@14.6.0` (same version as `framer-motion`) so
  it resolves to the same framer-motion build — no duplicate animation runtime in the bundle.
  NOTE: the CLI tried to add `motion@^12` — keep it pinned to the framer-motion version.

## License

MIT + Commons Clause (see `LICENSE.md`, copied from github.com/DavidHDev/react-bits).
Use in an application/website (including commercial) is allowed; selling/redistributing the
components themselves is not. Our use (client website) is permitted. Keep this notice.

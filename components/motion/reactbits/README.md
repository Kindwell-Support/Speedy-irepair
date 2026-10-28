# React Bits (vendored, unmodified)

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
| `CircularGallery.tsx` | CircularGallery (TS + Tailwind, pure WebGL2, no deps) — pasted from reactbits.dev on 2026-10-28 | Home "Our services" carousel | `../ServicesCarousel.tsx` |

Rules:
- Files are kept **as-is** (do not edit; re-run the CLI to update). Lint rules relaxed for this folder only.
- All reduced-motion / pointer gating lives in our wrappers, not here.
- One local patch: `CircularGallery.tsx` cleanup no longer calls `loseContext()` (marked `[local patch]`).
  With it, React Strict Mode's remount reused the dead WebGL context and the gallery rendered blank.
- `DecryptedText` imports `motion/react`; we pin `motion@14.6.0` (same version as `framer-motion`) so
  it resolves to the same framer-motion build — no duplicate animation runtime in the bundle.
  NOTE: the CLI tried to add `motion@^12` — keep it pinned to the framer-motion version.

## License

MIT + Commons Clause (see `LICENSE.md`, copied from github.com/DavidHDev/react-bits).
Use in an application/website (including commercial) is allowed; selling/redistributing the
components themselves is not. Our use (client website) is permitted. Keep this notice.

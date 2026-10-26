# components/3d

| File | Role |
|---|---|
| `HeroDevice.tsx` | Server-renderable poster `<picture>` (AVIF/WebP/PNG, `fetchPriority="high"`, `data-testid="hero-poster"`, 960×1200 aspect box, so CLS is 0). Mounts the R3F scene through `next/dynamic` + `Suspense` only after `load` → idle → IntersectionObserver, then cross-fades once the first frame renders. Pauses offscreen and when the tab is hidden. Attributes: `data-3d="pending\|off:<reason>"`, `data-phase`. Props: `poster?` (defaults to `/hero/phone-poster.*`), `alt`, `className`. |
| `PhoneScene.tsx` | Procedural phone. No external assets or CDN: Lightformer environment, CanvasTexture screen, ~3k triangles. The glass back uses **drei MeshTransmissionMaterial** with `transmissionSampler`, 2/4 samples, 128/256 resolution and no backside pass. FPS ladder: below 45 fps it switches to lite (physical material); below 30 fps it degrades to the poster. dpr is [1,1.25] on mobile and [1,1.75] on desktop. |
| `screenTexture.ts` | Draws the "45 MIN" ring + "Screen repair / 90-day warranty" screen on a 2D canvas. |
| `capabilities.ts` | `decide3D()`. Poster only for `?no3d=1`, reduced motion, Save-Data / prefers-reduced-data (never overridable), low power (≤2 cores or ≤2 GB), or no hardware WebGL (`failIfMajorPerformanceCaveat`). `?force3d=1` is the QA override. |
| `SplineScene.tsx` | Architect's lazy Spline wrapper (poster first, IO + reduced-motion/Save-Data gated). Not used in the hero. |

Poster pipeline: `next build && next start -p 3100`, then `node scripts/render-hero-poster.mjs`, then `python3 scripts/encode-hero-poster.py`. This renders `/motion-lab/poster` (the same scene in its static pose), so the poster and the live scene match at hand-off.

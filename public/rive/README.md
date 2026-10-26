# public/rive — Rive asset drop (owned by Motion & 3D lane)

- One `.riv` per icon/button/loader, kebab-case, matching an id in `components/rive/manifest.ts`
  (e.g. `screen-repair.riv`). `available.generated.ts` lists what is actually present; anything
  missing falls back to the static SVG icon in `components/rive/icons.tsx` (never a broken canvas).
- State machine name: `State Machine 1` unless the manifest says otherwise. Inputs: `hover` (bool),
  `press` (trigger). Reduced motion: the first frame is rendered static, and no state machine runs.
- Keep each file < 60 kB. `rive.wasm` is self-hosted here so no third-party CDN fetch happens at runtime.
- Sanity references icons by id only (`riveIcon.id`, CMS contract §1.5), never by file URL.

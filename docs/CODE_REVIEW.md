# CODE_REVIEW: rules and PR checklist

These are enforced by `eslint.config.mjs` (`pnpm lint --max-warnings 0` in CI), `tsc` and Playwright.

## Rules (ESLint-enforced)
1. **Images:** `next/image` only (`@next/next/no-img-element`). Every image needs `alt` (jsx-a11y via `next/core-web-vitals`). Decorative images use `alt=""`. External links use `rel="noopener noreferrer"` (`react/jsx-no-target-blank`).
2. **Links:** internal links use `next/link` (`@next/next/no-html-link-for-pages`).
3. **No inline `style`** (`no-restricted-syntax`). The only exception is `style={cssVars({...})}` from `lib/utils/css-vars.ts`, which sets custom properties. Motion dirs are exempt, for transform/opacity state. **No `fetch` inside `useEffect`** (same rule, applies everywhere).
4. **Animation libraries** (`gsap`, `@gsap/*`, `framer-motion`, `motion`, `lenis`, `@rive-app/*`, `@splinetool/*`, `three`, `@react-three/*`) are importable only in `components/motion|3d|rive/**` and `lib/motion/**`. Sections animate through `data-animate` (docs/CONTRACT_MOTION.md). Also: no `any` and `consistent-type-imports`.
5. **GROQ** (`groq` / `defineQuery`) only in `lib/sanity/**` and `sanity/**`. That covers the vendored schemas and the SEO adapter.
6. **Boundaries.**
   - `components/**` must not runtime-import `@/lib/sanity/*` (except `types`/`image`), `@/lib/shop` adapters (except `types`/`config`), `@/lib/env.server`, `@/lib/forms/{submit,spam}` or anything in `@/app/*`. `import type` is allowed.
   - `lib/**` must not import `app` or `components`.

## Reviewer checklist
- [ ] `pnpm lint && pnpm typecheck && pnpm build`, with no new First Load regressions:
  - home ≤ 180 kB (budget 200)
  - other routes ≤ 160 kB
  - shared ≤ 110 kB
- [ ] `pnpm test:e2e` (smoke + axe + contract at 5 viewports) is green.
- [ ] One `<h1>` per page. JSON-LD comes from `lib/seo/*` builders. Metadata comes from `pageMetadata`/`buildMetadata`.
- [ ] **No invented facts:** no year, hours, prices, review text/counts, ratings, team names or claims that don't trace to Sanity or the client brief. Gaps use Sanity fields plus `PlaceholderMark`.
- [ ] No data fetching in `useEffect`. Server Components fetch; client components get props.
- [ ] Every interactive element has a keyboard path, a visible focus state and a 44px target (`h-control-md`).
- [ ] Respects reduced motion: `prefers-reduced-motion` and the `data-motion="reduced"` root attribute. Pinned or 3D effects have static fallbacks.
- [ ] Forms: shared zod schema, honeypot plus min-time, the full `FormResponse` state set, `aria-live` and `aria-invalid`, and no prices.
- [ ] Embeds go through `EmbedFacade` (skeleton / loaded / fallback). No third-party script on first paint.
- [ ] Tokens only (DESIGN_TOKENS.md). No raw hex. Contrast is ≥ 4.5:1 for text.
- [ ] Noindex is preserved: don't touch `X-Robots-Tag`, robots or `buildMetadata` gating without the SEO lead.
- [ ] Schema changes go to `cms/` first, then `pnpm sync:cms`. Never edit `web/sanity/schemaTypes` by hand.
- [ ] Commits are scoped to your lane's paths. Conventional commit messages.

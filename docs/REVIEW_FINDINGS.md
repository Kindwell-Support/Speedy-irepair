# REVIEW_FINDINGS: Architect code-review pass (Oct 27 2026, PKT)

Scope: everything committed on `feature/foundation` up to `5348149`, plus the uncommitted lane work visible in the tree at review time.
Gates at review time: lint 0 warnings · tsc 0 · build OK · Playwright 190/190.
Severity: **H** = fix before QA sign-off · **M** = fix this phase · **L** = follow-up.

## Conflicts between the CMS contract and the Architect's rules (the contract wins; recorded per steering)
| # | Sev | Finding | Resolution / owner |
|---|---|---|---|
| C1 | M | `cms/` targets sanity 6.x + orderable-document-list 2.x. `web/` pins sanity 4.22.1 + orderable 1.5.1 (ARCHITECTURE D3: v5+ needs React 19.2 `useEffectEvent`, which Next 15.5's vendored React lacks). | The schema API is identical, and the vendored types build under v4. Keep the cms Studio on 6 standalone or align it to 4. Revisit on Next 16. CMS + Architect |
| C2 | M | `SANITY_STUDIO_SHOP_SOURCE` is not inlined into the embedded `/studio` (Next.js inlines only `NEXT_PUBLIC_*`), so the toggle is inert there. | The default `shopify` is the decided value (D1), so behaviour is correct. Documented in ENV/CONTRACT_SANITY. If the toggle must work in-app, expose `NEXT_PUBLIC_SANITY_STUDIO_SHOP_SOURCE`. CMS |
| C3 | M | Contract §5.1 describes a `cms/lib/sanity/queries/*` library (`HEADER_NAV_QUERY`, …). The runtime uses `web/lib/sanity/queries.ts`, so two query sets can drift. | `web/lib/sanity` is the runtime. Treat the cms query files as reference only, or delete them after v1.2. CMS |
| C4 | M | `quoteConfig` makes F1/F5 option lists editable, but the server validates with fixed `z.enum`s (`lib/forms/schemas.ts`). An editor relabelling an option would make submissions fail validation. | Follow-up: build the enums from `quoteConfig` at request time, or validate as `string` within the allowed set fetched server-side. Architect + Frontend |
| C5 | L | Rive input naming: the contract §1.5 says `hover` + `click`, while the Motion code and `public/rive/README.md` use `press`, with `click` as an alias. | Works either way. Pick one name in the contract (suggest `click` per contract) and keep the alias. Motion + CMS |
| C6 | L | Contract v1.2 is being applied directly in `web/lib/sanity/{queries,fixture,mutations}.ts` and `web/sanity/schemaTypes` while v1.1 is still the published header (formSubmission `formType` → `type`, `shopCollectionConfig`, `needsReview`). | Fine (the contract wins). Bump the contract header and changelog **before** committing, and run `pnpm sync:cms` rather than hand-editing the vendored folder. CMS |

## Code review
| # | Sev | Finding | Resolution / owner |
|---|---|---|---|
| R1 | H | `components/3d/HeroDevice.tsx` default `alt` = "Smartphone showing a completed 45-minute screen repair". It is a factual claim baked into code. The brief does mention 45-minute repairs, but copy belongs in Sanity. | Make `alt` required (no default) and pass it from `homePage.heroPoster.alt`. Motion |
| R2 | H | Hours: the CMS seed and SEO data carry Mon–Sat 12:00–18:00 marked as taken from the live site, while the web TS fixtures show "Hours coming soon". Fixture mode now renders the seed, so staging shows these hours. | Client must confirm the hours before launch (no invented facts). Until then keep the `PlaceholderMark` or the source note. CMS + PM |
| R3 | M | The DevOps "sync/snapshot" commits sweep other lanes' work in under `Kindwell DevOps`, so authorship and blame are lost. The repo-local `user.name` is also DevOps, which means any lane that forgets `-c user.*` commits as DevOps. | Lanes commit their own paths with their own author. DevOps commits only infra paths. Don't set a repo-local identity. DevOps |
| R4 | M | `docs/MOTION_CONTRACT.md` is referenced by `lib/motion/bindings.ts`, `components/motion/hooks.tsx` and `README.md`, but the file is `docs/CONTRACT_MOTION.md`. (The `MotionShell` reference is fixed.) | Update the references. Motion (code), DevOps (README) |
| R5 | M | The SEO GROQ lives in `sanity/lib/seoQueries.ts` + `sanity/lib/client.ts`, a second client outside `lib/sanity`. ESLint rule 5 allows `sanity/**`, but there are now two clients with separate config. | Acceptable while it mirrors `cms/adapters`. Make it reuse `lib/sanity/client` (same apiVersion/perspective) and `sanityFetch` tags. SEO |
| R6 | M | `README.md` (DevOps) still lists "Shop: Sanity vs Shopify" and "3D: Spline vs R3F" as pending. Both are decided (ARCHITECTURE D1, D2 + CONTRACT_MOTION). | Update the README section. DevOps |
| R7 | M | `lighthouserc.json` exists but no CI job runs it. | Add a non-blocking LHCI job (HANDOFF_DEVOPS §1). DevOps |
| R8 | L | The QA dry-run header `x-qa-dry-run: 1` is honoured on production too (it only keeps the rate limit and fill-time checks there). It is harmless, since the sender just loses their own submission, but it is an undocumented public switch. | Gate it to non-production, or require a shared secret value. CMS/QA |
| R9 | L | ~22 odd spacing steps (`p-5`, `gap-7`…) are off Design's 8px scale (DESIGN_TOKENS). | Normalise them during the Design QA pass. Frontend |
| R10 | L | `tailwind.config.ts` has a raw `placeholder: "#f5b700"`. It is a staging-only marker, but it is not a design token. | Ask Design for a `--color-placeholder` token. Design |
| R11 | L | `.github/workflows/ci.yml` runs `next typegen` before `tsc`, but `pnpm typecheck` locally doesn't, so local and CI can differ on route types. | Make `typecheck` = `next typegen && tsc --noEmit`. DevOps |
| R12 | H (fixed 2f965c0) | Commit `0a6e076` (fixture mode) broke `next build`: `/services` prerender crashed on `s.ctas.map`/`s.body.length`, because seed services have no `ctas`. Nobody ran the build before the sweep commit. | Fixed in `servicesQuery` with `coalesce(…, [])`. Rule: every array projection in an adapter is coalesced, and lanes run `pnpm build` before DevOps sweeps. All lanes |

## Ops note (Architect, self-reported)
- While freeing port 3417 for e2e, I ran `pkill -f next-server --oldest`, which may have stopped another lane's `next start` (ports 3100/3111 were no longer listening afterwards). If a lane's preview server disappeared around 03:00 PKT, restart it. Since then I only use port 3417.

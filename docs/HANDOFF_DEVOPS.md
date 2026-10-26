# HANDOFF: Technical Architect → DevOps (ClickUp A3)

The app is at `/workspace/speedy-irepair/web`. It is a local git repo with **no remote**. It has not been deployed and no domain has been touched.
Branches are `main` and `staging` (both at the initial commit) and `feature/foundation` (current). Branch flow, CI and deploy policy are in `README.md` (DevOps-owned) and are not repeated here.

## 1. What is ready
- **Gates:** `pnpm install --frozen-lockfile && pnpm exec next typegen && pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e`. All green locally (Oct 27 2026). Playwright ran 190/190 (smoke + axe WCAG 2.1 AA + llms/JSON-LD contract) at 375/768/1280/1440/1920.
- **First Load JS:** shared 103 kB, home 178 kB, PDP 122 kB. Budgets are in ARCHITECTURE §7.
- **Lighthouse:** `lighthouserc.json` runs `next start -p 3100` over 11 URLs (desktop preset). It asserts perf ≥ 0.90, a11y ≥ 0.95, best-practices ≥ 0.90, LCP ≤ 2.5 s and CLS ≤ 0.1. SEO is warn-only because staging is noindex. Run it with `pnpm build && pnpm lhci`. **Not yet in `ci.yml`.** Suggest a separate non-blocking job (or a Vercel preview check) once a preview URL exists.
- **Runtime:** Node 20 (`.nvmrc`), pnpm 10.34.6 (`packageManager`). Next 15.5 App Router; `/studio` is embedded Sanity Studio 4.22.1.

## 2. Vercel project settings (when auth exists)
| Setting | Value |
|---|---|
| Root directory | `web` |
| Framework / build | Next.js · `pnpm build` · install `pnpm install --frozen-lockfile` |
| Production branch | `main`. Auto-deploy is disabled by `vercel.json`. Do **not** promote. |
| Preview | `staging` + `feature/*` |
| Env (Preview) | everything in `docs/ENV.md` with `NEXT_PUBLIC_SITE_ENV=staging` |
| Env (Production) | leave empty until Abdullah says "deploy" |
| Deployment Protection | optional (Vercel Authentication). If on, QA needs a bypass token for Playwright/LHCI |

Sanity webhook (once the project exists):
- URL: `POST {preview-url}/api/revalidate`
- Secret: `SANITY_REVALIDATE_SECRET`
- Projection: `{_type, "slug": slug.current}`
- CORS origins: localhost:3000 plus the preview URL (for `/studio`)

## 3. Noindex: three independent layers (do not remove any)
1. `next.config.ts` sends `X-Robots-Tag: noindex, nofollow, noarchive` unless production. "Production" means `NEXT_PUBLIC_SITE_ENV=production` and `VERCEL_ENV` is `production` or unset.
2. `app/robots.ts` returns `Disallow: /` unless production.
3. `buildMetadata` adds `robots: noindex,nofollow` unless production.

Check after each preview deploy: `curl -sI <url> | grep -i x-robots-tag` and `curl -s <url>/robots.txt`.

## 4. Blockers (ClickUp tasks created, all unassigned)
| Blocker | Unblocks | Until then |
|---|---|---|
| Vercel auth / project | staging preview URL, env vars, LHCI against the preview | local `next start` only |
| GitHub auth / repo | remote, PRs into `staging`, Actions CI | local git, gates run by hand |
| Shopify Storefront token + store domain | live products, prices, cart and checkout | fixture catalog shows "Price from Shopify"; Add to cart shows a staging notice |
| Sanity project id + Viewer/Editor tokens | live CMS, Presentation preview, stored submissions | fixture mode (seed via groq-js), JSONL submission sink |

Also needed from the client (not DevOps):
- form webhook destination
- Google Maps embed URL
- confirmed hours and founding year
- Square and Jotform URLs (already in the seed as the live-site links)

## 5. Do not
- Deploy to production.
- Change DNS or domains.
- Add `VERCEL_TOKEN` to Actions.
- Set `NEXT_PUBLIC_SITE_ENV=production` on Preview.
- Commit `.env*`.
- Rewrite other lanes' authorship. Commit lane work under the lane's author where possible (see REVIEW_FINDINGS R3).

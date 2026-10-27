# Speedy iRepair — Website Rebuild (`web/`)
ah
Canonical app root for the Speedy iRepair rebuild (Kindwell Solutions).
Spec: `../PROJECT_SPEC.md` · Decisions: `../DECISIONS_2026-10-27.md`.
App architecture, code rules and env contract are owned by the Technical Architect
(see `docs/` — ARCHITECTURE, CODE_REVIEW, ENV, MOTION_CONTRACT as they land).
This README covers **DevOps: branches, pipeline, environments, deploy policy, rollback.**

> **STAGING ONLY.** Nothing is deployed to production and no domain/DNS is touched until
> Abdullah explicitly says "deploy" (spec §8, DECISIONS item 6).

## Stack decisions still pending (Technical Architect)

- **Shop:** Sanity catalog + Shopify checkout **vs** headless Shopify Storefront API (OQ-09).
- **3D hero:** Spline **vs** Three.js/R3F (OQ-20). Both are installed so either can be chosen.

Until the Architect's decision is recorded, keep these behind adapters (`lib/shop`, `components/3d`).

## Requirements

- Node **20** (`.nvmrc`; `package.json` engines) · pnpm (version pinned in `packageManager`)
- `pnpm install` then `pnpm exec playwright install chromium` for e2e.

## Branches

| Branch | Purpose | Deploys |
|---|---|---|
| `main` | Production. Only receives merges from `staging` after full sign-off. | **Never automatically.** `vercel.json` sets `git.deploymentEnabled.main = false`. Production is promoted **manually**. |
| `staging` | Integration / staging. | Vercel Git integration → **Preview** deployment = the staging URL. |
| `feature/*` | Work branches (e.g. `feature/foundation`). PR into `staging`. | Vercel Preview per push/PR. |

## Quality gates (local and CI)

```bash
pnpm install --frozen-lockfile
pnpm exec next typegen && pnpm exec tsc --noEmit   # typecheck
pnpm exec eslint . --max-warnings 0                # lint, zero warnings
pnpm exec next build                               # build
pnpm exec playwright test                          # e2e at 375/768/1280/1440/1920
```

Package scripts: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:e2e`.

CI: `.github/workflows/ci.yml` runs the same gates on push to `main`/`staging`/`feature/**`
and on PRs into `main`/`staging` (Node from `.nvmrc`, pnpm cache, Playwright browser cache).
**CI never deploys.** No workflow may deploy to production, call `vercel --prod`, or hold a
`VERCEL_TOKEN`. Preview deploys come from Vercel's Git integration, not from Actions.

`tests/e2e/smoke.spec.ts` asserts all 14 spec routes (§2.0) return 200 and that non-production
is noindex. It is expected to fail until every route exists — that is the point of the gate.

## Environment variables

- Template: `.env.example` (no real values). Docs: `docs/ENV.md`.
- **Local dev:** copy to `.env.local` (git-ignored). Everything is optional; with nothing set the
  app runs on fixtures and is noindex.
- **Staging / production:** set in **Vercel → Project → Settings → Environment Variables**,
  scoped to *Preview* (staging) or *Production*. Never in the repo, never in CI logs.
- `.gitignore` ignores `.env*` (except `.env.example`), `.vercel`, `node_modules`, `.next`.
  Before every commit: `git ls-files | grep -E '(^|/)\.env'` must print only `.env.example`.

## Staging noindex rule (spec §5, REQ-130)

Staging must never be indexed. Three layers, all keyed on `NEXT_PUBLIC_SITE_ENV`:

1. `app/robots.ts` → `Disallow: /` unless `NEXT_PUBLIC_SITE_ENV=production`.
2. `next.config.ts` → `X-Robots-Tag: noindex, nofollow, noarchive` header on every response unless production.
3. Metadata `robots: { index: false, follow: false }` (layout + `lib/seo/metadata.ts`) unless production.

`NEXT_PUBLIC_SITE_ENV=production` may be set **only** on the Vercel *Production* environment.
Preview/staging must be `staging` (or unset). Vercel also adds `X-Robots-Tag: noindex` to
preview deployments by default — don't rely on that alone.

## Sign-off chain and deploy policy

Spec §8 (no step may be skipped): Spec approved → Design approved → Architecture approved →
build → **QA PASS → QC PASS → Abdullah explicit "deploy"** → DevOps deploys.

- Only DevOps deploys. Only to staging until Abdullah approves production.
- **No deploys Friday evening or on weekends** (production). Staging previews are fine.
- Production promotion is manual (Vercel dashboard "Promote to Production" of the approved
  staging deployment, or a DevOps-run `vercel deploy --prod` from `main`) and only after the
  explicit approval is recorded in ClickUp.

## Rollback procedure

1. **Keep the previous deployment.** Never delete the last known-good production deployment.
2. **Rollback first, investigate second.** Vercel → Deployments → previous good deployment →
   *Instant Rollback* (or `vercel rollback <deployment-url>`). Verify the site, then investigate.
3. **Document** in ClickUp: what broke, when it was noticed (PKT), rollback time, root cause,
   and the fix / follow-up. Only re-deploy after the fix passes QA → QC → approval again.

## Credentials still needed

See `STAGING_SETUP.md`.

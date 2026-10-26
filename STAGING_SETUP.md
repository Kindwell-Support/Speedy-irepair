# Staging setup — remaining steps that need credentials

Status (Oct 27, 2026, PKT): repo is local only at `/workspace/speedy-irepair/web`.
`gh` is **not** logged in; Vercel CLI (`pnpm dlx vercel`, v65.3.1) reports **"Logged out."**
No login or auth workaround was attempted. **Nothing has been deployed. No domain/DNS touched.**

Scope: **staging (Vercel Preview) only.** Production stays blocked until Abdullah's explicit "deploy".

## 1. GitHub repository (needs: GitHub account/org with repo-create rights for Kindwell)

```bash
gh auth login                      # human, interactive
gh repo create <org>/speedy-irepair-web --private --source . --remote origin
git push -u origin main staging feature/foundation
```

Then in GitHub → Settings:
- Default branch: `staging` (so PRs target staging by default) — or keep `main` and set PR base manually.
- Branch protection on `main` and `staging`: require PR + passing `CI / quality-gates`; no force-push.
- Do **not** add a `VERCEL_TOKEN` (or any deploy secret) to Actions.

## 2. Vercel project via Git integration (needs: Vercel team access for Kindwell)

1. Vercel → Add New Project → Import the GitHub repo. Framework: Next.js. Root directory: repo root
   (or `web/` if the repo is the parent folder). Install: `pnpm install --frozen-lockfile`. Node 20.x.
2. Settings → Environments → Production → Branch Tracking: `main`.
   `vercel.json` disables Git-triggered deploys of `main` (`git.deploymentEnabled.main = false`),
   so pushes to `main` will **not** deploy production. Leave it that way.
3. Push to `staging` → a Preview deployment is created. Use its **branch URL**
   (`<project>-git-staging-<team>.vercel.app`) as the stable staging URL.
   Optional: add a Custom Environment "staging" tracking the `staging` branch (paid plans).
4. Do **not** add any custom domain. Do **not** touch speedyirepair.com DNS.

## 3. Staging environment variables (Vercel → Settings → Environment Variables, scope: Preview)

| Var | Value for staging |
|---|---|
| `NEXT_PUBLIC_SITE_ENV` | `staging` (never `production` on Preview) |
| `NEXT_PUBLIC_SITE_URL` | the staging branch URL |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | from Sanity project (CMS lane) |
| `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET` | Sanity tokens (mark Sensitive) |
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION` | client's Shopify Storefront API access (pending OQ-09) |
| `FORM_WEBHOOK_URL`, `FORM_WEBHOOK_SECRET` | form notification endpoint (recipient TBD, OQ-14) |
| `FORMS_TURNSTILE_ENABLED`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | optional |

Full list and semantics: `.env.example`, `docs/ENV.md`. Leave the Production scope empty for now.

## 4. Preview protection

- Settings → Deployment Protection: decide **Vercel Authentication** (team members only) vs.
  **Password Protection** / shareable links so Abdullah and QA/QC can open staging.
  Abdullah needs access without friction → generate a *Shareable Link* for the staging branch
  deployment or add him to the team.
- If protection is on, QA's Playwright runs against staging need a
  *Protection Bypass for Automation* secret (store it only as a CI/QA secret, never in the repo).
- Verify on the staging URL:
  `curl -sI <staging-url> | grep -i x-robots-tag` → contains `noindex, nofollow`;
  `curl -s <staging-url>/robots.txt` → `Disallow: /`.

## 5. After staging is live

- Run `PLAYWRIGHT_BASE_URL=<staging-url> pnpm exec playwright test` (plus bypass header if protected).
- Post the staging URL to ClickUp (CP1). Slack/email only when separately authorised.

# ENV: environment variables

The template is `.env.example`. Validation lives in `lib/env.ts` (public) and `lib/env.server.ts` (server-only, `import "server-only"`).
**Every variable is optional locally.** With nothing set, the site runs on fixtures and stays noindex.

| Variable | Scope | Local | Staging (Vercel Preview) | Production (later; not now) | Notes |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | `http://localhost:3000` | preview / staging URL | `https://speedyirepair.com` | canonical, sitemap, OG, JSON-LD `@id`s |
| `NEXT_PUBLIC_SITE_ENV` | public | `staging` | `staging` | `production` | Anything except `production` means noindex ×3 and shows placeholders. CI uses `ci`, which behaves as staging |
| `VERCEL_ENV` | Vercel sets it | — | `preview` | `production` | Second gate: indexable only if `SITE_ENV=production` **and** `VERCEL_ENV` is `production` or unset |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public | empty → fixtures | **blocker** | same project | |
| `NEXT_PUBLIC_SANITY_DATASET` | public | `production` | `production` (or `staging`) | `production` | |
| `NEXT_PUBLIC_SANITY_API_VERSION` | public | `2026-10-01` | same | same | matches cms contract |
| `SANITY_API_READ_TOKEN` | secret | — | Viewer token | Viewer token | draft mode / Presentation |
| `SANITY_WRITE_TOKEN` | secret | — | Editor token | Editor token | writes `formSubmission` docs. Legacy alias `SANITY_API_WRITE_TOKEN` is still read |
| `SANITY_STUDIO_SHOP_SOURCE` | Studio | `shopify` | `shopify` | `shopify` | cms contract §3.6 / ARCHITECTURE D1. Not inlined into the embedded Studio (only `NEXT_PUBLIC_*` are), so the contract default `shopify` applies there |
| `SANITY_REVALIDATE_SECRET` | secret | — | random 32+ chars | random | `/api/revalidate` webhook + `/api/draft-mode/enable` |
| `SHOPIFY_STORE_DOMAIN` | secret | empty → fixture adapter | `*.myshopify.com` (**blocker**) | same | |
| `SHOPIFY_STOREFRONT_TOKEN` | secret | — | Storefront API public token (**blocker**) | same | read products + cart only |
| `SHOPIFY_API_VERSION` | server | `2025-10` | same | same | |
| `FORM_WEBHOOK_URL` | secret | empty → `not_configured`, submissions still stored if a Sanity write token exists | Make/Zapier/email relay | same | gets JSON + `x-speedy-signature` (HMAC-SHA256 of the body) |
| `FORM_WEBHOOK_SECRET` | secret | — | random | random | HMAC key |
| `FORMS_TURNSTILE_ENABLED` | server | `false` | `false` | optional `true` | Off by default. The honeypot, min-time and rate limit are always on |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | public / secret | — | — | if enabled | |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | public | empty → map facade links to Maps | client-confirmed embed | same | Never guess the place |
| `FORM_FIXTURE_FILE` | server | default `<tmpdir>/speedy-irepair-form-submissions.jsonl`; `off` disables | — (Sanity configured) | never used | fixture-mode JSONL sink for submissions (lib/sanity/mutations.ts) |
| `CI`, `PLAYWRIGHT_BASE_URL`, `PORT` | tooling | — | — | — | Playwright: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3417` reuses a running server |

Rules:
- Never commit real values.
- Never import `lib/env.server` into a client component (ESLint rule 6 and `server-only` both stop it).
- Only the Production environment ever gets `NEXT_PUBLIC_SITE_ENV=production`, and production is **not** in scope.

# FRONTEND_STATUS — Speedy iRepair (web/)

Last updated: 2026-10-27, 03:10 PKT (UTC+5). Owner: Frontend Engineer. Branch: `feature/foundation` (local only; the repo has **no git remote**, so nothing was pushed and `git pull --rebase` could not run). Nothing has been deployed.

## 1. Check / build status

| Check | Status |
|---|---|
| `pnpm build` (clean build in an isolated copy, `/tmp/fe-verify`) | **PASS**. 38 pages. Home first-load JS **179 kB** (under the 250 kB budget; was 255) |
| `pnpm lint` | PASS |
| `pnpm typecheck` | **FAIL, 1 error, not Frontend:** `lib/sanity/__tests__/fixture-mode.test.ts:74` (`string` is not assignable to `PolicySlug`). Introduced by the CMS v1.1 refactor. Owner: CMS & Content Engineer / Technical Architect |
| `pnpm format:check` | **FAIL, 92 files**, almost all owned by other lanes (lib/shop, sanity/*, scripts, next.config.ts, tailwind.config.ts, tokens.css, README …). All Frontend-lane files I touched are formatted. Owner: Technical Architect (run `prettier --write .` once all lanes are quiet) |
| `pnpm check` | FAIL because of the two rows above |

Builds were never run in place, because another agent's `next-server` and the QA runs use the live `.next`.

## 2. Routes

All 14 routes exist. They were first built by a parallel "build lane" agent before the designs landed. Frontend has since audited and patched them. **Design parity is NOT done**: see §5.

| Route | One H1 | `<JsonLd/>` | `generateMetadata` → helper | Breadcrumb UI = BreadcrumbList | Notes |
|---|---|---|---|---|---|
| `/` | ✅ (`#hero-title`) | ✅ | ✅ | n/a (home) | data-section ×12 |
| `/services` | ✅ | ✅ | ✅ | ✅ | 14 × `<section id={slug}>` |
| `/shop` | ✅ | ✅ | ✅ | ✅ | |
| `/shop/[product]` | ✅ | ✅ | ✅ | ✅ (hand-written, Home / Shop / title) | |
| `/sell-your-device` | ✅ | ✅ | ✅ | ✅ | |
| `/instant-quote` | ✅ | ✅ | ✅ | ✅ | G4 text ✅ |
| `/schedule-repair` | ✅ | ✅ | ✅ | ✅ | G4 text ✅ |
| `/faq` | ✅ | ✅ | ✅ | ✅ | |
| `/about` | ✅ | ✅ | ✅ | ✅ | |
| `/financing` | ✅ | ✅ | ✅ | ✅ | |
| `/home-internet` | ✅ | ✅ | ✅ | ✅ | |
| `/policies/{shipping-return,privacy,terms}` | ✅ | ✅ | ✅ | ✅ | |

On every route: staging renders `noindex, nofollow`, there is no `foundingDate`, and there are no raw `<img>` tags (next/image only). Horizontal overflow is 0 on all 14 routes at 375/768/1024/1280/1440/1920 after the fixes in §3.

## 3. Frontend changes this session (commits on `feature/foundation`)

- `7c54d10`: `components/ui/Breadcrumbs.tsx` renders the trail **from the page's own BreadcrumbList node**, so the UI always matches the schema. `components/ui/ServiceSummary.tsx` renders the Service `description` visibly (G4). Both are wired into every inner page.
- `a627a6c`: the header CTA is hidden below `md`. Tailwind's `sm` is 375px, so the CTA was overflowing the 375 viewport by 38px; the mobile menu still holds the CTA.
- `d7a1c42`: the contact and newsletter forms are split out with `next/dynamic`.
- `e53843d`: QA hooks (see §7).
- `63aeac4`: policy prose now wraps (`break-words`). Long URLs in the live privacy text caused a 24px overflow at 375.
- `5348149`: the `<Section>` header now matches the design's `.section-head`: an eyebrow, and a 7fr/5fr split at lg when there is an intro.
- Earlier, pre-commit (DevOps snapshotted it): the SEO helpers copied into `lib/seo/*`, `components/seo/JsonLd.tsx`, `sanity/lib/seoQueries.ts`, `sanity/lib/client.ts`, `app/sitemap.ts`, `app/llms*.txt`, and `app/robots.ts` switched to `isIndexable()`.

### Architect-owned files touched (smallest additive changes)

1. `lib/utils/cn.ts`: `extendTailwindMerge` registers the custom font-size keys. Without it, `cn("text-text", "text-body")` silently dropped the colour class, which was a real bug in `ButtonLink`.
2. `lib/sanity/types.ts`: optional `eyebrow` on `SectionCopy`.
3. `lib/sanity/queries.ts`: the `heading` projection now includes `"eyebrow": eyebrow`, per SCHEMA_CONTRACT 1.8 `sectionHeading.eyebrow`. Earlier session: seo `"noIndex": noindex` (G5) and the `llmsContent` singleton query (G7).
4. `lib/seo/*` (SEO-owned): replaced by the SEO specialist's versions. Backups are in `web/.arch-backup/`.
5. `app/robots.ts` (DevOps): `isIndexable()`.

## 4. SEO G-items

| # | Item | Status | Owner |
|---|---|---|---|
| G1–G3 | CMS fields / content | Open | CMS & Content Engineer |
| G4 | Visible Service text on /instant-quote and /schedule-repair | ✅ Done with `ServiceSummary`, rendered from the same graph. The copy currently lives in `lib/seo/routes.ts`; it should move to a Sanity page-intro field so it is editable | SEO + CMS |
| G5 | Per-page `noindex` field | ✅ GROQ `"noIndex": noindex` → `pageMetadata` → `buildMetadata({noindex})` | — |
| G6 | No `foundingDate`; no Google review markup | ✅ Verified in rendered HTML on all routes. `reviewsRenderedOnPage: false` | — |
| G7 | llms from the `llmsContent` singleton | ✅ | — |
| G8 | Staging/previews noindex | ✅ `isIndexable()` drives both robots.txt and the metadata robots tag | — |
| G9 | | Open | CMS / PM |
| G10 | | Open | Technical Architect |
| G11 | | Open | QA |

## 5. Design deviations (for the UI/UX Design Lead)

The 14 designs arrived after the build lane had already built the routes from the spec. The current build is **structurally complete but visually simplified**. The table lists what is still missing; these items are *to build*, not proposals to drop anything. Side-by-side comparisons (design on the left, build on the right) are in `docs/screenshots/compare/<slug>-{1440,375}.png`.

| Area | Gap vs design | Plan / technical note |
|---|---|---|
| Global footer | Oversized wordmark, payment-method row and socials-as-icons are missing | Build in `SiteFooter` using `assets/logo-wordmark-currentcolor.svg` |
| Global section heads | Eyebrows render only once the CMS fills `sectionHeading.eyebrow` (the fixtures have none) | CMS: add eyebrow values to the fixtures and seed |
| Home hero | Hero chips ("90-day warranty", etc.) and exact 4-line H1 spans | Next item |
| Home How It Works | Large step visuals and numbered "03" pinned panel. Currently plain cards | Motion owns the pin; Frontend owns the markup |
| Home Brands | Marquee styling (bordered strip) | |
| Home Why | 2-column layout with big stat numbers ("45 min", "90 days") | Needs `valueProp.stat` in CMS or a design change. **Owner: CMS / Design** |
| Home Testimonials | 4.9 rating/star block | **Intentionally omitted** until P4 is verified (SEO G6, never invent) |
| Home Promotions | Card imagery/gradient | |
| /services | Sticky side TOC at lg, pre-footer CTA band ("Cracked, dead or soaked?") | |
| /shop | "Shop by category" tiles, sort select, Finance-with-Acima CTA, loading/empty frames, sell-CTA band | Grid exists (ShopGrid). Real Shopify images replace the fixture images |
| /instant-quote, /sell-your-device | **Multi-step `<LeadFlow>`** (progress, stepper, chips, RadioCards, ModelList search, success/error frames). Currently a single-page form | Biggest gap. `components/motion/MultiStepForm` exists; LeadFlow will wrap it. `form-progress` / `form-option` hooks land with it |
| /schedule-repair, /home-internet | `EmbedShell` branded bar (exists as EmbedFacade frames; the styling still needs matching) | |
| /policies/* | `<PolicyLayout>` with a sticky TOC at ≥1024 and the "On this page" disclosure | |
| /about, /financing | Layout blocks per design (team grid, 3-step row) | Copy is TBD (P8) |

Proposed deviations (each with its technical reason):
- **D1 Spacing scale.** The design snippet makes `p-2` = 16px (8px scale), but `tailwind.config.ts` keeps a strict 4px scale plus `s-*` tokens. Frontend writes px-correct 4px-scale classes (16px = `p-4`). The pixels are identical; please keep the config as is. Owner: Technical Architect / Design Lead.
- **D2 Testimonial rating block.** Hidden until verified (see above).
- **D3 Navigation.** The CMS navigation has 8 links; the design shows 7 plus Services ▾. The CMS should match the design. Owner: CMS / Design.

## 6. Contract gaps / blockers (with owners)

- **Technical Architect:** the typecheck failure in `lib/sanity/__tests__` (or CMS); repo-wide `format:check`; the `next.config` redirects merge; there is no git remote, so the Architect's pull-before-commit rule is impossible.
- **CMS & Content Engineer:** eyebrow values; the page-intro field for G4 copy; `valueProp.stat`; promo CTA labels differ from the design; "Send us a message" in `LocationContact` is a hardcoded string that needs a field.
- **SEO:** `public/og/default.jpg` is missing.
- **UI/UX Design Lead:** D1–D3 above; 1280/1920 design screens exist only for home.
- **Process:** two Frontend lanes (this one and the "build lane") edited the same files concurrently. To avoid clobbering, I edited only via small atomic patches and committed with pathspecs.

## 7. QA hooks (qa/README.md)

Done:
- Skip link → `<main id="main" tabindex="-1">`.
- `data-section` on all 12 homepage sections.
- `data-testid`:
  - Global: `announcement-banner`, `logo`, `nav-toggle` (`aria-expanded` + `aria-controls`), `mobile-nav`.
  - Home: `hero`, `hero-poster` (3D lane), `service-card` ×8, `how-it-works`, `brands-marquee`, `testimonials`, `testimonial` / `testimonial-placeholder`, `promotions`, `map-embed` (with `data-qa-mask`).
  - Pages: `service-section` ×14, `product-card`.
  - Forms: `newsletter-form`, `contact-form`, `quote-form`, `trade-in-form`, `field-error`, `form-success`.
- FAQ questions are `<button aria-expanded aria-controls>` (Motion Accordion contract).

Pending:
- `form-progress` and `form-option` come with LeadFlow.
- `star-rating` waits on P4.
- `window.__QA__` is for the Motion lane.
- `x-qa-dry-run` is for the forms API (Architect).

## 8. Markup ready for Motion & 3D

- `/` (data-pin="how", data-step, data-stagger, data-split hero, HeroDevice poster).
- `/services` (data-animate="reveal" per section).
- `/faq` (Accordion).
- `/shop` (ShopGrid).
- Inner-page `PageHero` (split heading).

Not ready: `/instant-quote` and `/sell-your-device` (waiting on LeadFlow) and `/policies/*` (waiting on PolicyLayout).

## 9. Screenshots

- Build: `docs/screenshots/frontend/<slug>-{375,768,1024,1280,1440,1920}.png`, 14 routes. These were taken before `5348149`, so they show the old section heads.
- Design vs build: `docs/screenshots/compare/`.

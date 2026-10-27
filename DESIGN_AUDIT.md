# Design Audit — Speedy iRepair

> Audited 2026-10-27 on branch `design/ui-polish-animations`.
> Target: $10,000 agency-level build. Premium, tech-forward, conversion-focused.

---

## Stack Summary

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind 3.4 + comprehensive CSS custom-property token system (`styles/tokens.css`) |
| CMS | Sanity v4 (headless, with preview/draft-mode wiring) |
| Animation | **Framer Motion 14** (layout anims, page transitions, accordion) + **GSAP 3.15** (ScrollTrigger, SplitText for scroll reveals, pinned sequences) + **Lenis** (smooth scroll) |
| 3D | React Three Fiber + Three.js + Drei (procedural hero phone) |
| Icons | Rive (state-machine-driven service icons w/ SVG fallback) |
| Micro-interactions | ReactBits ports: Magnet, DecryptedText/ScrambleText, TargetCursor, LogoLoop |
| E-commerce | Shopify Storefront API (fixture fallback for staging) |
| Forms | Zod validation, honeypot spam guard, custom `useFormSubmit` hook |
| Font | Inter (variable, via `next/font`) |
| Testing | Playwright (5 viewports), Lighthouse CI, axe-core |

**Routes (12 public pages):** `/` (home), `/services`, `/shop`, `/shop/[product]`, `/instant-quote`, `/schedule-repair`, `/sell-your-device`, `/faq`, `/about`, `/financing`, `/home-internet`, `/policies/[slug]`.

**Motion-lab:** `/motion-lab` is a standalone QA harness with hardcoded data — shows what the motion layer *can* do but many of its patterns (HoverCard on service cards, parallax bands, richer stagger orchestration) haven't been wired into the production site yet.

---

## Overall Verdict

**Where it stands: solid 60–65% toward the $10k bar.**

The architecture is genuinely strong. The token system, reduced-motion story, data-attribute motion contract, 3D hero phone with its capability gating and FPS degrade, Rive icons with SVG fallback — this is senior-level engineering that most agency builds never get to. The foundation doesn't need replacing; it needs finishing.

What's missing is the *finish*: visual atmosphere (the page is a flat dark rectangle with white text and occasional red accents), section variety (every block looks the same), imagery (zero photographs), conversion clarity (the two primary funnels aren't visually dominant), and the last mile of motion polish (most of the motion-lab's best tricks aren't wired into production). Right now it reads as a very well-built template. The gap to premium is design confidence: depth, glow, asymmetry, orchestrated entrance sequences, and sections that look like they were *designed* rather than generated from a repeating component.

---

## Findings by Page / Section

### 1. Global: Site Header (`SiteHeader.tsx`)

**F1 — Header CTA vanishes only below 375px (low severity).**
The `Schedule Repair` button uses `hidden sm:inline-flex`. This project's Tailwind config sets `sm: 375px` (not the Tailwind default 640px), so the CTA is visible on virtually all modern phones (iPhone SE = 375px). It only vanishes on sub-375px viewports, which are rare. This is a **low-severity** issue, not a ship-blocker.
**Fix (optional):** For completeness, show a compact icon-button variant below 375px. But this is P2 at most — the CTA is visible on every phone in current circulation.

**F2 — Nav has no active-state indicator.**
The current page isn't highlighted in the primary nav. All items are `text-text-secondary` with a hover to `text-text`. There's no underline, dot, or color change for the active route.
**Fix:** Add an active state using `usePathname()`. Either a red dot below the active item or an animated underline (Framer `layoutId` slide, same pattern as ShopGrid tabs). Color the active item `text-text` and keep others `text-text-secondary`.

**F3 — Header lacks a glass/blur depth cue.**
The header uses `bg-overlay backdrop-blur-md`, which is correct, but the border (`border-border-subtle`) is too subtle against the dark background. On scroll, the header doesn't feel "lifted" from the content.
**Fix:** On scroll (past ~20px), transition the header to a slightly more opaque background + stronger border + `shadow-1`. Use a small `useEffect` with `IntersectionObserver` on a sentinel element or a scroll listener (debounced). Alternatively, wire it to Lenis's scroll event since Lenis is already running.

### 2. Global: Mobile Nav (`MobileNav.tsx`)

**F4 — Hard show/hide with no transition.**
The mobile menu uses `hidden={!open}` — it blinks in and out. This is the most jarring untreated interaction on the site.
**Fix:** Wrap in Framer `AnimatePresence`. Slide in from right (or top, beneath the header) with a 250ms ease-out. Add a semi-transparent backdrop overlay that fades in. Trap focus inside the menu when open. Body scroll should be locked (Lenis `stop()`/`start()`).

**F5 — No route-change animation.**
The menu closes on `pathname` change (good), but the close is instant.
**Fix:** Let the exit animation play (200ms fade-out) before the close state resets.

### 3. Global: Announcement Banner (`AnnouncementBanner.tsx`)

**F6 — Banner is functional but flat.**
Just a red bar with white text. No icon, no dismiss button, no entrance animation.
**Fix:** Add a pulsing dot or small icon before the text (a megaphone, lightning bolt, or similar). Add a dismiss `X` button that slides the banner out and stores dismissal in `sessionStorage`. On first load, animate the banner sliding down from above the header (200ms).

### 4. Home: Hero (`HomeHero.tsx`)

**F7 — No atmospheric background treatment.**
The hero is text on a flat `#0a0a0a` background next to the 3D phone. There's no depth, no glow, no gradient, no grid pattern — nothing that says "premium tech brand."
**Fix:** Add a layered background: (1) a subtle dot-grid pattern at very low opacity (2–3%), (2) a large radial gradient (`radial-gradient`) in brand-red at ~6–10% opacity emanating from the phone's position, (3) a noise texture overlay at 2% opacity for organic grain. These are pure CSS (or a small `<canvas>` for the noise) and cost nothing at runtime.

**F8 — Hero lacks a trust proof bar.**
The strategy says "strong trust proof early." Right now, above the fold there's only the headline, subline, and two CTAs. No years in business, no repair speed, no Google rating.
**Fix:** Below the two CTAs, add a row of 3–4 trust badges (icon + label): `10+ Years` / `Same-Day Repair` / `4.9★ Google (1,000+ reviews)` / `Spectrum Authorized Retailer`. Style as small pill/chip elements with muted text. Animate in with a staggered reveal 0.4s after the CTAs land.
> **Stat verification:** Google rating is **4.9★ with 1,000+ reviews** (confirmed). "10+ years" in business (confirmed by client). "Same-day repairs" (confirmed — old site says "most iPhone and Samsung cracked screen repairs are completed the same day within 45 minutes"). "45-minute repairs" is **[UNVERIFIED — old site claims this; client to confirm it's still accurate]**. "Lifetime warranty" is **[UNVERIFIED — old site says 90-day warranty; client must clarify if warranty terms have changed]**. Address: 1650 W Market St #27, Akron, OH 44313. Phone: 1-855-377-3339.

**F9 — The two primary paths aren't visually distinct.**
The hero has `primaryCta` and `secondaryCta` but the strategy calls for TWO primary paths: "Repair my device" and "Get home internet." Currently the secondary CTA is a ghost button that could be anything. The internet funnel needs its own visual weight.
**Fix:** Below the main hero CTAs, add a dedicated secondary-path card: a compact, bordered card that says "Looking for home internet? $40/mo, first month free →" styled differently from the repair path. Alternatively, split the hero into two visually distinct columns/tracks at desktop, with a divider or "or" bridge between them.

**F10 — Hero entrance sequence isn't orchestrated.**
The headline uses `data-split-trigger="load"` (good), and the subline and CTAs have reveal delays, but there's no coordinated entrance *sequence* — the background should breathe in, then the text, then the CTAs, then the trust bar, then the 3D phone crossfade.
**Fix:** Wrap the hero entrance in a GSAP timeline with explicit sequencing: (1) background glow fades in (0–0.3s), (2) headline SplitText reveals (0.1–0.8s), (3) subline fades up (0.5–0.8s), (4) CTAs stagger in (0.6–0.95s), (5) trust badges stagger in (0.8–1.1s), (6) 3D phone crossfade (handled by HeroDevice, timing aligns naturally). Total sequence under 1.5s per the token budget.

**F11 — Hero poster assets exist but may need quality review.**
`DEFAULT_POSTER` in `HeroDevice.tsx` points to `/hero/phone-poster.{avif,webp,png}`. All three files **do exist** in `/public/hero/` (plus an SVG variant). The poster serves as the LCP element and the permanent fallback on low-end devices.
**Fix:** Verify the poster images are high-quality renders of the 3D phone (not a generic placeholder). If they're already good renders — no action needed. If they're placeholder silhouettes, regenerate from `PhoneScene` via `posterMode` at the correct aspect ratio. The infrastructure is fully in place.

### 5. Home: Services Grid (`ServicesGrid.tsx`)

**F12 — Cards use basic hover, not HoverCard.**
The production `ServicesGrid` uses plain `transition-colors hover:bg-surface-2` on cards. The `HoverCard` component (4px lift + red glow) exists and is used in motion-lab but not here.
**Fix:** Wrap each service card `<li>` in `<HoverCard>`. This gives the lift-on-hover + glow border effect that makes the cards feel interactive and premium.

**F13 — No visual hierarchy between primary and secondary services.**
All 8 cards are the same size in a flat grid. But the strategy says repair and internet are primary; shop, sell, financing, etc. are secondary. The grid doesn't reflect this.
**Fix:** Make the first two cards (repair + internet) span 2 columns on desktop (`xl:col-span-2`) with a slightly different treatment — taller, with a subtle gradient background or a small illustration. The remaining 6 cards stay 1-column. This creates a visual hierarchy that maps to the business hierarchy.

**F14 — Rive icons could be larger for primary cards.**
Icons are 40px across all cards. For the larger primary cards (above), bump icons to 56px.

### 6. Home: How It Works (`HowItWorks.tsx`)

**F15 — Good pinned scroll interaction, but cards lack visual state feedback.**
The GSAP pinned sequence works (tested via motion-lab), and the `is-active` / `is-done` classes are applied, but there's no CSS styling those classes in the production site. The cards all look the same whether active or not.
**Fix:** Add CSS for `[data-step].is-active`: `border-color: var(--color-brand)`, a subtle `shadow-glow`, and the step number color change to brand red. `[data-step].is-done`: dim the card slightly (`opacity: 0.7`), add a small checkmark or line-through the step number. These are pure CSS additions that the GSAP binding already triggers.

**F16 — Step numbers are styled as labels, not features.**
`Step 1`, `Step 2` etc. are tiny uppercase labels. In a premium build, the step number should be a large, bold numeral (the `text-h2` or `text-h3` scale) in brand red, making the steps visually scannable.
**Fix:** Replace `<span className="text-label uppercase text-primary-text">Step {i + 1}</span>` with a prominent numeral: `<span className="text-h3 font-bold text-brand">{String(i + 1).padStart(2, '0')}</span>`. The motion-lab version already does this.

### 7. Home: Brands Marquee (`Brands.tsx`)

**F17 — Brand names are plain text, not logos.**
The brands section renders `<span className="text-h4 font-semibold">{b.name}</span>` as the logo. This looks obviously placeholder/cheap.
**Fix:** Source monochrome SVG logos for each brand (Apple, Samsung, LG, Google Pixel, Motorola, OnePlus). Upload to Sanity as the `brand.logo` field (the data model already supports it). Render as `<img>` at consistent height (32–40px), white/light-gray fill, with a subtle hover colorize effect (the `BrandLogo` component already has this infrastructure).

### 8. Home: Why Choose Us (`WhyChooseUs.tsx`)

**F18 — Section is functional but lacks emotional punch.**
The Framer layout animation (highlight glides to hovered prop) is a nice touch, but the items are just text titles and detail lines. No icons, no numbers, no imagery.
**Fix:** Add icons to each value prop (Rive if available, or inline SVG). For numeric props ("10+ Years", "45-Minute Repairs", "Lifetime Warranty"), use an animated counter that counts up on scroll into view. Style the number in `text-h2 text-brand` above the title.

**F19 — No scroll-reveal on this section.**
The `ValueProps` component has no `data-animate` attribute. It just appears statically.
**Fix:** Add `data-animate="stagger"` to the grid wrapper so items reveal with the standard stagger.

### 9. Home: Testimonials (`Testimonials.tsx`)

**F20 — Static 3-column grid, no carousel.**
On mobile, 3 testimonials stack vertically — user has to scroll through all of them. On desktop, 3 cards side by side is fine but feels like a placeholder layout.
**Fix:** Convert to a horizontally-scrollable carousel: (1) On mobile, a swipeable card carousel with pagination dots. (2) On desktop, show 3 cards with arrows to reveal more. **Must include a visible pause/stop button per WCAG 2.2.2** — auto-advance is acceptable only if the user can pause it. Pause on hover/focus/keyboard. Use Framer Motion for the slide animation. Add a Google logo/rating badge at the top of the section ("4.9★ on Google — 1,000+ reviews").

**F21 — Star ratings aren't visually refined.**
Stars are rendered as repeated "★" Unicode characters. The filled stars are `text-brand` and empty ones `text-text-disabled`. This is functional but looks amateur.
**Fix:** Replace with inline SVG stars (or a single SVG with a clip-path fill). Animate the stars filling in on scroll-reveal (a left-to-right `scaleX` wipe on a gradient mask, 0.4s stagger per star).

**F22 — "Leave a Review" CTA is an afterthought.**
It's a secondary button at the bottom of the section. Google reviews are critical to local business credibility.
**Fix:** Move the review CTA into the section header area, next to the heading. Style it as a compact button with the Google "G" icon. Or create a dedicated "rate us" chip that's always visible in the corner of the section.

### 10. Home: Promotions (`Promotions.tsx`)

**F23 — Promo cards look identical to every other card.**
Same `rounded-xl border bg-surface p-6` treatment. Promotions should feel special — urgent, valuable, eye-catching.
**Fix:** Give promo cards a distinct visual treatment: a subtle gradient background (dark → slightly red-tinted), a "DEAL" or "LIMITED" badge in the top-right corner, and a bolder headline size. Optionally, a shimmer/glow animation on the card border.

### 11. Home: FAQ Section

**F24 — Accordion is well-built but section is visually plain.**
The GSAP/Framer accordion is solid technically. But visually it's a flat list in a bordered card.
**Fix:** No structural change needed; this is acceptable. Minor: add a subtle expand icon rotation animation (the chevron already rotates via Framer — good). Consider adding a "Still have questions? Contact us" CTA below the FAQ list.

### 12. Home: Location & Contact (`LocationContact.tsx`)

**F25 — Map is behind a bland click-to-load facade.**
The `EmbedFacade` shows "Show map" centered in a big empty bordered box. It's correct for privacy/perf, but the empty state looks broken.
**Fix:** Add a styled placeholder: a blurred/dark screenshot of the map location as a background image inside the facade, with the "Show map" button overlaid. Or a CSS-drawn approximate pin-on-dark-rectangle that suggests "map will go here."

**F26 — No store photo.**
A local business page without a photo of the actual store is a major trust gap.
**Fix:** Add a high-quality photo of the Speedy iRepair storefront (or interior) above or beside the map. This humanizes the brand and builds local trust.

### 13. Home: Newsletter Section

**F27 — Section is bare-minimum.**
A heading and an email input. No reason to subscribe is given.
**Fix:** Add a value prop: "Get repair tips, exclusive deals, and new device alerts — no spam." Add an icon or small illustration. Consider a two-column layout: text left, form right.

### 14. Inner-Page Heroes (`PageHero.tsx`)

**F28 — All inner-page heroes are identical and visually flat.**
Every secondary page has the same treatment: eyebrow label (optional) → h1 → subline → CTAs, with a `border-b` at the bottom. No background variation, no illustration, no gradient.
**Fix:** Add a subtle per-page background treatment: (1) a faint radial gradient in the top-right or top-left, tinted with the brand red at very low opacity, (2) a geometric pattern or device silhouette watermark, (3) or at minimum, vary the `tone` (some pages raised, some default) to break the monotony. The `/home-internet` hero, for example, should have a wifi-wave illustration; `/schedule-repair` should have a clock or calendar motif.

**F29 — No scroll-reveal on inner-page hero content.**
The `data-split` on h1 is good, but the subline and CTAs appear statically.
**Fix:** Add `data-animate="reveal"` with staggered delays to subline and CTA div, matching the home hero's entrance pattern.

### 15. Instant Quote (`/instant-quote`)

**F30 — QuoteForm is flat, not using MultiStepForm.**
The `MultiStepForm` component exists, is well-built (Framer slide transitions, focus management, progress bar), and was specifically designed for this flow. But the production QuoteForm renders all fields in a single flat form. This is the single biggest missed opportunity on the site.
**Fix:** Refactor `QuoteForm` to use `MultiStepForm`. Steps: (1) Device type (radio cards with device icons, not a `<select>`), (2) Brand + Model, (3) Issue (radio cards), (4) Contact info. Each step should have a clear heading and feel like a guided conversation, not a form dump.

**F31 — Form card has no visual distinction.**
The form sits in a `rounded-xl border bg-surface p-6` card. It looks like every other card on the site.
**Fix:** Give the form card a stronger treatment: a subtle gradient background or a glow border. Add a small illustration or icon at the top of the form.

### 16. Schedule Repair (`/schedule-repair`)

**F32 — Square booking embed dominates the page with no branding.**
The page is basically a branded header around an iframe. Once the iframe loads, the user is in Square's UI with no Speedy iRepair visual context.
**Fix:** Add a branded header above the embed area: "Book Your Repair" with a trust bar (same-day, walk-ins, warranty). Below the embed, the "What to Expect" / "What to Bring" sections are good but could use icons for each list item.

### 17. Sell Your Device (`/sell-your-device`)

**F33 — TradeInForm is also flat, not using MultiStepForm.**
Same issue as QuoteForm. Should be a guided multi-step flow.
**Fix:** Refactor to MultiStepForm: (1) Device type (radio cards), (2) Brand + Model, (3) Condition (radio cards with descriptions: "Like New", "Good", "Fair", "Broken"), (4) Contact info.

**F34 — "Brands accepted" is just text pills.**
A row of rounded-full pills with brand names. Looks like tags, not a premium feature.
**Fix:** Replace with brand logo images (same as the home marquee, once logo assets exist). Or style as cards with the brand logo + "We buy [Brand]" text.

### 18. Home Internet (`/home-internet`)

**F35 — This is a primary funnel but looks like a secondary page.**
The strategy says home internet is one of two primary paths. But the page is just a PageHero, two plain list sections, a Jotform embed, and an FAQ. No visual distinction from any other page.
**Fix:** (1) Larger, more prominent hero with a wifi/internet illustration or icon, (2) pricing highlighted prominently: "$40/mo" in large type with "First month FREE" badge, (3) "What You Get" items should be styled as feature cards with icons (not plain `<li>` elements in a bordered card), (4) the Jotform embed facade needs the same styled-placeholder treatment described in F25, (5) add a comparison table or "Why Spectrum" section.

**F36 — Jotform embed is 1100px tall.**
This is a massive iframe that dominates the page. The Jotform form inside may have its own styling that clashes with the site.
**Fix:** If possible, rebuild the sign-up form natively (like QuoteForm) instead of embedding Jotform. This gives full control over styling and multi-step UX. If Jotform must stay, at minimum ensure the facade has a good placeholder state and the iframe height is responsive.

### 19. Shop (`/shop`)

**F37 — Product cards lack hover states.**
`ProductCard` is a static card. No HoverCard wrapper, no image zoom on hover, no price emphasis.
**Fix:** Wrap in `<HoverCard>`. On hover: subtle image scale-up (1.03x, 200ms), card lifts. "Sold out" items should be visually dimmed with a "Sold Out" overlay badge on the image.

**F38 — Category filter tabs lack visual polish.**
Tabs are unstyled buttons with a Framer `layoutId` underline (good). But they have no background, no padding distinction between active/inactive, no count badge.
**Fix:** Active tab: `bg-primary-tint text-text` with the sliding underline. Inactive: `text-text-secondary`. Add product counts per category as a small badge.

### 20. Services (`/services`)

**F39 — 14 service sections in a row is monotonous.**
Every service is the same: icon + heading + summary + body + CTAs, in a two-column grid, separated by `divide-y`. Reading 14 of these feels like reading a list, not browsing a premium service menu.
**Fix:** (1) Alternate the icon/content column position (odd left, even right) for visual rhythm. (2) Group services into categories (Repair, Sales, Internet, Other) with category headers. (3) Add a sticky side-nav or jump-links at the top for the 14 services. (4) Use `data-animate="reveal"` (already present — good) but vary the entrance direction (alternate left/right slides).

### 21. About (`/about`)

**F40 — Team section uses placeholder data.**
All team members are marked `isPlaceholder`. The photos field exists but likely has no real images.
**Fix:** Get real team photos. Style the team grid with a hover effect: photo slight zoom + name/role overlay slide-up. Consider circular photo crops for a more personal feel.

**F41 — Values section is just text in cards.**
`page.valuesSection.values` renders as text inside bordered cards. No icons, no visual treatment.
**Fix:** Add an icon per value. Or style as a more distinctive element: large pull-quote style, or a numbered list with brand-red numerals.

### 22. FAQ (`/faq`)

**F42 — Page is functional and clean.** The GSAP accordion engine is well-implemented. The page is acceptable. Minor: add a search/filter for FAQs if the list grows beyond 10.

### 23. Financing (`/financing`)

**F43 — "What you can finance" items are plain pills.**
Same treatment as brand pills — `rounded-full border px-4 py-2`. Looks like tags.
**Fix:** Style as small cards with icons (phone, tablet, accessory icons). Or use a grid layout instead of flex-wrap.

### 24. 404 Page (`not-found.tsx`)

**F44 — Bare-bones 404.**
Just "Page not found" heading, a sentence, and a "Back to home" button. No personality.
**Fix:** Add a playful illustration (broken phone, cracked screen, repair-themed). Add the brand's voice: "Oops! This page needs a repair too." Include a search bar or suggested links.

### 25. Footer (`SiteFooter.tsx`)

**F45 — Footer is solid but could be elevated.**
Four-column grid, address, socials, quick links, hours, copyright, payment badges. Structurally good.
**Fix:** (1) Add a red gradient line or branded divider between the footer and the page content. (2) Upgrade the social links from text to icon buttons (use inline SVGs for Facebook, Instagram, Google). (3) Payment badges are text in bordered spans — replace with recognizable icons/logos. (4) Add a small "Back to top" button in the bottom-right.

---

## New Features & Animations to Add

### A. Animated Number Counters
**Where:** Home hero trust bar, WhyChooseUs section, any stat-heavy section.
**Behavior:** On scroll into view, count from 0 to the target number (e.g., 10+ → counts from 0 to 10, then shows "+"). Duration 1.2s, eased. Use GSAP or a simple `requestAnimationFrame` counter. Only trigger once (IntersectionObserver, `once: true`).
**Library:** No new library needed. GSAP can do this, or write a 30-line hook.

### B. Testimonial Carousel
**Where:** Home testimonials section.
**Behavior:** Horizontal swipeable carousel. Auto-advance every 5s with a **visible pause/stop button (WCAG 2.2.2 requirement)** — auto-advancing content must be user-pausable. Pause also on hover/focus/keyboard interaction. Pagination dots below. On mobile: one card visible with peek of next. On desktop: 3 visible with arrows. Framer Motion `drag` + `AnimatePresence` or CSS scroll-snap + IntersectionObserver for the dots.
**Library:** No new library needed. Framer Motion + CSS scroll-snap.

### C. Radio Card Selectors for Forms
**Where:** QuoteForm (device type, issue), TradeInForm (device type, condition).
**Behavior:** Tappable cards with icon + label instead of `<select>` dropdowns. Selected card gets `bg-primary-tint` + `border-brand` + a check icon. Framer `layoutId` for the selection indicator sliding between cards.
**Library:** No new library — pure CSS + Framer.

### D. Hero Entrance Sequence
**Where:** Home hero.
**Behavior:** Orchestrated GSAP timeline: (1) background glow breathes in, (2) headline words reveal via SplitText (already working), (3) subline fades up, (4) CTAs stagger in, (5) trust badges stagger in, (6) 3D phone crossfade aligns. Total ≤1.5s.
**Library:** Already have GSAP.

### E. Scroll Progress Indicator
**Where:** Header (thin bar at very top, or progress line beneath the header).
**Behavior:** A 2px-tall bar that fills from left to right as the user scrolls the page. Brand-red color. Driven by Lenis scroll position (no new scroll listener needed).
**Library:** CSS `scaleX` + Lenis callback. Trivial.

### F. Section Divider Variations
**Where:** Between major homepage sections.
**Behavior:** Instead of uniform `py-section` gaps, add visual dividers: (1) a subtle gradient fade from bg → bg-raised (or vice versa), (2) an angled clip-path edge on some sections, (3) a thin red line with a node/dot at the center. These break the vertical monotony without adding weight.
**Library:** Pure CSS.

### G. Parallax Hero Background
**Where:** Home hero, potentially inner-page heroes.
**Behavior:** The dot-grid / radial-glow background layers parallax at different rates on scroll. The phone 3D scene already has its own motion; the background layers moving at 30–50% scroll speed creates depth. Use the existing GSAP `data-parallax` binding.
**Library:** Already have GSAP ScrollTrigger.

### H. Mobile Nav Slide-In
**Where:** MobileNav component.
**Behavior:** Full-height panel slides in from right (or drops down from header). Backdrop overlay fades in simultaneously. Nav items stagger-reveal inside. Framer `AnimatePresence` + `motion.div`.
**Library:** Already have Framer Motion.

### I. Form Success Celebration
**Where:** All form submissions (QuoteForm, TradeInForm, ContactForm, NewsletterForm).
**Behavior:** On success: (1) form content fades out, (2) a check-circle icon scales up with a spring animation, (3) success message fades in below. Duration: 0.8s total. ~~Confetti removed~~ — confetti is inappropriate for a local repair shop's professional tone.
**Library:** Framer Motion spring only.

### J. Floating "Book Repair" CTA
**Where:** All pages except `/schedule-repair` itself.
**Behavior:** A floating action button (FAB) in the bottom-right on mobile. Appears after scrolling past the hero (or after 3s). Pulsing glow ring. Tapping opens a bottom-sheet with quick booking options. On desktop, the header CTA is always visible, so the FAB is mobile-only.
**Library:** Framer Motion for the entrance/pulse. CSS for the glow.

---

## Prioritized Roadmap

### P0 — Must Fix (High Impact, Ship-Blockers)

| # | Task | Effort | Files | Notes |
|---|---|---|---|---|
| P0-1 | **Wire MultiStepForm into QuoteForm** — convert from flat form to guided 4-step wizard with radio cards for device/issue selection | M | `QuoteForm.tsx`, new `RadioCardField` in `fields.tsx` | Biggest UX gap on the site |
| P0-2 | **Wire MultiStepForm into TradeInForm** — same treatment, 4 steps | M | `TradeInForm.tsx` | |
| P0-3 | **Home Internet page upgrade** — prominent pricing ($40/mo large type, "First Month FREE" badge), feature cards with icons, styled Jotform facade, comparison/value section | L | `home-internet/page.tsx`, new components | **Primary funnel — must match repair path in visual weight** |
| P0-4 | **Hero atmospheric background** — radial glow, dot grid, noise texture | S | `HomeHero.tsx`, possibly a new `HeroBackground.tsx` | |
| P0-5 | **Hero trust bar** — 4 stat badges: 10+ Years / Same-Day Repair / 4.9★ Google (1,000+) / Spectrum Authorized | S | `HomeHero.tsx`, new `TrustBar.tsx` | See stat verification in F8 |
| P0-6 | **Hero entrance sequence** — orchestrated GSAP timeline | S | `HomeHero.tsx` or a new `useHeroSequence` hook | |
| P0-7 | **Wire HoverCard to ServicesGrid** — production cards get lift + glow | S | `ServicesGrid.tsx` | |
| P0-8 | **How It Works visual state CSS** — style `.is-active` / `.is-done` states | S | `globals.css` or `motion.css` + `HowItWorks.tsx` | |
| P0-9 | **Mobile nav animation** — slide-in + backdrop + stagger | S | `MobileNav.tsx` | |
| P0-10 | **Header scroll state** — stronger border + shadow on scroll | S | `SiteHeader.tsx` | |
| P0-11 | **Two-path hero split** — visually distinct repair vs. internet paths (F9) | M | `HomeHero.tsx` | Ensures both primary funnels get equal billing |

### P1 — Premium Upgrades

| # | Task | Effort | Files | Notes |
|---|---|---|---|---|
| P1-1 | **Photography / real imagery** — storefront photo, team photos, service action shots, device imagery | M | Asset sourcing + multiple components | **Zero photographs anywhere on the site; biggest visual gap** |
| P1-2 | **Testimonial carousel** — horizontal swipe, pagination, **visible pause button (WCAG 2.2.2)** | M | `Testimonials.tsx`, new `TestimonialCarousel.tsx` | Must be manually pausable |
| P1-3 | **SVG star ratings** — replace Unicode stars with animated SVG fills | S | `Testimonials.tsx` | |
| P1-4 | **Brand logos** — replace text with monochrome SVG logos | S | Sanity asset upload + `Brands.tsx` | |
| P1-5 | **Service card hierarchy** — primary cards span 2 cols, different treatment | S | `ServicesGrid.tsx` | |
| P1-6 | **Inner-page hero backgrounds** — per-page gradient/pattern variations | M | `PageHero.tsx` | |
| P1-7 | **Section divider variations** — gradients, angled edges, red lines | S | Various section wrappers | |
| P1-8 | **Promo cards visual distinction** — gradient, badge, shimmer | S | `Promotions.tsx` | |
| P1-9 | **Nav active-state indicator** — animated underline or dot | S | `SiteHeader.tsx` | |
| P1-10 | **ScrollProgress bar** — thin red line at top of page | S | New `ScrollProgress.tsx` in header | |
| P1-11 | **Product cards hover states** — HoverCard wrapper, image zoom | S | `ProductCard.tsx` | |
| P1-12 | **Form success celebration** — check animation + message (no confetti) | S | `FormShell.tsx` | |
| P1-13 | **WhyChooseUs icons + number counters** — visual and animated props | M | `WhyChooseUs.tsx`, `ValueProps.tsx` | |
| P1-14 | **Hero poster asset quality check** — verify renders are production quality | S | Asset review task | Poster files exist; quality TBD |
| P1-15 | **Embed facade placeholders** — blurred map screenshot, branded states | S | `EmbedFacade.tsx` | |
| P1-16 | **Shop category tabs polish** — active bg tint, counts | S | `ShopBrowser.tsx` | |

### P2 — Nice-to-Have Flourishes

| # | Task | Effort | Files | Notes |
|---|---|---|---|---|
| P2-1 | **404 page personality** — illustration, witty copy, suggested links | S | `not-found.tsx` | |
| P2-2 | **Footer social icons** — SVG icons instead of text links | S | `SiteFooter.tsx` | |
| P2-3 | **Footer payment icons** — recognizable logos instead of text | S | `SiteFooter.tsx` | |
| P2-4 | **Back-to-top button** — appears on scroll, smooth scrolls to top via Lenis | S | New component in footer | |
| P2-5 | **Parallax hero background layers** — dot-grid and glow at different scroll rates | S | `HomeHero.tsx` | |
| P2-6 | **Announcement banner animation** — entrance slide-down, dismissible | S | `AnnouncementBanner.tsx` | |
| P2-7 | **Services page side-nav** — sticky jump-links for 14 services | M | `services/page.tsx` | |
| P2-8 | **Alternating service section layout** — icon left/right alternation | S | `ServiceSections.tsx` | |
| P2-9 | **Store photo on location section** — real storefront/interior photo | S | Asset + `LocationContact.tsx` | |
| P2-10 | **Floating mobile Book CTA (FAB)** — appears after scroll, pulsing glow | M | New `FloatingCta.tsx` | |
| P2-11 | **Header CTA compact variant** — icon-button below 375px (F1, low priority) | S | `SiteHeader.tsx` | Very few users affected |
| P2-12 | **Newsletter section value prop** — copy + icon/illustration | S | Home `page.tsx` | |
| P2-13 | **Form field focus micro-animation** — label float or border glow on focus | S | `fields.tsx` | |
| P2-14 | **OG image generation** — branded social sharing images per page | M | `app/api/og/route.tsx` or static assets | |
| P2-15 | **Jotform replacement (native form)** — rebuild home internet signup natively | L | New form component | **⚠ Needs team decision** — Jotform may be required for Spectrum workflow integration. Only rebuild if team confirms Jotform can be replaced. |

---

## Libraries Assessment

| Library | Status | Recommendation |
|---|---|---|
| **Framer Motion** | Installed, well-used | Keep. Core to page transitions, layout anims, accordion. |
| **GSAP** (ScrollTrigger, SplitText) | Installed, well-used | Keep. Core to scroll reveals, pinned steps, text splits. |
| **Lenis** | Installed, well-used | Keep. Smooth scroll + Lenis callbacks for scroll-linked effects. |
| **React Three Fiber** | Installed, used for hero | Keep. The 3D phone is a signature differentiator. |
| **Rive** | Installed, used for icons | Keep. Adds life to service icons. |
| **Spline** (`@splinetool/react-spline`, `@splinetool/runtime`) | Installed but **unused anywhere** | **Remove.** ~200KB+ bundle weight for nothing. If a Spline scene is needed later, re-add it. |
| **styled-components** | Installed — **peer dependency of `@sanity/ui`** (Sanity Studio) | **Keep.** It is a required peer dependency of `@sanity/ui`, which powers the Sanity Studio at `/studio`. It is NOT used in the public-facing site code but cannot be removed without breaking the CMS. It is already code-split into the `/studio` route chunk (1.87 MB) and does not affect public page bundles. |

**No new libraries are needed.** Every proposed enhancement can be built with the existing stack (Framer Motion + GSAP + Lenis + vanilla CSS). The motion-lab prototype already demonstrates most of the patterns; the work is wiring them into production.

---

## Effort Key

- **S (Small):** < 2 hours. Single component change, CSS addition, or wiring an existing pattern.
- **M (Medium):** 2–6 hours. New component, multi-file change, or significant refactor of an existing component.
- **L (Large):** 6–16 hours. Multi-component feature, new page section, or system-level change.

---

## Typography & Color Assessment

### Current State
**Font:** Inter (variable) via `next/font`, set as `--font-sans`. Single font family across the entire site — headings, body, labels, everything.

**Type scale:** Excellent fluid clamp-based scale in `tokens.css` (display: 48→96px, h1: 40→72px, h2: 32→56px, h3: 24→36px, etc.). Tight negative tracking on display/h1 (−0.04em / −0.035em). Line heights are well-tuned (display: 0.95, body: 1.6). `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. The type system is **production-ready**.

### Assessment: Inter-Only
Inter is a solid workhorse — excellent legibility, large x-height, tight at display sizes. For a local repair shop, it's a safe choice. However, for the **$10k agency bar**, single-font sites risk looking generic. The headings lack personality.

### Recommended Display Font Pairings (pick one)
1. **Space Grotesk** — Geometric, tech-forward, excellent at display sizes. Pairs naturally with Inter at body. Free on Google Fonts. *Best fit for Speedy iRepair's tech-repair identity.*
2. **Manrope** — Semi-geometric, slightly warmer than Inter. Good contrast at display sizes, still feels modern. Free on Google Fonts.
3. **Cabinet Grotesk** (or Satoshi) — More premium/editorial feel. Stronger personality at display sizes. Available on Fontshare (free for commercial use).

**Implementation:** Load via `next/font/google` (or `next/font/local` for Fontshare fonts). Set as `--font-display` token. Apply to `.text-display`, `.text-h1`, `.text-h2` only. Keep Inter for h3–h6 and body. Cost: ~20–40KB additional font weight (variable single axis).

> **⚠ Needs client decision:** Font change affects brand perception. Present 2–3 options with mockups before committing.

### Color Palette Review
**Background ladder:** Near-blacks (#0a0a0a → #111 → #161616 → #1c1c1c → #242424). Well-spaced, sufficient contrast between layers. No issues.

**Brand red:** #ED1C24 (logo red, accents) / #D9161E (button fill). White-on-red contrast is **5.14:1** (passes AA for normal text, passes AAA for large text). Red-on-dark-bg is **4.52:1** (passes AA for large text only — fine for headings/icons, but **don't use brand red for small body text**). The `--color-primary-text: #FF4D53` variant at **6.07:1** is correctly used for small red text on dark.

**Text ramp:** All contrast ratios pass WCAG AA against #0a0a0a:
- `--color-text` (#fff): 19.8:1 ✓
- `--color-text-primary` (#f2f2f2): 17.7:1 ✓
- `--color-text-secondary` (#a3a3a3): 7.85:1 ✓
- `--color-text-tertiary` (#8a8a8a): 5.73:1 ✓ (AA for normal text)
- `--color-text-disabled` (#5c5c5c): 3.35:1 — correctly noted as "decorative/disabled only, not for info"

**Verdict:** The color system is well-designed. The near-black ladder creates good depth. Brand red is correctly split into fill vs. text variants. No accessibility violations in the token definitions. The palette could benefit from one **accent color** beyond red (a cool neutral or muted blue) for informational states, but this is a P2 concern.

---

## Performance Budget

### First Load JS by Route (production build)

| Route | First Load JS | Verdict |
|---|---|---|
| `/` (home) | 255 kB | ⚠ Heavy — target ≤200 kB. 3D phone + GSAP + Framer + Rive all converge here. |
| `/about` | 149 kB | ✅ Good |
| `/faq` | 202 kB | ⚠ Slightly over — GSAP accordion engine. Acceptable. |
| `/financing` | 202 kB | ⚠ Slightly over — similar to FAQ. |
| `/home-internet` | 212 kB | ⚠ Over — includes Jotform embed facade + FAQ accordion. |
| `/instant-quote` | 144 kB | ✅ Good |
| `/schedule-repair` | 144 kB | ✅ Good |
| `/sell-your-device` | 144 kB | ✅ Good |
| `/services` | 214 kB | ⚠ Over — 14 service sections + GSAP bindings. |
| `/shop` | 172 kB | ✅ Acceptable |
| `/shop/[product]` | 123 kB | ✅ Good |
| Shared by all | 104 kB | ✅ Framework + shared components |
| `/studio` (Sanity) | 1.87 MB | N/A — internal CMS, not public |

### Budget Targets

| Metric | Target | Current | Status |
|---|---|---|---|
| Shared JS (all routes) | ≤120 kB | 104 kB | ✅ |
| Page JS (non-home) | ≤200 kB | 123–214 kB | ⚠ Services/FAQ/financing slightly over |
| Home page JS | ≤250 kB | 255 kB | ⚠ Slightly over |
| LCP (mobile 4G) | ≤2.5s | TBD (Lighthouse needed) | Pending |
| CLS | ≤0.1 | TBD | Pending |
| TBT | ≤200ms | TBD | Pending |

### Recommendations
1. **Home page (255 kB):** The 3D phone is the main contributor. The existing capability gating + FPS degrade + lazy loading is the right architecture. Consider whether Rive icons can be deferred further (they're below the fold in ServicesGrid).
2. **Spline removal:** `@splinetool/react-spline` + `@splinetool/runtime` are installed but **completely unused** (confirmed via grep — no imports outside `package.json` and lint config). Removing saves ~200+ kB from the dependency tree and potential chunks.
3. **Services (214 kB):** 14 service sections with GSAP bindings. Consider lazy-loading service sections below the fold with `React.lazy` + `IntersectionObserver`.

> **Note:** Lighthouse mobile scores not yet collected. Should be run on the 3 priority pages: `/`, `/instant-quote`, `/home-internet` once a staging deploy is available.

---

## Micro-Interaction Assessment: TargetCursor & ScrambleText

### TargetCursor (`CursorFollower.tsx`)
**What it does:** A custom cursor (crosshair brackets) that follows the mouse and snaps onto links/buttons. Desktop fine-pointer only. Lazy-loaded after idle.
**Assessment:** **Keep, but evaluate on real users.** It's a distinctive touch that signals "premium tech brand." The implementation is solid — it's gated to fine-pointer desktops only, lazy-loaded, and the default cursor is NOT hidden (`hideDefaultCursor: false`), which is the accessible choice. However, for a **local repair shop**, this may feel over-designed. A 55-year-old Akron resident looking to fix their phone doesn't expect or benefit from a custom cursor. **Recommendation:** Keep it for now (it costs nothing on mobile/touch where most local business traffic comes from), but be prepared to remove it if user testing shows confusion.

### ScrambleText / DecryptedText (`ScrambleText.tsx`)
**What it does:** Nav items scramble through random characters on hover before resolving to the real text. 6 iterations × 30ms = 180ms effect. Off for touch/reduced-motion.
**Assessment:** **Keep with reservation.** It's a fun, tech-forward detail that reinforces the "we know technology" brand. It's correctly disabled for touch and reduced-motion users. But it adds ~180ms of cognitive friction to every nav hover — users have to wait for the text to resolve to confirm they're hovering on the right item. For a site with 8 nav items that users need to navigate efficiently, this is a tradeoff. **Recommendation:** Keep it at 4 iterations × 25ms (100ms total) for a snappier resolve, and ensure the scramble effect uses characters visually distinct from the target text so it reads as "animation" not "broken."

---

## Form Submission Payloads

### Architecture
All forms follow the same pipeline:
1. **Client:** `useFormSubmit` hook validates with Zod → appends spam fields → POSTs to `/api/forms/{type}`
2. **API route:** Type check → rate limit → JSON parse → spam detection (honeypot, fill-time, optional Turnstile) → Zod re-validation → `deliverSubmission()`
3. **Delivery:** Writes a Sanity `formSubmission` document + POSTs to `FORM_WEBHOOK_URL` with HMAC-SHA256 signature

### Payloads by Form Type

**Quote Form** (`/api/forms/quote`)
```
deviceType: "iPhone" | "iPad" | "Samsung" | "LG" | "Google" | "Other"
model:       string (free text)
issue:       "Cracked Screen" | "Battery" | "Charger Port" | "Camera" | "Water Damage" | "Other"
details?:    string (optional)
name:        string
phone:       string
email:       string (email validated)
```

**Trade-In Form** (`/api/forms/tradein`)
```
deviceType: "Phone" | "Tablet" | "Smartwatch" | "Laptop" | "Other"
brand:      "Apple" | "Samsung" | "LG" | "Google" | "Motorola" | "OnePlus" | "Other"
model:      string (free text)
condition:  "Like new" | "Good" | "Fair" | "Cracked-damaged" | "Not working"
details?:   string (optional)
name:       string
phone:      string
email:      string (email validated)
```

**Contact Form** (`/api/forms/contact`)
```
name:    string
email:   string (email validated)
phone?:  string (optional)
message: string
```

**Newsletter Form** (`/api/forms/newsletter`)
```
email: string (email validated)
```

### Spam Fields (appended to all forms)
```
company_website: string  (honeypot — must be empty)
startedAt:       number  (timestamp — fill time < 3s = bot)
turnstileToken?: string  (optional Cloudflare Turnstile)
pagePath?:       string  (current URL path)
```

### Delivery Targets
- **Sanity document:** `formSubmission` type with `{type, payload (JSON), createdAt, status: "new", pagePath}`
- **Webhook POST:** `{event: "form.submitted", type, createdAt, site, env, notify (email), pagePath, payload}` signed with HMAC-SHA256

> **⚠ Before refactoring forms:** The existing payloads and Zod schemas must be preserved. Any MultiStepForm refactor must produce the identical payload shape. The webhook consumer (CRM, email, or Zapier) expects these exact field names. If field names or enum values change, the webhook integration breaks silently.

---

## Content Verification: Old Site vs. New Build

Cross-referenced the live Shopify site (speedyirepair.com, Empire theme 5.11.4) against the new build's fixture data.

### Old Site Structure
The old Shopify site is **minimal** — many pages return 404:
- **Exists:** Homepage, FAQ, Shop (collections), Policies (shipping/privacy/terms)
- **404 (doesn't exist):** About, Services, Warranty (as standalone pages)
- **Theme:** Empire 5.11.4 by Shopify
- **Font:** Libre Franklin (vs. Inter in new build)
- **Shopify internal domain:** phonecasebling.myshopify.com

### Content Verification Table

| Claim / Content | Old Site (speedyirepair.com) | New Build (fixtures) | Status |
|---|---|---|---|
| **Business name** | "speedyirepair" (lowercase in title) | "Speedy iRepair" | ✅ New is correct (proper casing) |
| **Address** | "1650 W Market St. Akron, Ohio 44313" | "1650 W Market St #27, Akron, OH 44313" | ⚠ **Suite #27 added in new build** — verify this is correct. Old site omits suite number |
| **Phone** | "1.855.377.3339" | "1.855.377.3339" | ✅ Match |
| **Email** | Not visible on old homepage | "info@speedyirepair.com" | ✅ New addition |
| **Hours** | Not visible on old homepage | Mon–Sat 12–6pm, Sun closed | ⚠ Hours sourced from Google listing — **client to confirm** |
| **Announcement banner** | "FREE Smartphone when you sign up for Home Internet" | "FREE Smartphone when you sign up for Home Internet" | ✅ Exact match |
| **Jotform link** | `form.jotform.com/253200750312037` | `form.jotform.com/253200750312037` | ✅ Exact match |
| **Home Internet pricing** | "$40 monthly, with the first month FREE" | "$40/month. First month free. Free smartphone included." | ✅ Match (rephrased) |
| **Repair time claim** | "Most iPhone and Samsung cracked screen repairs are completed the same day within 45 minutes" | "We fix it in 45 minutes" (hero headline) | ⚠ **Old site says "most iPhone and Samsung" — new build generalizes to all devices. Client to verify 45-min applies broadly** |
| **Warranty** | "All repairs are covered under our 90 day warranty" (FAQ) | Not specified in fixtures (hero trust bar says "Warranty Included") | ⚠ **Old site says 90-day warranty. New site should match. "Lifetime warranty" is UNVERIFIED — do NOT use without client confirmation** |
| **Brands repaired** | "Apple, Samsung, LG, Google" | iPhone, iPad, Samsung, LG, Google (+ Motorola, OnePlus in trade-in) | ✅ Superset |
| **Services listed** | Screen repair, battery, charger port, camera, water damage, bill payment, prepaid plans, device sales | Same + unlocking, financing, home internet, accessories | ✅ Superset (expanded) |
| **Prepaid plans** | "Simple Mobile, AT&T, and Verizon prepaid phone plans" | Not explicitly named in fixtures | ⚠ **Carrier names should be added to services page if still offered** |
| **Bill payment** | "water, electric, and gas bill payments" | Mentioned in services but no detail | ⚠ **Utility types should be listed if still offered** |
| **Payment methods** | PayPal, Venmo | PayPal, Venmo, Visa, Mastercard, Amex, Discover | ✅ Superset |
| **Socials** | Facebook, Twitter, Instagram, YouTube | Facebook, Twitter/X, Instagram, YouTube | ✅ Match |
| **Shop categories** | iPhones, iPads, Apple Watch, MacBooks, Accessories | "Certified pre-owned devices and accessories" | ✅ Shopify integration handles categories |
| **Financing** | "Get the things you love – all without credit*. Our flexible, lease-to-own solutions" | "Lease-to-own. No credit needed." (Acima) | ✅ Match (same concept, cleaner copy) |
| **eBay store** | Link in footer | Link in footer | ✅ Match |
| **Google review link** | "Leave a review" in footer | "Leave a Review" in footer | ✅ Match |
| **Square booking** | "Schedule Repair" nav link | `squareup.com/appointments/book/H19XXYP72PBW5/speedy-irepair-akron-oh` | ✅ Match |
| **Meta description** | "smartphone repairs, pre-owned devices, premium replacement parts, and accessories. We offer prepaid services, bill pay, unlocking, and more!" | "Phone repair, certified pre-owned devices, prepaid plans, bill pay and home internet" | ✅ Updated/improved |
| **Founding year** | Not stated | `null` (Decision #1 — omitted pending client input) | ✅ Correctly deferred |
| **Google rating** | Not shown on old site | 4.9★ / 1,000+ reviews (user-provided, to display) | ✅ New feature |
| **Spectrum badge** | Not on old site | `spectrumAuthorizedRetailer: true` | ✅ New feature |
| **FAQ: Repair time** | "45-60 minutes; android 1-2 hours; parts ordering 3-4 days" | Not in fixtures (deferred to CMS) | ⚠ **Must populate FAQ with these specific answers** |
| **FAQ: Warranty** | "90 day warranty; damage after repair voids warranty" | Not in fixtures (deferred to CMS) | ⚠ **Must populate — this is legally important** |
| **FAQ: Payment** | "all major credit/debit cards" | `paymentsAccepted` includes cards + PayPal + Venmo | ✅ Expanded |
| **FAQ: Upfront payment** | "$20 down on ALL android repairs, 50% down on phone purchases not in stock" | Not in fixtures | ⚠ **Should add to FAQ if policy still applies** |
| **FAQ: Data loss** | "possibility you could lose all data; recommend backing up" | Not in fixtures | ⚠ **Important CYA — should be in FAQ** |
| **Copyright** | "© 2026 speedyirepair" | "© 2026 Speedy iRepair LLC" | ✅ Upgraded with proper legal name |

---

## Items Needing Client Confirmation

Before implementation begins, the following items require client sign-off:

| # | Item | Question | Default if no answer |
|---|---|---|---|
| 1 | **Suite number** | Is the address "1650 W Market St **#27**" or just "1650 W Market St"? Old site omits suite. | Keep #27 (matches Google listing) |
| 2 | **Hours** | Are Mon–Sat 12–6pm, Sun closed the current hours? | Keep (sourced from Google + Square) |
| 3 | **Founding year** | When was Speedy iRepair founded? Needed for "10+ Years" trust badge. | Use "10+ Years" without specific year |
| 4 | **45-minute claim** | Does the 45-minute turnaround apply to all devices or only iPhone/Samsung screens? Old site specified the latter. | Use "Most repairs same-day" (safe) |
| 5 | **Warranty terms** | Old site says 90-day warranty. Is it still 90 days? Or has it changed to lifetime/other? | Use "90-day warranty" (matches old site) |
| 6 | **Prepaid carriers** | Still offering Simple Mobile, AT&T, Verizon prepaid? | Omit specific carriers until confirmed |
| 7 | **Utility bill pay** | Still offering water, electric, gas bill payments? | Include generically: "utility bill payment" |
| 8 | **Upfront payment policy** | Still require $20 down on Android, 50% on out-of-stock purchases? | Omit until confirmed |
| 9 | **Display font** | Approve/choose display font pairing (Space Grotesk, Manrope, or Cabinet Grotesk)? | Keep Inter-only until approved |
| 10 | **Jotform** | Can the home internet Jotform be replaced with a native form, or is it required for Spectrum workflow? | Keep Jotform (mark as "needs team decision") |
| 11 | **Photography** | Can we get storefront photos, team photos, and service action shots? | Use illustrated/icon-based design |
| 12 | **TargetCursor** | Keep the custom cursor effect? It's premium but may confuse non-tech-savvy local customers. | Keep (it's free on mobile where most traffic lands) |

---

## Changelog (Phase 2 Updates, 2026-10-27)

- **F1 corrected:** Tailwind `sm` breakpoint is 375px (not default 640px). Header CTA visible on all modern phones. Downgraded to low severity, moved to P2.
- **F8 updated:** Trust bar stats verified — 4.9★ / 1,000+ reviews, 10+ years, same-day repairs confirmed. "45-minute repairs" and "lifetime warranty" flagged as [UNVERIFIED]. Spectrum Authorized Retailer badge added.
- **F11 corrected:** Hero poster assets (AVIF/WebP/PNG/SVG) confirmed present in `/public/hero/`. Issue changed from "missing" to "quality review needed."
- **F20 updated:** Google rating corrected to 4.9★ / 1,000+ reviews. Carousel must include visible pause button per WCAG 2.2.2.
- **Feature B updated:** Carousel must have visible pause/stop control (WCAG 2.2.2).
- **Feature I updated:** Confetti removed — inappropriate for professional local repair shop tone.
- **Library table corrected:** `styled-components` is a required peer dependency of `@sanity/ui` (Sanity Studio). Cannot be removed. Confirmed code-split into `/studio` chunk only.
- **Roadmap reprioritized:** Home Internet page upgrade moved to P0-3 (primary funnel). Real imagery added as P1-1. Header CTA compact variant moved to P2-11 (low severity). Jotform rebuild moved to P2-15 with "needs team decision" flag.
- **New sections added:** Typography & Color Assessment, Performance Budget, TargetCursor/ScrambleText Assessment, Form Submission Payloads, Content Verification Table (old site vs new), Items Needing Client Confirmation.

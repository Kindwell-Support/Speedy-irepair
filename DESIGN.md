---
name: Speedy iRepair
description: Phone and device repair shop site. Brand red on true black, Orbitron headlines, Rajdhani reading text, photographs of the trade.
colors:
  brand-red: "#ED1C24"
  primary-red: "#D9161E"
  primary-red-hover: "#FF2D35"
  primary-red-active: "#B01117"
  red-text: "#FF4D53"
  true-black: "#000000"
  black-raised: "#0a0a0a"
  panel: "#0c0c0c"
  surface: "#111111"
  surface-2: "#161616"
  surface-3: "#1c1c1c"
  border-subtle: "#1a1a1a"
  border: "#222222"
  border-strong: "#333333"
  text: "#ffffff"
  text-primary: "#f0f0f0"
  text-secondary: "#b8b8b8"
  text-tertiary: "#8f8f8f"
  success: "#3ddc84"
typography:
  display:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(2.5rem, 1.85rem + 2.82vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(2rem, 1.56rem + 1.88vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(1.5rem, 1.28rem + 0.94vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  title-sm:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(1.25rem, 1.13rem + 0.47vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
  body-lg:
    fontFamily: "Rajdhani, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.12rem + 0.28vw, 1.375rem)"
    fontWeight: 500
    lineHeight: 1.6
  body:
    fontFamily: "Rajdhani, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.005em"
  label:
    fontFamily: "Rajdhani, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  full: "9999px"
spacing:
  s-0-5: "4px"
  s-1: "8px"
  s-2: "16px"
  s-3: "24px"
  s-4: "32px"
  s-6: "48px"
  s-8: "64px"
  s-12: "96px"
  s-16: "128px"
  section: "clamp(64px, 40px + 6.4vw, 128px)"
  page: "clamp(16px, 4vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.primary-red}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-red-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-red-active}"
  button-primary-lg:
    typography: "{typography.body-lg}"
    padding: "0 32px"
    height: "56px"
  button-secondary:
    backgroundColor: "{colors.true-black}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  button-link:
    textColor: "{colors.red-text}"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
  step-card:
    backgroundColor: "{colors.true-black}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Speedy iRepair

## Overview

**Creative North Star: "The Lit Bench"**

A repair counter at night: true black ground, one hard brand red, white headline type, and photographs of the work itself under a lamp. The site sells speed and competence, so it shows the trade (screens lifted, batteries fitted, boards under the microscope) and sets its claims in wide, solid Orbitron. Everything a person reads or presses is in Rajdhani.

Density is generous: sections breathe on a fluid 64 to 128px vertical rhythm, headers split heading-left / intro-right on desktop, and short lists are set as type rather than boxed. Depth is tonal (a ladder of near-blacks) plus offset shadows; there is no glass translucency outside the sticky header.

Confirmed rejections (owner): no hollow or outlined headline text, no scan-line or texture over headlines. Headlines are solid, bold, white.

**Key Characteristics:**
- True black (#000) page, near-black ladder for sections and panels.
- One accent: brand red. One full-red field per page at most.
- Orbitron headlines (solid white), Rajdhani for body, buttons, labels and questions.
- Generated photographs of repair work, always captioned as what they show.
- Ruled rows and type-set lists over card grids.
- Third-party embeds behind click-to-load facades.

## Colors

A single-accent palette: brand red against a ladder of near-blacks and a four-step grey text ramp.

### Primary
- **Logo Red** (brand-red): sampled from the logo. Focus rings, selection, accent glyphs (stars), progress rails, pins, chip hover borders, all red glows.
- **Counter Red** (primary-red): button fill and the Promotions field. White on it is 5.1:1, so body text may sit on it. Brighter on hover (primary-red-hover), deeper on press (primary-red-active).
- **Signal Red Text** (red-text): red used as text on black: link buttons, hover state of text links, the home hero brand line.

### Neutral
- **True Black** (true-black): the page and default section ground.
- **Raised Black** (black-raised): `tone="raised"` sections and the footer; alternates with true black.
- **Panel / Surface ladder** (panel, surface, surface-2, surface-3): panels and cards, hover and inputs, pressed and skeleton.
- **Rules** (border-subtle, border, border-strong): hairline dividers, card and row rules, secondary-button stroke.
- **Text ramp** (text, text-primary, text-secondary, text-tertiary): headlines, body, supporting copy (10.4:1), notes and captions only (6.6:1).

Feedback colours (success #3ddc84, error = red-text) appear in forms only. Placeholder yellow (#f5b700) is staging-only, see Components.

### Named Rules
**The One Red Field Rule.** A page carries at most one full-bleed red section (home: Promotions). Elsewhere red is an accent, never a ground.

**The Opaque Token Rule.** Colour tokens are CSS variables, so Tailwind opacity modifiers on them (`bg-primary/20`, `border-border/50`) silently fail. For translucency use `black/xx` or `white/xx` (e.g. the `white/30` rules on the red field), or the pre-mixed tint tokens.

## Typography

**Display Font:** Orbitron (via `--font-orbitron`, sans-serif fallback)
**Body Font:** Rajdhani (via `--font-rajdhani`, system sans fallback), base weight 500
**Wordmark Font:** Tomorrow Black Italic (900 italic only, loaded in `HomeHero.tsx`), used for the giant "SPEEDY" behind the home hero phone and nowhere else

**Character:** Orbitron is wide and mechanical; it carries claims, figures and names. Rajdhani is narrow and runs small, so body steps sit one notch above a usual ramp (17px body, 19 to 22px lead).

### Hierarchy
- **Display / H1** (700, 40 to 72px fluid, 1.0, -0.02em): one per page; inner-page heroes, max ~20ch.
- **Home hero headline** (900, up to 72px, sized by width and height so the hero fits one screen): the questions large, the answer one step down at 700. Solid #fff.
- **Headline / H2** (700, 32 to 56px, 1.1): section headings.
- **Title / H3, H4** (600, 24 to 36px and 20 to 24px): card, step and service titles. TypeRows, the street address and footer phone use H3 size at 900.
- **Body-lg** (500, 19 to 22px, 1.6): intros and sublines, max 46 to 52ch.
- **Body** (500, 17px, 1.6): running text, nav, buttons (md).
- **Label / tag** (700, 13px, 0.08em, uppercase): figure captions, section indexes, form legends.

`h1` to `h4` get Orbitron and white by default. H5-level titles (FAQ questions, footer and sidebar column heads) are set in Rajdhani bold on purpose: they are read, not announced. Figures (step numbers, trust stats, phone numbers) are Orbitron with tabular numerals.

### Named Rules
**The Solid Headline Rule.** Headlines are solid bold white. No outline/hollow text, no scan-line, gradient-fill or texture on headline type.

**The Reading Face Rule.** Orbitron is for headlines and figures only. Buttons, labels, captions, nav, form text and FAQ questions are Rajdhani.

**The One Wordmark Rule.** Tomorrow's chamfered, slanted cuts are the electric voice of the hero wordmark only. It never sets a heading, a figure or a label; spreading it would turn the brand moment into a third body face.

**The No Kicker Rule.** The tag style is for captions and indexes, never as a label above a heading.

## Layout

- **Container:** 1280px max (1440px at 1920+), side margin `clamp(16px, 4vw, 64px)`. 12-column grid; gutter 16px, 24px at 768+, 32px at 1280+.
- **Spacing:** strict 4px grid (Tailwind key N = N x 4px; no fractional keys). Section padding `clamp(64px, 40px + 6.4vw, 128px)`.
- **Breakpoints (custom):** sm 375 (phone), md 768, lg 1024, xl 1280, 2xl 1440, 3xl 1920. `sm` is the phone itself: side-by-side layouts start at `md:` or later, never `sm:`.
- **Section rhythm:** every page section uses `Section`:
  - `layout="split"` (default): heading in 7 columns, intro and optional aside bottom-aligned in columns 9 to 12 from `lg`.
  - `layout="stack"`: single column, prose width.
  - `layout="side"`: sticky header in 4 columns, content in 8 (FAQs, long lists).
  - `tone="default" | "raised"` alternates true black and raised black down the page.
- **Inner-page hero:** headline in 7 columns, a captioned photograph (16:10) in 5, bottom-aligned, ruled off below. Without a photo it is a compact type-only band (FAQ, policies).
- **Home hero:** fills the first viewport under nav and banner. Centre stage: the cracked phone in front of a giant ghost-outline "SPEEDY" (Tomorrow Black Italic, no fill, 1.5 to 2px brand-red stroke at 55%). Corners: headline top-left, the "45 min" figure top-right, CTAs bottom-left, the visit card (walk-in pill, hours, address, trust stats) bottom-right. On phones it stacks, with the wordmark above the phone and overlapped by it.

## Elevation & Depth

Depth is tonal first (black, raised black, panel, surface) and then light falling on things: offset shadows that drop below, never zero-offset halos. Red glows are offset too, sitting under the primary button. Blur exists only on the sticky header, where content scrolls beneath it.

### Shadow Vocabulary
- **Lift 1** (`0 1px 2px rgb(0 0 0 / 0.6)`): hairline contact.
- **Lift 2** (`0 12px 28px -8px rgb(0 0 0 / 0.7)`): floating panels.
- **Lift 3** (`0 32px 64px -16px rgb(0 0 0 / 0.8)`): overlays.
- **Red glow sm / md / lg** (`0 10px 24px -14px`, `0 14px 32px -14px`, `0 20px 48px -18px`, brand red at 0.6 to 0.75): under primary buttons (sm) and hovered red affordances.
- **Focus ring** (`0 0 0 2px #000, 0 0 0 4px brand-red`): all focus-visible. On the red field it switches to a white 2px outline.

### Named Rules
**The Falling Light Rule.** Shadows have a y-offset and negative spread; no centred halo glows on boxes.

**The Solid Chrome Rule.** `glass` panels are solid (#0c0c0c, 1px #222 border), and so is the sticky header (solid black, hairline rule). No backdrop blur on panels or chrome.

## Shapes

Three radii in practice: 4px (chips inside fields, focus ring, placeholder tag), 8px (buttons and controls), 12px (panels, cards, photographs, embeds). Pills (9999px) only for the hero status tag and visit-card label, the mobile call button and progress rails. Hairline 1px rules carry most structure: section headers, ruled list rows, FAQ rows, footer bands.

## Components

### Buttons
Rajdhani 700, uppercase, 0.06em tracking: pressed, so set in the reading face.
- **Shape:** gently squared (8px).
- **Primary:** Counter Red fill, white text, red glow sm beneath; md 48px tall / 24px padding, lg 56px / 32px.
- **Hover / Active / Focus:** brighter red, deeper red on press; focus ring per Elevation. Transitions 200ms ease-out on colour and shadow only.
- **Secondary:** black fill, 1px border-strong stroke, white text; hover lifts to surface with a white stroke. On the red field it becomes a black button with a white focus outline.
- **Link:** red-text, underlined 1px at 4px offset, 2px on hover.
- Hero CTAs are wrapped in a magnetic hover.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** panel or surface on black; step cards are black on a raised section.
- **Border:** 1px #222.
- **Internal Padding:** 24px, 32px from `lg`.
- Cards are reserved for content with substance (steps, the featured service). Name-only content does not get a card.

### TypeRows
Short lists that are only names (values, who a plan is for, what you can finance) render as headline type (Orbitron 900, H3 size) on a 1px top rule, 2 to 4 columns from `md`. Never small cards.

### Ruled lists
Secondary services, promotions and FAQs are rows separated by 1px rules with a trailing arrow or action, hover turning the title red-text. FAQ is an accordion of ruled rows, questions in Rajdhani bold H5 size.

### Photographs
One treatment: 12px frame on surface, object-cover, optional bottom vignette (`transparent 45%` to black 82%) where text sits on the image. Hover on linked photos scales the image 1.03 to 1.04 over 480ms. Captions use the tag style in text-tertiary and say what the picture shows.

### Embed facades
Square booking, Jotform and Google Maps never load until asked. The idle state is a compact box (480 to 560px for booking/sign-up rather than the full 900px embed) with a dimmed photograph (40% under a black gradient) or a schematic street sketch as backdrop, a one-line description of who provides it, a primary "Load ..." button and a direct link out.

### Navigation
Sticky header, 64px (72px from `lg`), solid black with a hairline bottom rule. From `xl` it is a three-column grid: logo left, primary nav centred, CTA right. The nav shows the first four primary links as full-height tabs (Rajdhani 700, text-secondary to white, text-scramble on hover, never wrapping); a 2px brand-red rule grows along the header's bottom edge on hover and stays under the current page. The remaining links sit in a "More" disclosure (surface panel, red left edge on hover and current). Below `xl`, a mobile menu with every link. The header CTA shows from `md`; phones get a round tap-to-call button instead. Footer sits on raised black: logo, the phone number in Orbitron 900, a CTA, then four columns of 44px-tall links.

### Placeholder mark
Content flagged as placeholder shows a dashed yellow outline and a "Placeholder" tag on staging only. In production it renders plain. Never style it into the system.

## Do's and Don'ts

### Do:
- **Do** set headlines in solid bold white Orbitron, and everything read or pressed in Rajdhani.
- **Do** keep the home hero brand line "Speedy iRepair" red.
- **Do** start side-by-side layouts at `md:` (768) or later.
- **Do** use `black/xx` or `white/xx` for translucency; token colours do not take opacity modifiers.
- **Do** build sections with `Section`, alternating `default` and `raised` tones.
- **Do** pair inner-page hero headlines with one photograph from the site image set, captioned with what it shows.
- **Do** set name-only lists as TypeRows.
- **Do** put every third-party embed behind a click-to-load facade with a backdrop and a compact idle height.

### Don't:
- **Don't** use hollow/outlined text, scan-lines or textures on headlines.
- **Don't** use `sm:` for multi-column layouts; `sm` is a 375px phone.
- **Don't** run more than one full-red field on a page.
- **Don't** present the generated photographs as this shop, its bench, team or storefront.
- **Don't** box short name lists in cards.
- **Don't** show prices on repair or trade-in services (Shopify product prices are allowed).
- **Don't** place tag-style labels above headings as kickers.
- **Don't** use zero-offset halo shadows or backdrop blur on panels or chrome.

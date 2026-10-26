# Animation map (deliverable a)

Library hierarchy: **Lenis > GSAP > Framer Motion > Rive > React Bits**.
Tokens are in `lib/motion/tokens.ts`:
- Reveal 0.55 s, long reveal 0.7 s, micro 0.2 s, long micro 0.3 s, page 0.25 s, hero sequence ≤ 1.5 s.
- Stagger: words 0.05, items 0.08.
- Eases: entrances power3.out (Framer `[0.215,0.61,0.355,1]`), state transitions power2.inOut.

Only transforms and opacity are animated. The exceptions are the two accordion height tweens, which are contained.
The CSS before-states are gated on `html[data-motion="ok"]`, so there is no FOUC and no-JS visitors see the content.

Token note: the Design tokens define `--duration-slow 480ms` and `--ease-out cubic-bezier(0.16,1,0.3,1)`. Motion keeps the approved brief values (0.55 s, power3.out). CSS-only transitions (poster cross-fade, hover colours) use the Design tokens `duration-base` / `ease-out`.

| # | Element (route) | Trigger | Library | Purpose | Duration / ease | Reduced motion |
|---|---|---|---|---|---|---|
| 1 | Page scroll (all) | wheel / keys | Lenis (gsap.ticker) | Precise, synced smooth scroll | lerp 0.14, anchors 0.8 s | Off (native) |
| 2 | Route change (all) | navigation | Framer `PageTransition` | Continuity between pages | in 0.25 s power3.out, y 8→0; out 0.12 s | Opacity only, 0 s |
| 3 | Hero H1 (/, page heroes) | load | GSAP SplitText | First impression, readable fast | words yPercent 110→0, 0.55 s, stagger 0.05, done < 1.2 s | Plain text |
| 4 | Hero subline + CTAs | load | GSAP reveal | Sequenced after the H1 | 0.55 s power3.out, delay 0.15–0.3 | Visible |
| 5 | Hero CTAs | pointer near | React Bits Magnet | Tactile CTA | spring 320/24, max pull ~10 px | Off |
| 6 | Hero device (/) | load + idle + in view | R3F + drei (MeshTransmissionMaterial glass back) | Premium focal object; the poster is the LCP | Cross-fade 200 ms. Yaw ±0.32 rad / 7 s, bob 0.035 / 2.6 s, pointer tilt damped ~160 ms | Static poster (also on Save-Data, low power, no hardware GL, FPS < 30) |
| 7 | Section headings (all) | 85% in view | GSAP SplitText (`data-split`) | Hierarchy | 0.55 s, words 0.05 | Plain |
| 8 | Services grid C1–C8 (/) | 88% in view | GSAP `ScrollTrigger.batch` (`data-animate="stagger"`) | Scan the 8 offers | 0.55 s, stagger 0.08 | Visible |
| 9 | Service card hover (/, /services) | hover / focus | Framer `HoverCard` (or CSS on FE cards) | Affordance | lift −4 px + glow, 0.2 s power2.out | Colour only |
| 10 | Service icons (/, /services) | host hover / focus / click | `RiveIcon` (code-driven SVG; .riv later) | Delight, state feedback | Accent scale 1.12, y −1, 0.2 s. Click: spring pulse 700/18 | Static icon |
| 11 | /services 14 sections | 85% in view | GSAP reveal (`data-reveal="children"`) | Calm long-page rhythm | 0.55 s, stagger 0.08 | Visible |
| 12 | How It Works (/, /about) | scroll (pinned) | GSAP ScrollTrigger pin + scrub | Showpiece: 4 steps | ≥768: tiles tip over (rotX 14, y 4, α .55) and the active tile lifts (y −8). <768: card stack. Scrub 0.4, snap per step, bar scaleX | Plain list, all visible |
| 13 | Brand marquee (/) | always (in view) | React Bits LogoLoop | Social proof | 60 px/s, pauses on hover | Static wrapped list |
| 14 | Brand logos | hover | Framer `BrandLogo` | Monochrome → brand colour | 0.2 s | Instant |
| 15 | Why choose us (/) | hover / focus | Framer `ValueProps` (layoutId highlight) | Focus one value prop | 0.3 s power2.inOut | Highlight jumps |
| 16 | Parallax band (lab; available) | scroll | GSAP (`data-parallax`) | Depth | yPercent ±8, scrub | Static |
| 17 | FAQ, home | click | Framer `Accordion` | Disclosure | height 0.3 s inOut, content 0.2 s | Instant |
| 18 | FAQ, /faq | click | GSAP `Accordion engine="gsap"` / `data-faq` on `<details>` | Disclosure | open 0.3–0.42 s, close 0.25–0.3 s | Instant / native |
| 19 | Shop grid (/shop) | filter change | Framer `ShopGrid` (layout + presence) | Filter feedback | 0.3 s inOut | Instant |
| 20 | Quote / sell / contact forms | step change | Framer `MultiStepForm` | Orientation in multi-step lead capture (no prices) | slide x ±24 + fade 0.25 s, progress 0.3 s | Fade-free jump |
| 21 | Submit buttons | press / submit | `RiveButton` | Feedback: idle → loading → success/error | Press scale .97 0.2 s. Loading = shimmer sweep 1.1 s (no spinner, per Design) | Static "Sending…" |
| 22 | Loaders | while waiting | `RiveLoader` / `ShimmerBar` | Skeleton shimmer | 1.1 s linear | Static bar |
| 23 | Nav items (header) | hover | React Bits DecryptedText (`ScrambleText`) | Tech personality | about 6 × 30 ms | Plain |
| 24 | Cursor follower (desktop) | pointer | React Bits-style follower | Brand accent on interactive targets | spring, red on targets | Off; never on touch |

## Proposed extras (NOT built; need approval)
1. **Glass-back reveal turn:** a single scroll-linked 180° turn of the hero phone as the user leaves the hero, so the MeshTransmissionMaterial back is actually seen. Today the back is only visible at extreme pointer angles. Costs about 0 KB, but the transmission pass would run while visible.
2. **Number count-up** on "45 min / 90-day warranty" stats when they enter view (GSAP, 0.6 s).
3. **View Transitions API** for shop card → product page shared-element morph (Chrome only, progressive).
4. **Rive mascot / status micro-scene** in the How It Works final step (needs a designer's .riv).
5. **Footer map pin drop** (Framer spring, 0.4 s) on the location card.

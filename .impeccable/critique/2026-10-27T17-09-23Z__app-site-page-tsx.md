---
target: homepage hero and whole site
total_score: 18
max_score: 36
na_heuristics: 7
p0_count: 3
p1_count: 2
target_identity: "file:E:\\Projects\\speedy-irepairs\\Speedy-irepair\\app\\(site)\\page.tsx"
target_fingerprint: "sha256:9097297e24aaa7771f5dd9a3c115cd1ac60343012d35c26b040b7e364570e042"
target_path: "E:\\Projects\\speedy-irepairs\\Speedy-irepair\\app\\(site)\\page.tsx"
timestamp: 2026-10-27T17-09-23Z
slug: app-site-page-tsx
---
# Critique: Speedy iRepair homepage + all routes (2026-10-27)

Method: dual-agent (A: design review, B: detector + browser evidence)

## Heuristics (18/36, 7 n/a)
1 Status 2 | 2 Real world 2 (raw Zod enum error) | 3 Control 2 (mobile menu off-screen) | 4 Consistency 2 | 5 Error prevention 2 | 6 Recognition 3 | 7 n/a | 8 Aesthetic/minimalist 1 (placeholders, empty embeds, bare inner heroes) | 9 Error recovery 2 | 10 Help 2

## Priority issues
- P0 Mobile header overflows at 375-430px: sm breakpoint is 375px so header CTA (SiteHeader.tsx:36 `hidden sm:inline-flex`) shows; doc width 451px at 390, hamburger off-screen on every route.
- P0 Prices shown on /shop, product page, $40/month home-internet, FAQ $20 deposit; violates no-prices rule.
- P0 Placeholders and unverified stats public: yellow Placeholder chips (testimonials, /services x14, /about, /financing, /home-internet, /schedule-repair); TrustBar stats hardcoded (4.9 stars, 1000+ reviews).
- P1 Hero is the only authored surface; everything else is the dark-tech card kit (identical glass icon cards, 01-04 numbering, glow shadows, grid-line body texture, no photography on any inner page; inner heroes are bare H1 with 30% empty first screen).
- P1 Quote page cold: double heading, half-empty at 1440, no reassurance rail/tap-to-call, Zod error copy, notice-box success.
- P2 Type system loose: Orbitron on buttons/FAQ questions/footer labels; 10 sizes; display tracking -0.02/-0.01/+0.03/+0.04em; body Rajdhani 14px #a0a0a0; #777 footer text 4.4:1; mixed #fff/#f0f0f0; 5 radius values.

## Minor
Footer/nav tap targets 18-25px tall; banner sells free smartphone with home internet above a repair hero; FAQ answers 104-156 chars/line; ValueProps tabIndex=0 dead stops; dead CSS (.text-gradient-brand, --ease-spring); How It Works bar full in static state; sold-out product with active Add to Cart.

# DESIGN_TOKENS

**Source of truth: `/workspace/speedy-irepair/design/`** (`tokens.css`, `tokens.json`, `tailwind.theme.snippet.ts`, `HANDOFF.md`). These are final (Design lane).

- `web/styles/tokens.css` is a **byte-identical copy** of `design/tokens.css`. Re-copy it on change and never edit it in web/. `globals.css` imports it.
- `web/tailwind.config.ts` maps every value to the CSS variables. The colours, font sizes, radii, shadows (`shadow-1/2/3/glow/focus`), durations, easings, max-widths, z-index, heights and screens (375/768/1024/1280/1440/1920) all equal `speedyTheme`.

## Brand reds (Design §Token usage)
| Token | Hex | Use |
|---|---|---|
| `brand` | #ED1C24 | logo and decorative only. **No white text on it** (4.38:1, fails AA) |
| `primary` / `primary-hover` / `primary-active` | #D9161E / … | button and fill backgrounds, with `text-white` / `text-text-inverse` |
| `primary-text` | #FF4D53 | small red text on dark backgrounds |

**Font:** Inter via `next/font/google` (`--font-inter`). `tokens.css` sets `--font-sans: var(--font-inter, "Inter"), …`, and `globals.css` adds `font-feature-settings: "cv11","ss03"`. Headings use `text-wrap: balance` and paragraphs use `pretty`.

## Spacing: one deliberate difference
Design's snippet overrides Tailwind's spacing keys with an 8px-step scale (`p-1`=8px, `p-2`=16, `p-3`=24, `0.5`=4).
web/ keeps a **4px-grid numeric scale** (`p-1`=4px, `p-2`=8, `p-4`=16, `p-6`=24 …), because ~100 committed components already use it. Design's tokens are also exposed **by name**:

| Design class | web/ equivalent |
|---|---|
| `p-0.5` (4px) | `p-1` or `p-s-0-5` |
| `p-1` (8px) | `p-2` or `p-s-1` |
| `p-2` (16px) | `p-4` or `p-s-2` |
| `p-3` (24px) | `p-6` or `p-s-3` |
| `p-4` (32px) | `p-8` or `p-s-4` |
| `p-6` (48px) | `p-12` or `p-s-6` |
| `p-8` (64px) | `p-16` or `p-s-8` |
| `p-12` (96px) | `p-24` or `p-s-12` |
| `p-16` (128px) | `p-32` or `p-s-16` |

Layout helpers: `py-section`, `px-page` and `gap-gutter`.

Prefer multiples of 8px (even numeric keys). Odd keys (`p-5`=20px, `p-7`=28px …) are on the 4px grid but off Design's scale. Use them only for optical tweaks inside components.

## Don'ts (Design HANDOFF)
- No raw hex in components. The one exception is the staging-only `placeholder` marker colour in tailwind.config, which is not a brand token.
- No spinners: use skeletons.
- No second accent colour, and no stock icon packs.
- No prices on /instant-quote or /sell-your-device.

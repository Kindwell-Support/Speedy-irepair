import type { Config } from "tailwindcss";

/**
 * Speedy iRepair Tailwind config: the single source of design tokens for utilities.
 * Values reference CSS custom properties defined in styles/tokens.css (owned by Design Lead,
 * copied from /workspace/speedy-irepair/design/tokens.css v0.1). See docs/DESIGN_TOKENS.md.
 *
 * SPACING: replaced (not extended) with a strict 4px grid. Every key N = N * 4px, so
 * fractional Tailwind defaults (0.5, 1.5, 2.5, 3.5) do not exist. Design's 8px "space-N"
 * names are available as `s-1 … s-16` (s-1 = 8px) for parity with design files.
 */
const fourPx = (steps: number[]): Record<string, string> =>
  Object.fromEntries(steps.map((n) => [String(n), `${n * 4}px`]));

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./sanity/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "375px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
    },
    spacing: {
      px: "1px",
      ...fourPx([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 112, 128, 160, 192, 240]),
      "s-0-5": "var(--space-0-5)",
      "s-1": "var(--space-1)",
      "s-2": "var(--space-2)",
      "s-3": "var(--space-3)",
      "s-4": "var(--space-4)",
      "s-6": "var(--space-6)",
      "s-8": "var(--space-8)",
      "s-12": "var(--space-12)",
      "s-16": "var(--space-16)",
      section: "var(--section-pad-y)",
      page: "var(--page-margin)",
      gutter: "var(--grid-gutter)",
    },
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-raised": "var(--color-bg-raised)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "surface-3": "var(--color-surface-3)",
        overlay: "var(--color-overlay)",
        "border-subtle": "var(--color-border-subtle)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        text: "var(--color-text)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-disabled": "var(--color-text-disabled)",
        "text-inverse": "var(--color-text-inverse)",
        brand: "var(--color-brand)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-active": "var(--color-primary-active)",
        "primary-disabled": "var(--color-primary-disabled)",
        "primary-text": "var(--color-primary-text)",
        "primary-tint": "var(--color-primary-tint)",
        "primary-glow": "var(--color-primary-glow)",
        "focus-ring": "var(--color-focus-ring)",
        "brand-border": "var(--color-brand-border)",
        "brand-border-hover": "var(--color-brand-border-hover)",
        glass: "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
        "glass-border-hover": "var(--glass-border-hover)",
        success: "var(--color-success)",
        "success-tint": "var(--color-success-tint)",
        error: "var(--color-error)",
        "error-tint": "var(--color-error-tint)",
        placeholder: "#f5b700",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--leading-display)", letterSpacing: "var(--tracking-display)", fontWeight: "800" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--leading-h1)", letterSpacing: "var(--tracking-h1)", fontWeight: "700" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--leading-h2)", letterSpacing: "var(--tracking-h2)", fontWeight: "700" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--leading-h3)", letterSpacing: "var(--tracking-h3)", fontWeight: "600" }],
        h4: ["var(--text-h4)", { lineHeight: "var(--leading-h4)", letterSpacing: "var(--tracking-h4)", fontWeight: "600" }],
        h5: ["var(--text-h5)", { lineHeight: "var(--leading-tight)", fontWeight: "600" }],
        h6: ["var(--text-h6)", { lineHeight: "var(--leading-tight)", fontWeight: "600" }],
        "body-lg": ["var(--text-body-lg)", { lineHeight: "var(--leading-body)" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        "body-sm": ["var(--text-body-sm)", { lineHeight: "var(--leading-snug)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--leading-snug)" }],
        label: ["var(--text-label)", { lineHeight: "1", letterSpacing: "var(--tracking-label)", fontWeight: "600" }],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        glass: "var(--shadow-glass)",
        glow: "var(--glow-primary)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-md": "var(--shadow-glow-md)",
        "glow-lg": "var(--shadow-glow-lg)",
        focus: "var(--focus-ring)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        in: "var(--ease-in)",
        spring: "var(--ease-spring)",
      },
      maxWidth: {
        container: "var(--container-max)",
        wide: "var(--container-wide)",
        prose: "var(--container-prose)",
      },
      zIndex: {
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        sticky: "var(--z-sticky)",
        banner: "var(--z-banner)",
        nav: "var(--z-nav)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      height: {
        "control-sm": "var(--control-h-sm)",
        "control-md": "var(--control-h-md)",
        "control-lg": "var(--control-h-lg)",
        nav: "var(--nav-h)",
        "nav-desktop": "var(--nav-h-desktop)",
        banner: "var(--banner-h)",
      },
      minHeight: {
        "control-md": "var(--control-h-md)",
        banner: "var(--banner-h)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { CSSProperties } from "react";

/**
 * The ONLY sanctioned way to use the `style` prop (see docs/CODE_REVIEW.md, rule "no inline styles").
 * Passes CSS custom properties (e.g. `--delay`, `--progress`) to an element so Tailwind / CSS can
 * consume them. Keys must start with `--`.
 *
 *   <div style={cssVars({ "--progress": 0.5 })} className="[width:calc(var(--progress)*100%)]" />
 */
export type CssVarName = `--${string}`;
export type CssVars = Partial<Record<CssVarName, string | number>>;

export function cssVars(vars: CssVars): CSSProperties {
  return vars as CSSProperties;
}

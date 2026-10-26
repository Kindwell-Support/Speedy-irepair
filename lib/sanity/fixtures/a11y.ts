import type { A11yCopy } from "../types";

/**
 * CMS v1.5 fallback for getA11yCopy() (uiCopy.a11y). Mirrors components/ui/a11yStrings A11Y, which lib/
 * may not import (layer boundary). The seed is generated from A11Y, so Sanity starts identical.
 */
export const a11yCopy: A11yCopy = {
  loading: "Loading",
  opensInNewTab: " (opens in a new tab)",
};

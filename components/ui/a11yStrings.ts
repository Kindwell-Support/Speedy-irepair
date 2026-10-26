/**
 * Non-editable accessibility chrome (screen-reader-only text). Not marketing copy. CMS v1.5 mirrors
 * `loading` / `opensInNewTab` in uiCopy.a11y (getA11yCopy()); routes pass that down where practical and
 * these constants are the fallback. Kept in one place so it can be localised later.
 */
export const A11Y = {
  loading: "Loading",
  opensInNewTab: " (opens in a new tab)",
  opensMapsInNewTab: " (opens Google Maps in a new tab)",
  openMenu: "Open menu",
  /** Landmark name for the site-wide promo banner (design role="region" aria-label="Announcement"). */
  announcement: "Announcement",
  closeMenu: "Close menu",
  /** Star row label, e.g. "4 out of 5 stars". */
  starRating: (rating: number) => `${rating} out of 5 stars`,
} as const;

/** Shape routes pass to client components (getA11yCopy() result, or this fallback). */
export type A11yProps = { loading: string; opensInNewTab: string };

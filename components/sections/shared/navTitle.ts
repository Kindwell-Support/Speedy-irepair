/**
 * Short label for compact navigation (services index, jump chips): the CMS title without a trailing
 * spec parenthetical, e.g. "Prepaid Phone Plans (Simple Mobile, AT&T, Verizon)" -> "Prepaid Phone Plans".
 * Section headings keep the full CMS title.
 */
export const navTitle = (title: string): string => title.replace(/\s*\([^)]*\)\s*$/, "") || title;

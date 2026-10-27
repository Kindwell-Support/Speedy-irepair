import type { ReactNode } from "react";

/** Decorative line icons from design/pages/*.html (24px grid, 1.5 stroke, currentColor). Always aria-hidden. */
const PATHS = {
  quote: (
    <>
      <path d="M4 6h16v10H8l-4 3.5z" />
      <path d="M8 10h8" />
      <path d="M8 13h5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  wrench: (
    <path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.6 2.6-2.4-.6-.6-2.4z" />
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18" />
      <path d="M12 9v11" />
      <path d="M12 9C10 5 7 5 7 7s5 2 5 2 5 0 5-2-3-2-5 2z" />
    </>
  ),
  wifi: (
    <>
      <path d="M3 9.5a13 13 0 0 1 18 0" />
      <path d="M6 13a8.5 8.5 0 0 1 12 0" />
      <path d="M9 16.4a4 4 0 0 1 6 0" />
      <path d="M12 19.5h.01" strokeWidth="2.4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M7 14.5h4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9H3z" />
      <path d="M14 9.5h3.5l3 3v3H14" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5" />
      <path d="M20 4.5v5h-5" />
      <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5" />
      <path d="M4 19.5v-5h5" />
    </>
  ),
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  tag: (
    <>
      <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <rect x="3.5" y="14" width="4" height="6" rx="1.5" />
      <rect x="16.5" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M8.8 14l-1.3 6.5L12 18l4.5 2.5-1.3-6.5" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M8 16L16 8" />
      <path d="M9 8h7v7" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  cart: (
    <>
      <path d="M3.5 4.5h2l2.2 10.5h10.3l2-7.5H7" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type LineIconName = keyof typeof PATHS;

export function LineIcon({
  name,
  size = 24,
  className,
}: {
  name: LineIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

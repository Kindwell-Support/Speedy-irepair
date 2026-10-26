import type { ReactNode } from "react";
import type { LeadIconKey } from "@/lib/sanity/types";

/** Line icons from design/pages/{instant-quote,sell-your-device}.html (24px grid, 1.5 stroke). */
const PATHS: Record<LeadIconKey | "alert" | "arrow" | "search", ReactNode> = {
  phone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M9.5 6.5l3 3-2.2 2.2 3.6 3.8" />
      <path d="M11 18.5h2" />
    </>
  ),
  tablet: (
    <>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  watch: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="3" />
      <path d="M9 6.5L9.5 3h5l.5 3.5" />
      <path d="M9 17.5l.5 3.5h5l.5-3.5" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M3 18.5h18" />
    </>
  ),
  other: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="2.6" />,
  battery: (
    <>
      <rect x="3" y="7.5" width="16" height="9" rx="2" />
      <path d="M21 10.5v3" />
      <path d="M6.5 10.5v3" />
      <path d="M9.5 10.5v3" />
    </>
  ),
  port: (
    <>
      <path d="M9 3v5" />
      <path d="M15 3v5" />
      <path d="M7 8h10v3a5 5 0 0 1-10 0z" />
      <path d="M12 16v5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z" />
      <circle cx="12" cy="13.2" r="3.3" />
    </>
  ),
  water: <path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5z" />,
  badge: (
    <>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="M9 14.2L8 21l4-2 4 2-1-6.8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  power: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5" />
      <path d="M12 15.8h.01" strokeWidth="2.2" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5" />
      <path d="M12 15.8h.01" strokeWidth="2.2" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
};

export type LeadIconName = keyof typeof PATHS;

export function LeadIcon({
  name,
  size = 24,
  className,
}: {
  name: LeadIconName;
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
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

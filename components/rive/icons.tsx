/**
 * Code-driven fallback icon set (used until real .riv files are authored).
 * 24x24, 1.6px strokes, white base + red accent part. The accent group is what
 * reacts to the state machine inputs (hover -> lift/scale, click -> pulse).
 */
import type { ReactNode } from "react";

export type IconArt = { base: ReactNode; accent: ReactNode };

const Phone = ({ h = 20 }: { h?: number }) => <rect x="6.5" y="2" width="11" height={h} rx="2.5" />;

export const ICON_ART = {
  "smartphone-repair": {
    base: (<><Phone /><path d="M10.5 19h3" /></>),
    accent: <path d="M9.25 11.25l2 2 3.5-4" />,
  },
  "screen-repair": {
    base: (<><Phone /><path d="M10.5 19h3" /></>),
    accent: <path d="M9 5.5l2.5 3.5-2 2 3.5 4.5M11.5 9l3-1" />,
  },
  battery: {
    base: (<><rect x="2.5" y="7" width="16.5" height="10" rx="2.25" /><path d="M21.5 10.5v3" /></>),
    accent: <path d="M11.5 8.75L9 12.25h3.25L9.75 15.5" />,
  },
  "charger-port": {
    base: (<><path d="M9 2.5v4.5M15 2.5v4.5" /><path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z" /></>),
    accent: <path d="M12 16v5.5" />,
  },
  camera: {
    base: (<><rect x="2.75" y="6.25" width="18.5" height="13" rx="3" /><path d="M8.25 6.25L9.75 4h4.5l1.5 2.25" /></>),
    accent: <circle cx="12" cy="12.75" r="3.5" />,
  },
  "water-damage": {
    base: (<><Phone /><path d="M10.5 19h3" /></>),
    accent: <path d="M12 6.75c1.9 2.4 2.9 4 2.9 5.4a2.9 2.9 0 0 1-5.8 0c0-1.4 1-3 2.9-5.4z" />,
  },
  "device-unlocking": {
    base: <rect x="5" y="11" width="14" height="10" rx="2.25" />,
    accent: (<><path d="M8.25 11V7.5a3.75 3.75 0 0 1 7.2-1.5" /><path d="M12 15v2" /></>),
  },
  "pre-owned": {
    base: (<><rect x="4.5" y="2" width="10.5" height="19" rx="2.5" /><path d="M8.5 18h2.5" /></>),
    accent: (<><circle cx="17" cy="16.5" r="4.25" /><path d="M15.25 16.5l1.25 1.25 2.25-2.5" /></>),
  },
  "sell-trade": {
    base: <path d="M4 8h14.5M20 16H5.5" />,
    accent: <path d="M15.5 5l3 3-3 3M8.5 13l-3 3 3 3" />,
  },
  "prepaid-plans": {
    base: <path d="M7 2.5h7.5l3.5 3.5v15.5H7z" />,
    accent: (<><rect x="9.25" y="11" width="5.5" height="6.5" rx="1" /><path d="M12 11v6.5" /></>),
  },
  "bill-payment": {
    base: <path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z" />,
    accent: <path d="M9 7.5h6M9 11h6M9 14.5h3.5" />,
  },
  "home-internet": {
    base: <path d="M3.5 10.5L12 3.75l8.5 6.75V20.5h-17z" />,
    accent: (<><path d="M8.5 13.5a5 5 0 0 1 7 0" /><path d="M10.4 15.9a2.2 2.2 0 0 1 3.2 0" /><circle cx="12" cy="18" r="0.6" /></>),
  },
  financing: {
    base: (<><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19" /></>),
    accent: <path d="M6 15h4.5M14.5 15h3" />,
  },
  accessories: {
    base: <path d="M4 14.5V12a8 8 0 0 1 16 0v2.5" />,
    accent: (<><rect x="3" y="14" width="4" height="6.5" rx="1.5" /><rect x="17" y="14" width="4" height="6.5" rx="1.5" /></>),
  },
  "replacement-parts": {
    base: (<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9.5 2.5V6M14.5 2.5V6M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5" /></>),
    accent: <rect x="9.5" y="9.5" width="5" height="5" rx="1" />,
  },
} satisfies Record<string, IconArt>;

export type IconArtId = keyof typeof ICON_ART;

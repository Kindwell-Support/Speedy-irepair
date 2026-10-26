/**
 * Motion tokens — single source of truth for timing/easing (spec §3 / §3.1, REQ-141).
 * Fast, precise, confident. No slow dreamy floats.
 */
export const DUR = {
  micro: 0.2, // hover / press / icon state
  microLong: 0.3,
  reveal: 0.55, // section + card reveals (0.4–0.7)
  revealLong: 0.7,
  page: 0.25, // route transition
  heroTotal: 1.5, // hero sequence must finish by this (<= 1.5–2s)
} as const;

export const STAGGER = {
  chars: 0.012,
  words: 0.05,
  items: 0.08, // services grid 0.06–0.1
  tight: 0.05,
} as const;

export const EASE = {
  out: "power3.out", // entrances
  outSoft: "power2.out",
  inOut: "power2.inOut", // transitions between states
} as const;

/** Framer Motion equivalents (cubic-bezier) of the GSAP eases above. */
export const FM_EASE = {
  out: [0.215, 0.61, 0.355, 1] as [number, number, number, number], // ~power3.out
  outSoft: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // ~power2.out
  inOut: [0.455, 0.03, 0.515, 0.955] as [number, number, number, number], // ~power2.inOut
};

/** Shared reveal distance in px (transform only). */
export const REVEAL_Y = 24;

export const BREAKPOINTS = {
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export const MQ = {
  motionOk: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

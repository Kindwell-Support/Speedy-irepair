/**
 * Hero repair scene layout. The phone renders (public/images/hero/phone-*.webp) share one frame, so the
 * impact point and shard landing spots are fractions of the phone box (0–1), not pixels.
 */

/** Centre of the impact crater in the cracked render. The repaired screen heals outward from here. */
export const IMPACT = { x: 0.86, y: 0.68 };

export type Shard = {
  /** public/images/hero/shard-{img}.webp */
  img: 1 | 2 | 3 | 4 | 5;
  /** Resting position: left/top of the shard box, as a percentage of the hero section. */
  x: string;
  y: string;
  /** Desktop width in px (scaled down on small screens via --shard-k). */
  w: number;
  rot: number;
  /** near = big + defocused in front, far = small + dim behind. */
  depth: "near" | "mid" | "far";
  mobile?: boolean;
  /** Landing spot on the phone (fraction of the phone box), clustered around IMPACT. */
  tx: number;
  ty: number;
};

/** Desktop: the phone sits in the middle third, so shards ring it and fill the empty middle band of the
 *  side columns (between headline/picker on the left and figure/card on the right), never the corners. */
export const SHARDS: Shard[] = [
  { img: 3, x: "58%", y: "-8%", w: 230, rot: 16, depth: "near", mobile: true, tx: 0.8, ty: 0.6 },
  { img: 4, x: "31%", y: "76%", w: 210, rot: 38, depth: "near", tx: 0.74, ty: 0.72 },
  { img: 2, x: "74%", y: "42%", w: 150, rot: -14, depth: "mid", mobile: true, tx: 0.9, ty: 0.64 },
  { img: 1, x: "2%", y: "22%", w: 120, rot: -22, depth: "mid", tx: 0.84, ty: 0.56 },
  { img: 5, x: "56%", y: "86%", w: 120, rot: 58, depth: "mid", tx: 0.78, ty: 0.78 },
  { img: 1, x: "42%", y: "2%", w: 90, rot: 132, depth: "far", mobile: true, tx: 0.88, ty: 0.74 },
  { img: 2, x: "89%", y: "58%", w: 96, rot: 28, depth: "far", tx: 0.92, ty: 0.7 },
  { img: 5, x: "5%", y: "44%", w: 88, rot: -66, depth: "far", tx: 0.82, ty: 0.66 },
  { img: 4, x: "47%", y: "93%", w: 100, rot: 96, depth: "far", tx: 0.9, ty: 0.58 },
];

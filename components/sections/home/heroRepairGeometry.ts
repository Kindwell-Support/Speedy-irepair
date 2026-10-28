/**
 * Hero repair scene layout. The phone renders (public/images/hero/phone-*.webp) share one frame, so the
 * impact point and shard landing spots are fractions of the phone box (0–1), not pixels.
 */

/** Centre of the impact crater in the cracked render. The repaired screen heals outward from here. */
export const IMPACT = { x: 0.735, y: 0.62 };

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

/** Desktop: the phone stands at the centre, so shards ring it in the band between the headline/CTAs on
 *  the left and the repair list on the right, never over copy. */
export const SHARDS: Shard[] = [
  { img: 3, x: "58%", y: "-6%", w: 210, rot: 16, depth: "near", mobile: true, tx: 0.675, ty: 0.54 },
  { img: 4, x: "38%", y: "78%", w: 190, rot: 38, depth: "near", tx: 0.615, ty: 0.66 },
  { img: 2, x: "66%", y: "34%", w: 130, rot: -14, depth: "mid", mobile: true, tx: 0.775, ty: 0.58 },
  { img: 5, x: "52%", y: "88%", w: 110, rot: 58, depth: "mid", tx: 0.655, ty: 0.72 },
  { img: 1, x: "40%", y: "6%", w: 84, rot: 132, depth: "far", mobile: true, tx: 0.755, ty: 0.68 },
  { img: 2, x: "33%", y: "60%", w: 88, rot: 28, depth: "far", tx: 0.795, ty: 0.64 },
];

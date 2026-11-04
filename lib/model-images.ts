import type { Device } from "@/lib/repair-catalog";

/**
 * Product photos for the /repair model step, so visitors can check the phone they picked is theirs. Phones only.
 * Files live in public/images/models/<slug>.webp: manufacturer images (Apple's "Identify your iPhone model" page,
 * Samsung, Google, Motorola, LG), flattened onto white and trimmed. A model without a file has no photo, and the
 * widget skips the "Is this your phone?" check for it. When adding a model to lib/repair-catalog.ts, drop its photo
 * in that folder and add its size here.
 */
const SIZES: Record<string, [width: number, height: number]> = {
  "galaxy-a15": [406, 771],
  "galaxy-a16": [430, 827],
  "galaxy-a25": [404, 775],
  "galaxy-a35": [459, 872],
  "galaxy-a36": [424, 809],
  "galaxy-a37": [433, 826],
  "galaxy-a55": [456, 870],
  "galaxy-a56": [422, 807],
  "galaxy-a57": [425, 818],
  "galaxy-s22": [385, 733],
  "galaxy-s22-ultra": [424, 821],
  "galaxy-s23": [383, 727],
  "galaxy-s23-plus": [411, 783],
  "galaxy-s23-ultra": [423, 814],
  "galaxy-s24": [390, 745],
  "galaxy-s24-fe": [426, 820],
  "galaxy-s24-plus": [418, 803],
  "galaxy-s24-ultra": [436, 825],
  "galaxy-s25": [390, 745],
  "galaxy-s25-edge": [463, 891],
  "galaxy-s25-fe": [422, 817],
  "galaxy-s25-plus": [418, 803],
  "galaxy-s25-ultra": [429, 827],
  "galaxy-s26": [361, 781],
  "galaxy-s26-fe": [424, 817],
  "galaxy-s26-plus": [416, 799],
  "galaxy-s26-ultra": [394, 857],
  "galaxy-z-flip6": [415, 863],
  "galaxy-z-flip7": [466, 521],
  "galaxy-z-flip8": [395, 442],
  "galaxy-z-fold6": [412, 841],
  "galaxy-z-fold7": [438, 872],
  "galaxy-z-fold8": [597, 864],
  "galaxy-z-fold8-ultra": [434, 864],
  "iphone-11": [812, 601],
  "iphone-11-pro": [960, 701],
  "iphone-11-pro-max": [960, 720],
  "iphone-12": [960, 661],
  "iphone-12-mini": [960, 667],
  "iphone-12-pro": [808, 740],
  "iphone-12-pro-max": [819, 756],
  "iphone-13": [960, 625],
  "iphone-13-mini": [960, 611],
  "iphone-13-pro": [960, 652],
  "iphone-13-pro-max": [960, 689],
  "iphone-14": [960, 615],
  "iphone-14-plus": [960, 642],
  "iphone-14-pro": [960, 720],
  "iphone-14-pro-max": [960, 759],
  "iphone-15": [960, 681],
  "iphone-15-plus": [960, 717],
  "iphone-15-pro": [960, 718],
  "iphone-15-pro-max": [960, 755],
  "iphone-16": [960, 685],
  "iphone-16-plus": [960, 719],
  "iphone-16-pro": [960, 722],
  "iphone-16-pro-max": [960, 759],
  "iphone-16e": [622, 707],
  "iphone-17": [960, 651],
  "iphone-17-pro": [960, 695],
  "iphone-17-pro-max": [960, 726],
  "iphone-17e": [746, 711],
  "iphone-18-pro": [960, 721],
  "iphone-18-pro-max": [960, 760],
  "iphone-air": [960, 717],
  "iphone-duo": [960, 528],
  "iphone-se-2nd-gen": [852, 738],
  "iphone-se-3rd-gen": [864, 822],
  "lg-g8-thinq": [459, 960],
  "lg-k92": [486, 960],
  "lg-stylo-6": [480, 960],
  "lg-v60-thinq": [482, 960],
  "lg-velvet": [469, 960],
  "moto-g-5g": [459, 914],
  "moto-g-play": [458, 914],
  "moto-g-power": [485, 960],
  "moto-g-stylus": [447, 890],
  "motorola-edge": [431, 847],
  "motorola-razr": [426, 891],
  "motorola-razr-plus": [426, 893],
  "pixel-10": [628, 754],
  "pixel-10-pro": [628, 761],
  "pixel-10-pro-fold": [373, 816],
  "pixel-10-pro-xl": [677, 814],
  "pixel-10a": [328, 379],
  "pixel-11": [310, 375],
  "pixel-11-pro": [310, 375],
  "pixel-11-pro-fold": [204, 403],
  "pixel-11-pro-xl": [330, 399],
  "pixel-7": [320, 396],
  "pixel-7-pro": [338, 414],
  "pixel-7a": [320, 389],
  "pixel-8": [317, 382],
  "pixel-8-pro": [352, 415],
  "pixel-8a": [327, 398],
  "pixel-9": [316, 384],
  "pixel-9-pro": [320, 383],
  "pixel-9-pro-fold": [196, 412],
  "pixel-9-pro-xl": [349, 417],
  "pixel-9a": [328, 386],
};

export interface ModelImage {
  src: string;
  width: number;
  height: number;
}

/** "Galaxy S26+" -> "galaxy-s26-plus", "iPhone SE (3rd gen)" -> "iphone-se-3rd-gen". */
export const modelSlug = (model: string) =>
  model
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function modelImage(device: Device | null, model: string | null): ModelImage | null {
  if (device !== "Phone" || !model) return null;
  const slug = modelSlug(model);
  const size = SIZES[slug];
  return size ? { src: `/images/models/${slug}.webp`, width: size[0], height: size[1] } : null;
}

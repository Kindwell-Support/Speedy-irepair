/**
 * Photographs in public/images/site. The store* images are real photos of the shop. The rest are generated pictures
 * of repair work: they show the trade, so their alt text never claims them as Speedy iRepair's bench or team.
 */
export type SiteImage = { src: string; alt: string; width: number; height: number };

export const SITE_IMAGES = {
  bench: {
    src: "/images/site/bench.webp",
    alt: "An opened phone held by a suction cup on an anti-static mat, under a white work lamp",
    width: 2000,
    height: 1116,
  },
  screenLift: {
    src: "/images/site/screen-lift.webp",
    alt: "Gloved hands lifting a cracked phone screen with a suction cup and a blue pry tool",
    width: 1856,
    height: 2304,
  },
  boardMacro: {
    src: "/images/site/board-macro.webp",
    alt: "Tweezers lifting a flex connector on a phone logic board",
    width: 2000,
    height: 1342,
  },
  battery: {
    src: "/images/site/battery.webp",
    alt: "A new battery being placed into an opened phone",
    width: 1856,
    height: 2304,
  },
  microsolder: {
    src: "/images/site/microsolder.webp",
    alt: "Soldering iron working on a phone logic board under a red stereo microscope",
    width: 2000,
    height: 1342,
  },
  devices: {
    src: "/images/site/devices.webp",
    alt: "Phones and a tablet laid out on a workbench beside precision screwdrivers",
    width: 2000,
    height: 1116,
  },
  counter: {
    src: "/images/site/counter.webp",
    alt: "A phone waiting on a dark shop counter, with lit tool shelves behind",
    width: 2000,
    height: 1116,
  },
  storeFront: {
    src: "/images/site/store-front.webp",
    alt: "The Speedy iRepair sign and front door on a sunny day",
    width: 1536,
    height: 2048,
  },
  storeFrontWide: {
    src: "/images/site/store-front-wide.webp",
    alt: "The Speedy iRepair sign and front door on a sunny day",
    width: 1536,
    height: 960,
  },
  storeExterior: {
    src: "/images/site/store-exterior.webp",
    alt: "The Speedy iRepair storefront seen from the sidewalk",
    width: 1536,
    height: 2048,
  },
  storeCounter: {
    src: "/images/site/store-counter.webp",
    alt: "Inside Speedy iRepair: the glass counter, branded floor mat and accessories wall",
    width: 1536,
    height: 2048,
  },
  storeTrophy: {
    src: "/images/site/store-trophy.webp",
    alt: "A trophy on the glass counter inside Speedy iRepair, above the branded floor mat",
    width: 1536,
    height: 2048,
  },
  port: {
    src: "/images/site/port.webp",
    alt: "A USB-C charging port being cleaned with a fine brush under a light",
    width: 1856,
    height: 2304,
  },
} satisfies Record<string, SiteImage>;

export type SiteImageKey = keyof typeof SITE_IMAGES;

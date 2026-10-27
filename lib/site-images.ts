/**
 * Generated photographs of repair work (public/images/site). They show the trade, not this shop or its staff:
 * captions say what the picture is and never claim it as Speedy iRepair's bench, team or storefront.
 */
export type SiteImage = { src: string; alt: string; caption: string; width: number; height: number };

export const SITE_IMAGES = {
  bench: {
    src: "/images/site/bench.webp",
    alt: "An opened phone held by a suction cup on an anti-static mat, under a white work lamp",
    caption: "Screen replacement on the bench",
    width: 2000,
    height: 1116,
  },
  screenLift: {
    src: "/images/site/screen-lift.webp",
    alt: "Gloved hands lifting a cracked phone screen with a suction cup and a blue pry tool",
    caption: "Lifting a cracked display",
    width: 1856,
    height: 2304,
  },
  boardMacro: {
    src: "/images/site/board-macro.webp",
    alt: "Tweezers lifting a flex connector on a phone logic board",
    caption: "Reseating a flex connector",
    width: 2000,
    height: 1342,
  },
  battery: {
    src: "/images/site/battery.webp",
    alt: "A new battery being placed into an opened phone",
    caption: "Fitting a new battery",
    width: 1856,
    height: 2304,
  },
  microsolder: {
    src: "/images/site/microsolder.webp",
    alt: "Soldering iron working on a phone logic board under a red stereo microscope",
    caption: "Board-level work under the microscope",
    width: 2000,
    height: 1342,
  },
  devices: {
    src: "/images/site/devices.webp",
    alt: "Phones and a tablet laid out on a workbench beside precision screwdrivers",
    caption: "Phones and a tablet on the bench",
    width: 2000,
    height: 1116,
  },
  port: {
    src: "/images/site/port.webp",
    alt: "A USB-C charging port being cleaned with a fine brush under a light",
    caption: "Cleaning a charging port",
    width: 1856,
    height: 2304,
  },
} satisfies Record<string, SiteImage>;

export type SiteImageKey = keyof typeof SITE_IMAGES;

/**
 * Repair intake catalog (components/repair-intake): device → brand → model, plus the issues each device can have.
 * Static and client-safe. Every brand and model list the widget shows ends with OTHER, which reveals a free-text box.
 */
export const OTHER = "Other / not listed";

export const DEVICES = ["Phone", "Tablet", "Laptop", "Game Console", "Other"] as const;
export type Device = (typeof DEVICES)[number];

const ISSUES = ["Cracked Screen", "Battery Replacement", "Water Damage", "Charging Port", "Software Issue", "Other"] as const;
const CONSOLE_ISSUES = ["Cracked Screen", "HDMI Port", "Water Damage", "Charging Port", "Software Issue", "Other"] as const;
export const ISSUE_OTHER = "Other";

interface DeviceNode {
  /** Brand → its models, newest first. "Other" brands carry no models, so the model step goes straight to free text. */
  brands: Record<string, readonly string[]>;
  issues: readonly string[];
}

export const CATALOG: Record<Device, DeviceNode> = {
  Phone: {
    brands: {
      Apple: [
        "iPhone 17 Pro Max",
        "iPhone 17 Pro",
        "iPhone Air",
        "iPhone 17",
        "iPhone 16 Pro Max",
        "iPhone 16 Pro",
        "iPhone 16 Plus",
        "iPhone 16",
        "iPhone 16e",
        "iPhone 15 Pro Max",
        "iPhone 15 Pro",
        "iPhone 15 Plus",
        "iPhone 15",
        "iPhone 14 Pro Max",
        "iPhone 14 Pro",
        "iPhone 14 Plus",
        "iPhone 14",
        "iPhone 13 Pro Max",
        "iPhone 13 Pro",
        "iPhone 13",
        "iPhone 13 mini",
        "iPhone 12 Pro Max",
        "iPhone 12 Pro",
        "iPhone 12",
        "iPhone 12 mini",
        "iPhone 11 Pro Max",
        "iPhone 11 Pro",
        "iPhone 11",
        "iPhone SE (3rd gen)",
        "iPhone SE (2nd gen)",
      ],
      Samsung: [
        "Galaxy S25 Ultra",
        "Galaxy S25+",
        "Galaxy S25",
        "Galaxy S24 Ultra",
        "Galaxy S24+",
        "Galaxy S24",
        "Galaxy S24 FE",
        "Galaxy S23 Ultra",
        "Galaxy S23+",
        "Galaxy S23",
        "Galaxy S22 Ultra",
        "Galaxy S22",
        "Galaxy Z Fold6",
        "Galaxy Z Flip6",
        "Galaxy A56",
        "Galaxy A55",
        "Galaxy A36",
        "Galaxy A35",
        "Galaxy A25",
        "Galaxy A16",
        "Galaxy A15",
      ],
      Google: ["Pixel 10 Pro XL", "Pixel 10 Pro", "Pixel 10", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 9a", "Pixel 8 Pro", "Pixel 8", "Pixel 8a", "Pixel 7 Pro", "Pixel 7", "Pixel 7a"],
      Motorola: ["Moto G Power", "Moto G Stylus", "Moto G Play", "Moto G 5G", "Motorola Edge", "Motorola Razr", "Motorola Razr+"],
      LG: ["LG Velvet", "LG V60 ThinQ", "LG G8 ThinQ", "LG Stylo 6", "LG K92"],
    },
    issues: ISSUES,
  },
  Tablet: {
    brands: {
      Apple: ["iPad Pro 13-inch", "iPad Pro 11-inch", "iPad Air 13-inch", "iPad Air 11-inch", "iPad (A16)", "iPad (10th gen)", "iPad (9th gen)", "iPad mini (A17 Pro)", "iPad mini (6th gen)"],
      Samsung: ["Galaxy Tab S10 Ultra", "Galaxy Tab S10+", "Galaxy Tab S9", "Galaxy Tab S9 FE", "Galaxy Tab S8", "Galaxy Tab A9+", "Galaxy Tab A9", "Galaxy Tab A8"],
    },
    issues: ISSUES,
  },
  Laptop: {
    brands: {
      Apple: ["MacBook Air 15-inch", "MacBook Air 13-inch", "MacBook Pro 16-inch", "MacBook Pro 14-inch", "MacBook Pro 13-inch"],
      Dell: ["XPS 13", "XPS 15", "XPS 16", "Inspiron", "Latitude", "Vostro", "Alienware"],
      HP: ["Spectre x360", "Envy", "Pavilion", "EliteBook", "ProBook", "Victus", "HP Chromebook"],
      Lenovo: ["ThinkPad", "IdeaPad", "Yoga", "Legion", "Lenovo Chromebook"],
    },
    issues: ISSUES,
  },
  "Game Console": {
    brands: {
      Sony: ["PS5 Pro", "PS5", "PS5 Digital Edition", "PS4 Pro", "PS4"],
      Microsoft: ["Xbox Series X", "Xbox Series S", "Xbox One X", "Xbox One S", "Xbox One"],
      Nintendo: ["Switch 2", "Switch OLED", "Switch", "Switch Lite"],
    },
    issues: CONSOLE_ISSUES,
  },
  Other: { brands: {}, issues: ISSUES },
};

export const isDevice = (v: unknown): v is Device => typeof v === "string" && (DEVICES as readonly string[]).includes(v);

export const brandsFor = (device: Device): string[] => [...Object.keys(CATALOG[device].brands), OTHER];

export const modelsFor = (device: Device, brand: string): string[] => [...(CATALOG[device].brands[brand] ?? []), OTHER];

export const issuesFor = (device: Device): readonly string[] => CATALOG[device].issues;

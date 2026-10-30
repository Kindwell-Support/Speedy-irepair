/**
 * Trade-in catalog (components/trade-in): device → brand → model, plus the conditions a device can be in.
 * Phones, tablets and laptops share the repair catalog's brands and models; watches are only bought, not repaired.
 * Static and client-safe. Every brand and model list ends with OTHER, which reveals a free-text box.
 */
import { CATALOG, OTHER } from "./repair-catalog";
import { tradeInSchema, type TradeInInput } from "./forms/schemas";

export const TRADE_IN_DEVICES = tradeInSchema.shape.deviceType.options;
export type TradeInDevice = TradeInInput["deviceType"];
export type Condition = TradeInInput["condition"];

const WATCHES: Record<string, readonly string[]> = {
  Apple: [
    "Apple Watch Ultra 3",
    "Apple Watch Ultra 2",
    "Apple Watch Ultra",
    "Apple Watch Series 11",
    "Apple Watch Series 10",
    "Apple Watch Series 9",
    "Apple Watch Series 8",
    "Apple Watch Series 7",
    "Apple Watch SE (3rd gen)",
    "Apple Watch SE (2nd gen)",
  ],
  Samsung: [
    "Galaxy Watch8 Classic",
    "Galaxy Watch8",
    "Galaxy Watch Ultra",
    "Galaxy Watch7",
    "Galaxy Watch6 Classic",
    "Galaxy Watch6",
    "Galaxy Watch5 Pro",
    "Galaxy Watch5",
  ],
  Google: ["Pixel Watch 4", "Pixel Watch 3", "Pixel Watch 2", "Pixel Watch"],
};

const BRANDS: Record<TradeInDevice, Record<string, readonly string[]>> = {
  Phone: CATALOG.Phone.brands,
  Tablet: CATALOG.Tablet.brands,
  Smartwatch: WATCHES,
  Laptop: CATALOG.Laptop.brands,
  Other: {},
};

export const tradeInBrandsFor = (device: TradeInDevice): string[] => [...Object.keys(BRANDS[device]), OTHER];

export const tradeInModelsFor = (device: TradeInDevice, brand: string): string[] => [
  ...(BRANDS[device][brand] ?? []),
  OTHER,
];

/** Each condition with the one line that tells a visitor which is theirs. */
export const CONDITIONS: { value: Condition; hint: string }[] = [
  { value: "Like new", hint: "No scratches, works perfectly" },
  { value: "Good", hint: "Light wear, everything works" },
  { value: "Fair", hint: "Visible scratches or dents, everything works" },
  { value: "Cracked / damaged", hint: "Cracked screen or back, or other damage" },
  { value: "Not working", hint: "Won't turn on or has a major fault" },
];

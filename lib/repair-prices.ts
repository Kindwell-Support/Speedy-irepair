import { CATALOG, DEVICES, type Device } from "./repair-catalog";

/**
 * Instant prices for /instant-quote, from the price lists on the service pages (Sanity "service" docs).
 * Each price line can name the widget models it applies to ("Models" in the CMS). The service it sits on gives
 * the widget issue. A line with no models, or on another service, only shows on its service page.
 * Pure and client-safe: the widget, the quote API and the Sanity schema all use it.
 */

/** Service slug → the widget issue (lib/repair-catalog) its price list answers. */
export const QUOTE_ISSUE_BY_SLUG: Record<string, string> = {
  "screen-repair": "Cracked Screen",
  "battery-replacement": "Battery Replacement",
  "charger-port-repair": "Charging Port",
};

/** Stands for every model of a brand, e.g. "Samsung battery" fits any Samsung phone. */
export const ANY_MODEL = "*";

/** How a price line stores a widget model: "Phone|Apple|iPhone 15". */
export const modelKey = (device: Device, brand: string, model: string) => `${device}|${brand}|${model}`;

const PLURAL: Record<Device, string> = {
  Phone: "phones",
  Tablet: "tablets",
  Laptop: "laptops",
  "Game Console": "consoles",
  Other: "devices",
};

/** The CMS pick list: per device and brand, "All <brand> <devices>" then each model. */
export const MODEL_OPTIONS: { title: string; value: string }[] = DEVICES.flatMap((device) =>
  Object.entries(CATALOG[device].brands).flatMap(([brand, models]) => [
    { title: `All ${brand} ${PLURAL[device]}`, value: modelKey(device, brand, ANY_MODEL) },
    ...models.map((model) => ({ title: model, value: modelKey(device, brand, model) })),
  ]),
);

export interface QuotePrice {
  label: string;
  price: string;
}

export interface QuotePriceLine extends QuotePrice {
  issue: string;
  models: string[];
}

/** The lines the widget can quote from: on a mapped service, with at least one model. */
export function quotePriceLines(
  services: { slug: string; priceList?: { label: string; price: string; models?: string[] | null }[] | null }[],
): QuotePriceLine[] {
  return services.flatMap((s) => {
    const issue = QUOTE_ISSUE_BY_SLUG[s.slug];
    if (!issue) return [];
    return (s.priceList ?? [])
      .filter((line) => line.models?.length)
      .map((line) => ({ label: line.label, price: line.price, issue, models: line.models! }));
  });
}

/**
 * Prices for one repair. Lines naming the exact model win over brand-wide ones, so "iPhone 15 screen" isn't joined
 * by a catch-all. Every matching line is returned (e.g. Soft OLED and LCD), in the CMS order. [] = no price.
 */
export function findPrices(
  lines: QuotePriceLine[],
  repair: { device: Device; brand: string; model: string; issue: string },
): QuotePrice[] {
  const forIssue = lines.filter((l) => l.issue === repair.issue);
  const exact = forIssue.filter((l) => l.models.includes(modelKey(repair.device, repair.brand, repair.model)));
  const matches = exact.length
    ? exact
    : forIssue.filter((l) => l.models.includes(modelKey(repair.device, repair.brand, ANY_MODEL)));
  return matches.map(({ label, price }) => ({ label, price }));
}

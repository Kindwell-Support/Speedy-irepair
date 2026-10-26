/**
 * CatalogProvider -> Product JSON-LD input (Technical Architect decision: headless Shopify via
 * web/lib/shop CatalogProvider; fixtureAdapter serves placeholder items until a Storefront token exists).
 *
 * RULE: Product markup ONLY for live Shopify items. Fixture/placeholder items return null, so pages
 * emit BreadcrumbList only. Structural types below mirror web/lib/shop/types.ts (Product, Money)
 * so this file has no import dependency on the web app.
 */
import type { ProductInput } from "./jsonld";

export interface CatalogMoney {
  amount: string | null;
  currencyCode: string;
}
export interface CatalogProductLike {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  images: { url: string; altText: string | null }[];
  variants: { id: string; availableForSale: boolean; price: CatalogMoney }[];
  priceRange: { min: CatalogMoney; max: CatalogMoney };
  availableForSale: boolean;
  category: "iphones" | "ipads" | "apple-watch" | "macbooks" | "accessories" | null;
  /** web/lib/shop Product.source (fixture records never carry prices). */
  source?: CatalogSource;
}
/** = CatalogProvider['name'] */
export type CatalogSource = "shopify" | "fixture";

const PLACEHOLDER_TAGS = ["placeholder", "fixture", "sample"];

/** True when the item must NOT get Product markup (fixture adapter or flagged placeholder). */
export function isPlaceholderProduct(p: CatalogProductLike, source: CatalogSource): boolean {
  return (
    source !== "shopify" ||
    (p.source !== undefined && p.source !== "shopify") ||
    p.id.startsWith("fixture-") ||
    p.tags.some((t) => PLACEHOLDER_TAGS.includes(t.trim().toLowerCase()))
  );
}

const APPLE_CATEGORIES = new Set(["iphones", "ipads", "apple-watch", "macbooks"]);

function plainText(html: string, max = 300): string | undefined {
  const t = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return undefined;
  return t.length > max ? `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : t;
}

/**
 * Maps a live catalog product to ProductInput, or null (placeholder => no Product markup).
 * Price/availability come only from Shopify and equal what the PDP/grid renders.
 */
export function productInputFromCatalog(
  p: CatalogProductLike,
  source: CatalogSource,
): ProductInput | null {
  if (isPlaceholderProduct(p, source)) return null;
  const min = p.priceRange.min.amount;
  const max = p.priceRange.max.amount;
  return {
    handle: p.handle,
    name: p.title,
    description: plainText(p.descriptionHtml),
    image: p.images.map((i) => i.url).filter(Boolean),
    // Vendor on this store is the shop name, not a brand; brand only where the category is unambiguous.
    brand: p.category && APPLE_CATEGORIES.has(p.category) ? "Apple" : undefined,
    category: p.productType || undefined,
    price: min ?? undefined,
    highPrice: max && min && max !== min ? max : undefined,
    priceCurrency: p.priceRange.min.currencyCode || "USD",
    offerCount: p.variants.length || undefined,
    availability: p.availableForSale ? "InStock" : "OutOfStock",
    // Devices are sold as certified pre-owned; accessories' condition is unknown => omitted.
    condition: p.category && APPLE_CATEGORIES.has(p.category) ? "UsedCondition" : undefined,
  };
}

/** Live (non-placeholder) products only. */
export const productInputsFromCatalog = (
  items: CatalogProductLike[],
  source: CatalogSource,
): ProductInput[] =>
  items.map((p) => productInputFromCatalog(p, source)).filter((x): x is ProductInput => x !== null);

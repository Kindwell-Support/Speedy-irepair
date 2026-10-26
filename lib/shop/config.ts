import type { CategoryKey } from "./types";

/** ISR window for /shop and /shop/[product] (seconds). Matches `export const revalidate` in those routes. */
export const SHOP_REVALIDATE_SECONDS = 300;

export const CART_COOKIE = "sir_cart";

/**
 * Spec 2.3 categories (REQ-052) → Shopify collection handles.
 * Handles verified against https://speedyirepair.com/collections.json on 2026-10-27:
 *   iphones ("Apple iPhones", 10 products), apple-ipads ("Apple iPads", 0), screen-protectors (0).
 * Collections that do not exist yet are marked `exists: false`; the client creates them in Shopify
 * (or edits this map). `productTypes` is the fallback matcher used by the fixture adapter.
 */
export const SHOP_CATEGORIES: {
  key: CategoryKey;
  label: string;
  collectionHandle: string;
  exists: boolean;
  productTypes: string[];
}[] = [
  { key: "iphones", label: "iPhones", collectionHandle: "iphones", exists: true, productTypes: ["iPhones", "iPhone"] },
  { key: "ipads", label: "iPads", collectionHandle: "apple-ipads", exists: true, productTypes: ["iPads", "iPad"] },
  { key: "apple-watch", label: "Apple Watch", collectionHandle: "apple-watch", exists: false, productTypes: ["Apple Watch"] },
  { key: "macbooks", label: "MacBooks", collectionHandle: "macbooks", exists: false, productTypes: ["MacBooks", "MacBook"] },
  { key: "accessories", label: "Accessories", collectionHandle: "accessories", exists: false, productTypes: ["Accessories", "Screen Protectors"] },
];

export function categoryForProductType(productType: string): CategoryKey | null {
  const hit = SHOP_CATEGORIES.find((c) =>
    c.productTypes.some((t) => t.toLowerCase() === productType.toLowerCase()),
  );
  return hit?.key ?? null;
}

import "server-only";
import { isShopifyConfigured } from "@/lib/env.server";
import { fixtureAdapter } from "./fixture-adapter";
import { shopifyAdapter } from "./shopify-adapter";
import type { CatalogProvider } from "./types";

/** Returns the active catalog: Shopify when SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN are set, else fixtures. */
export function getCatalog(): CatalogProvider {
  return isShopifyConfigured ? shopifyAdapter : fixtureAdapter;
}

export { SHOP_CATEGORIES, SHOP_REVALIDATE_SECONDS } from "./config";
export type * from "./types";

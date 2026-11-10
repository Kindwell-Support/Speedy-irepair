import "server-only";
import { isShopifyConfigured, serverEnv } from "@/lib/env.server";
import { fixtureAdapter } from "./fixture-adapter";
import { shopifyAdapter } from "./shopify-adapter";
import type { CatalogProvider } from "./types";

/** Returns the active catalog: Shopify when SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN are set, else fixtures. */
export function getCatalog(): CatalogProvider {
  return isShopifyConfigured ? shopifyAdapter : fixtureAdapter;
}

/**
 * Online checkout is on only when the Shopify catalog is active AND SHOP_CHECKOUT_ENABLED=true, so a Storefront token
 * set on its own (e.g. by mistake in Production) never turns checkout on. Off => "Call to buy" instead of Add to Cart.
 */
export function isCheckoutEnabled(): boolean {
  return getCatalog().supportsCheckout && serverEnv.shopCheckoutEnabled;
}

export { SHOP_CATEGORIES, SHOP_REVALIDATE_SECONDS } from "./config";
export type * from "./types";

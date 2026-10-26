/**
 * 301/308 redirect map: old Shopify URLs (speedyirepair.com, crawled 2026-10-27 from /sitemap.xml
 * and live HTTP checks) -> new Next.js routes. Wired into next.config.ts `redirects()`.
 * Owner: SEO/AEO/GEO (source: seo/schema/next.config.redirects.ts, table in seo/SEO_STRATEGY.md §9).
 * `permanent: true` => 308 in Next.js (Google treats 308 = 301).
 * Relative imports only: this file is loaded by next.config.ts.
 */
import type { NextConfig } from "next";

/** Set to true if the on-site product detail route /shop/[product] (R04) is built. */
const HAS_ON_SITE_PDP = true; // CONFIRMED: headless Shopify via CatalogProvider, PDPs at /shop/[handle] (G10 closed)

export const redirects: NextConfig["redirects"] = async () => [
  // ---- Shopify /pages/* (all 9 from sitemap_pages_1.xml)
  { source: "/pages/about-us", destination: "/about", permanent: true },
  { source: "/pages/contact-us", destination: "/about", permanent: true }, // contact form lives on /about + homepage (OQ-03)
  { source: "/pages/return-policy", destination: "/policies/shipping-return", permanent: true },
  { source: "/pages/repair-pricing", destination: "/instant-quote", permanent: true },
  { source: "/pages/privacy-policy", destination: "/policies/privacy", permanent: true },
  { source: "/pages/terms-conditions", destination: "/policies/terms", permanent: true },
  { source: "/pages/faq", destination: "/faq", permanent: true },
  { source: "/pages/instant-quote", destination: "/instant-quote", permanent: true },
  { source: "/pages/sell-your-device", destination: "/sell-your-device", permanent: true },
  // ---- Shopify auto-generated /policies/* (all return 200 today)
  { source: "/policies/refund-policy", destination: "/policies/shipping-return", permanent: true },
  {
    source: "/policies/shipping-policy",
    destination: "/policies/shipping-return",
    permanent: true,
  },
  { source: "/policies/privacy-policy", destination: "/policies/privacy", permanent: true },
  { source: "/policies/terms-of-service", destination: "/policies/terms", permanent: true },
  // ---- Collections (sitemap_collections_1.xml + /collections/all)
  { source: "/collections/iphones", destination: "/shop?category=iphones", permanent: true },
  { source: "/collections/apple-ipads", destination: "/shop?category=ipads", permanent: true },
  {
    source: "/collections/screen-protectors",
    destination: "/shop?category=accessories",
    permanent: true,
  },
  { source: "/collections/all", destination: "/shop", permanent: true },
  { source: "/collections", destination: "/shop", permanent: true },
  // Product URLs nested under a collection
  {
    source: "/collections/:collection/products/:handle",
    destination: HAS_ON_SITE_PDP ? "/shop/:handle" : "/shop",
    permanent: true,
  },
  { source: "/collections/:collection", destination: "/shop", permanent: true },
  // ---- Products (9 in sitemap_products_1.xml). Keep Shopify handles as /shop/[product] slugs.
  // UNKNOWN: /products/extended-phone-warranty is a Shopify product ($49.99, unavailable) not in the brief.
  // Client/PM to decide whether it is listed in the new shop; until then it falls through to the rule below.
  {
    source: "/products/:handle",
    destination: HAS_ON_SITE_PDP ? "/shop/:handle" : "/shop",
    permanent: true,
  },
  { source: "/products", destination: "/shop", permanent: true },
  // ---- Blog (blogs/news exists but has 0 posts)
  { source: "/blogs/:path*", destination: "/", permanent: true },
  // ---- Misc Shopify paths
  { source: "/search", destination: "/shop", permanent: true },
  // UNKNOWN: /cart and /account — keep if headless Shopify cart/account is built; otherwise redirect:
  // { source: '/cart', destination: '/shop', permanent: false },
  // { source: '/account/:path*', destination: '/', permanent: false },
  // Dropped (Shopify-generated, intentionally 404/410 after cutover): /agents.md, /.well-known/ucp,
  // /sitemap_*.xml (replaced by /sitemap.xml)
];

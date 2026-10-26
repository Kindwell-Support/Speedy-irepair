import type { Metadata } from "next";
import { getShopPage, getSiteSettings } from "@/lib/sanity/content";
import { getCatalog, SHOP_CATEGORIES } from "@/lib/shop";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForShop } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Notice } from "@/components/ui/Notice";
import { ShopBrowser } from "./ShopBrowser";

export const revalidate = 300; // = SHOP_REVALIDATE_SECONDS (literal required by Next segment config)

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/shop", (await getShopPage()).seo);
}

/** R03 — catalog via CatalogProvider (Shopify Storefront when configured, else the snapshot fixture). */
export default async function ShopPage() {
  const catalog = getCatalog();
  const [page, products, seo, settings] = await Promise.all([
    getShopPage(),
    // Storefront outage => empty state (with eBay CTA), never a 500.
    catalog.listProducts({ first: 100 }).catch(() => []),
    getSeoData(),
    getSiteSettings(),
  ]);
  return (
    <>
      {/* Product markup only for live Shopify items; fixture catalog => BreadcrumbList only. */}
      <JsonLd data={jsonLdForShop(seo, { items: products, source: catalog.name })} />
      <Breadcrumbs data={jsonLdForShop(seo)} />
      <PageHero hero={page.hero} />
      <div className="container-site py-12">
        {!catalog.supportsCheckout ? (
          <Notice tone="staging" className="mb-8">
            {page.stagingNotice}
          </Notice>
        ) : null}
        <ShopBrowser
          products={products}
          categories={SHOP_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
          ebayHref={settings.business.externalLinks.ebay}
        />
      </div>
    </>
  );
}

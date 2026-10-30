import type { Metadata } from "next";
import { getShopPage } from "@/lib/sanity/content";
import { getCatalog, SHOP_CATEGORIES } from "@/lib/shop";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForShop } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { SITE_IMAGES } from "@/lib/site-images";
import { Notice } from "@/components/ui/Notice";
import { ContactPrompt } from "@/components/sections/shared/ContactPrompt";
import { ShopBrowser } from "./ShopBrowser";

export const revalidate = 300; // = SHOP_REVALIDATE_SECONDS (literal required by Next segment config)

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/shop", (await getShopPage()).seo);
}

/** R03 — catalog via CatalogProvider (Shopify Storefront when configured, else the snapshot fixture). */
export default async function ShopPage() {
  const catalog = getCatalog();
  const [page, products, seo] = await Promise.all([getShopPage(), catalog.listProducts({ first: 100 }), getSeoData()]);
  return (
    <>
      <JsonLd data={jsonLdForShop(seo)} />
      <PageHero hero={{ ...page.hero, poster: { ...SITE_IMAGES.storeCounter, isSanity: false } }} photo="storeCounter" />
      <div className="container-site py-12">
        {!catalog.supportsCheckout ? (
          <Notice tone="staging" className="mb-8">
            {page.stagingNotice}
          </Notice>
        ) : null}
        <ShopBrowser products={products} categories={SHOP_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))} />
      </div>
      <ContactPrompt id="shop-contact" heading="Looking for a specific device?" intro="Tell us what you're after and we'll check what we have in stock." />
    </>
  );
}

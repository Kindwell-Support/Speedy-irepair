import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, SHOP_CATEGORIES } from "@/lib/shop";
import { getPdpChrome, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { productMetaDescription, productMetaTitle } from "@/lib/seo/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForProduct } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPrice, PRICE_PLACEHOLDER } from "@/lib/utils/format";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { A11Y } from "@/components/ui/a11yStrings";
import { LineIcon } from "@/components/ui/LineIcon";
import { PdpAssurances } from "@/components/sections/shop/PdpAssurances";
import { RelatedProducts } from "@/components/sections/shop/RelatedProducts";
import type { Product } from "@/lib/shop/types";
import type { Address } from "@/lib/sanity/types";
import { AddToCart } from "./AddToCart";

export const revalidate = 300;
export const dynamicParams = true;

type Params = { params: Promise<{ product: string }> };

export async function generateStaticParams() {
  const products = await getCatalog().listProducts({ first: 50 });
  return products.map((p) => ({ product: p.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { product: handle } = await params;
  const p = await getCatalog().getProduct(handle);
  if (!p) return pageMetadata("/shop/[product]", null, `/shop/${handle}`);
  return buildMetadata({
    path: `/shop/${p.handle}`,
    fallback: {
      metaTitle: productMetaTitle(p.title),
      metaDescription: productMetaDescription(p.title),
    },
  });
}

/** Merchant HTML may contain <h1>; the page must keep exactly one h1 (the product title). */
const demoteHeadings = (html: string) => html.replace(/<(\/?)h1\b/gi, "<$1h2");

const formatAddress = (a: Address) =>
  `${a.street}${a.suite ? ` ${a.suite}` : ""}, ${a.city}, ${a.state} ${a.zip}`;

/** Same category first, then the rest of the catalog; in-stock first; never the current product. */
async function relatedFor(p: Product): Promise<Product[]> {
  const catalog = getCatalog();
  const [same, all] = await Promise.all([
    p.category ? catalog.listProducts({ category: p.category, first: 12 }).catch(() => []) : [],
    catalog.listProducts({ first: 24 }).catch(() => []),
  ]);
  const seen = new Set([p.id]);
  const pool = [...same, ...all].filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  return [
    ...pool.filter((x) => x.availableForSale),
    ...pool.filter((x) => !x.availableForSale),
  ].slice(0, 4);
}

/** R04 — on-site PDP (Decision: headless Shopify via CatalogProvider; checkout hands off to Shopify). */
export default async function ProductPage({ params }: Params) {
  const { product: handle } = await params;
  const catalog = getCatalog();
  const [p, seo, pdpCopy, settings] = await Promise.all([
    catalog.getProduct(handle),
    getSeoData(),
    getPdpChrome(),
    getSiteSettings(),
  ]);
  if (!p) notFound();
  const related = await relatedFor(p);
  const categoryLabel = SHOP_CATEGORIES.find((c) => c.key === p.category)?.label;
  const options = p.options.filter((o) => o.values.length > 1);
  const acimaHref = settings.business.externalLinks.financing;
  const cardLabels = { view: pdpCopy.viewLabel ?? "", soldOut: pdpCopy.soldOutLabel };
  const img = p.featuredImage;
  const fallback = p.source === "fixture" ? PRICE_PLACEHOLDER : "Contact us";
  return (
    <>
      {/* Product markup only for live Shopify items; fixture/placeholder => BreadcrumbList only (lib/seo/catalog.ts). */}
      <JsonLd data={jsonLdForProduct(seo, { item: p, source: catalog.name })} />
      <div className="container-site py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-body-sm text-text-secondary">
          <Link href="/" className="hover:text-text">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:text-text">
            Shop
          </Link>{" "}
          / <span aria-current="page">{p.title}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-xl bg-surface-2">
            {img ? (
              <Image
                src={img.url}
                alt={img.altText || p.title}
                width={img.width}
                height={img.height}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-contain p-6"
              />
            ) : null}
          </div>
          <div>
            {categoryLabel ? (
              <p className="mb-3 text-label uppercase text-text-secondary">{categoryLabel}</p>
            ) : null}
            <h1 className="text-h2">{p.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-h4">
                {formatPrice(p.priceRange.min.amount, p.priceRange.min.currencyCode, fallback)}
              </span>
              {p.availableForSale && pdpCopy.inStockLabel ? (
                <span
                  className="inline-flex h-7 items-center rounded-full border border-success px-3 text-caption font-semibold text-success"
                  data-testid="stock-badge"
                >
                  {pdpCopy.inStockLabel}
                </span>
              ) : null}
            </p>
            <AddToCart
              variants={p.variants.map((v) => ({
                id: v.id,
                title: v.title,
                available: v.availableForSale,
                price: formatPrice(v.price.amount, v.price.currencyCode, fallback),
                options: v.selectedOptions,
              }))}
              options={options}
              checkoutEnabled={catalog.supportsCheckout}
              copy={pdpCopy}
            >
              {pdpCopy.acimaLabel && acimaHref ? (
                <div className="grid w-full gap-2" data-testid="pdp-acima">
                  <a
                    href={acimaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("secondary", "lg", "w-full")}
                  >
                    {pdpCopy.acimaLabel}
                    <LineIcon name="arrowUpRight" size={16} />
                    <span className="sr-only">{A11Y.opensInNewTab}</span>
                  </a>
                  {pdpCopy.acimaNote ? (
                    <p className="text-center text-caption text-text-tertiary">
                      {pdpCopy.acimaNote}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </AddToCart>
            <div className="mt-8">
              <PdpAssurances
                items={pdpCopy.assurances ?? []}
                address={formatAddress(settings.business.address)}
              />
            </div>
            {/* Shopify-authored HTML (trusted merchant content). */}
            <div
              className="prose-site mt-10 text-body text-text-secondary"
              dangerouslySetInnerHTML={{ __html: demoteHeadings(p.descriptionHtml) }}
            />
          </div>
        </div>
      </div>
      {pdpCopy.related ? (
        <RelatedProducts copy={pdpCopy.related} products={related} labels={cardLabels} />
      ) : null}
    </>
  );
}

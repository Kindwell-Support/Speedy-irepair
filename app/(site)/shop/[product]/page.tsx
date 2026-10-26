import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/shop";
import type { Product } from "@/lib/shop/types";
import { pageMetadata } from "@/lib/page/meta";
import { productMetaDescription, productMetaTitle } from "@/lib/seo/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForProduct } from "@/lib/seo/routes";
import type { ProductInput } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPrice } from "@/lib/utils/format";
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
    fallback: { metaTitle: productMetaTitle(p.title), metaDescription: productMetaDescription(p.title) },
  });
}

/** Merchant HTML may contain <h1>; the page must keep exactly one h1 (the product title). */
const demoteHeadings = (html: string) => html.replace(/<(\/?)h1\b/gi, "<$1h2");

function toProductInput(p: Product): ProductInput {
  return {
    handle: p.handle,
    name: p.title,
    description: p.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || undefined,
    image: p.images.map((i) => i.url),
    brand: p.vendor || undefined,
    price: p.priceRange.min.amount ?? undefined,
    priceCurrency: p.priceRange.min.currencyCode,
    availability: p.availableForSale ? "InStock" : "OutOfStock",
    category: p.productType || undefined,
  };
}

/** R04 — on-site PDP (Decision: headless Shopify via CatalogProvider; checkout hands off to Shopify). */
export default async function ProductPage({ params }: Params) {
  const { product: handle } = await params;
  const catalog = getCatalog();
  const [p, seo] = await Promise.all([catalog.getProduct(handle), getSeoData()]);
  if (!p) notFound();
  const img = p.featuredImage;
  return (
    <>
      <JsonLd data={jsonLdForProduct(seo, toProductInput(p))} />
      <div className="container-site py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-body-sm text-text-secondary">
          <Link href="/" className="hover:text-text">Home</Link> / <Link href="/shop" className="hover:text-text">Shop</Link> /{" "}
          <span aria-current="page">{p.title}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-xl bg-surface-2">
            {img ? (
              <Image src={img.url} alt={img.altText || p.title} width={img.width} height={img.height} priority sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-contain p-6" />
            ) : null}
          </div>
          <div>
            <h1 className="text-h2">{p.title}</h1>
            <p className="mt-4 text-h4">{formatPrice(p.priceRange.min.amount, p.priceRange.min.currencyCode)}</p>
            <AddToCart
              variants={p.variants.map((v) => ({ id: v.id, title: v.title, available: v.availableForSale, price: formatPrice(v.price.amount, v.price.currencyCode) }))}
              checkoutEnabled={catalog.supportsCheckout}
            />
            {/* Shopify-authored HTML (trusted merchant content). */}
            <div className="prose-site mt-10 text-body text-text-secondary" dangerouslySetInnerHTML={{ __html: demoteHeadings(p.descriptionHtml) }} />
          </div>
        </div>
      </div>
    </>
  );
}

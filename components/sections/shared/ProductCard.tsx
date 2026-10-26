import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/shop/types";
import { formatPrice, PRICE_PLACEHOLDER } from "@/lib/utils/format";

export type ProductCardLabels = { view: string; soldOut: string };

/** Shop product card: image, name, price (from Shopify / snapshot only), View / Sold out label (CMS). */
export function ProductCard({ product, labels }: { product: Product; labels: ProductCardLabels }) {
  const img = product.featuredImage;
  const { min, max } = product.priceRange;
  const price =
    product.source === "fixture"
      ? PRICE_PLACEHOLDER
      : min.amount && max.amount && min.amount !== max.amount
        ? `From ${formatPrice(min.amount, min.currencyCode)}`
        : formatPrice(min.amount, min.currencyCode);
  return (
    <article
      data-testid="product-card"
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="aspect-square bg-surface-2">
        {img ? (
          <Image
            src={img.url}
            alt={img.altText || product.title}
            width={img.width}
            height={img.height}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-contain p-4"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-h6">
          <Link
            href={`/shop/${product.handle}`}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:shadow-focus"
          >
            {product.title}
          </Link>
        </h3>
        <p className="text-body-sm text-text-secondary">{price}</p>
        <span className="mt-auto text-body-sm font-semibold text-primary-text">
          {product.availableForSale ? labels.view : labels.soldOut}
        </span>
      </div>
    </article>
  );
}

"use client";
import type { CategoryKey, Product } from "@/lib/shop/types";
import { ShopGrid } from "@/components/motion/ShopGrid";
import { ProductCard } from "@/components/sections/shared/ProductCard";

/** Client wrapper: category filter with Framer layout animation (ShopGrid, Motion lane). */
export function ShopBrowser({
  products,
  categories,
  ebayHref,
}: {
  products: Product[];
  categories: { key: CategoryKey; label: string }[];
  ebayHref?: string;
}) {
  const labelFor = (k: CategoryKey | null) => categories.find((c) => c.key === k)?.label ?? "Other";
  if (!products.length)
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center" role="status">
        <p className="text-h5">No devices listed right now</p>
        <p className="mt-2 text-body text-text-secondary">New stock is added regularly. Meanwhile, browse our eBay store.</p>
        {ebayHref ? (
          <a href={ebayHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover">
            Shop on eBay
          </a>
        ) : null}
      </div>
    );
  return (
    <ShopGrid
      items={products}
      categories={categories.map((c) => c.label)}
      getKey={(p) => p.id}
      getCategory={(p) => labelFor(p.category)}
      renderItem={(p) => <ProductCard product={p} />}
      tabsClassName="mb-8 flex flex-wrap gap-2"
      tabClassName="relative rounded-full px-4 py-2 text-body-sm"
      gridClassName="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
    />
  );
}

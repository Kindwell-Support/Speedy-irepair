"use client";
import type { CategoryKey, Product } from "@/lib/shop/types";
import { ShopGrid } from "@/components/motion/ShopGrid";
import { ProductCard } from "@/components/sections/shared/ProductCard";

/** Client wrapper: category filter with Framer layout animation (ShopGrid, Motion lane). */
export function ShopBrowser({ products, categories }: { products: Product[]; categories: { key: CategoryKey; label: string }[] }) {
  const labelFor = (k: CategoryKey | null) => categories.find((c) => c.key === k)?.label ?? "Other";
  if (!products.length) return <p className="text-body text-text-secondary">No products are available right now.</p>;
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

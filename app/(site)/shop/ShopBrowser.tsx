"use client";
import { useEffect, useMemo, useState } from "react";
import type { CategoryKey, Product } from "@/lib/shop/types";
import type { ShopChromeCopy } from "@/lib/sanity/types";
import { ShopGrid } from "@/components/motion/ShopGrid";
import { ProductCard } from "@/components/sections/shared/ProductCard";
import { CategoryTiles } from "@/components/sections/shop/CategoryTiles";
import { ShopEmpty } from "@/components/sections/shop/ShopEmpty";
import { A11Y } from "@/components/ui/a11yStrings";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";

/** Sorts this component implements (a CMS label for any other key is ignored until it is built). */
const SORT_KEYS = ["featured", "priceAsc", "priceDesc"] as const;
type SortKey = (typeof SORT_KEYS)[number];
const price = (p: Product) =>
  p.priceRange.min.amount === null ? null : Number(p.priceRange.min.amount);

/**
 * Client wrapper (design shop.html): category tiles → shop-bar (filter tabs via ShopGrid, sort select) →
 * product grid, plus empty-category / empty-catalog frames. Filter is controlled here so tiles and
 * ?category= drive it. Layout animation lives in ShopGrid (Motion lane).
 */
export function ShopBrowser({
  products,
  categories,
  ebayHref,
  phone,
  copy,
}: {
  products: Product[];
  categories: { key: CategoryKey; label: string }[];
  ebayHref?: string;
  phone: string;
  copy: ShopChromeCopy;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const labelFor = (k: CategoryKey | null) => categories.find((c) => c.key === k)?.label ?? "Other";

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("category");
    const hit = categories.find((c) => c.key === key);
    if (hit) setFilter(hit.label);
  }, [categories]);

  const sorted = useMemo(() => {
    if (sort === "featured") return products;
    const dir = sort === "priceAsc" ? 1 : -1;
    return [...products].sort((a, b) => {
      const pa = price(a);
      const pb = price(b);
      if (pa === null || pb === null) return pa === pb ? 0 : pa === null ? 1 : -1;
      return (pa - pb) * dir;
    });
  }, [products, sort]);

  const tiles = (
    <CategoryTiles
      heading={copy.categoriesHeading}
      categories={categories}
      onSelect={(key) => setFilter(labelFor(key))}
    />
  );

  if (!products.length)
    return (
      <>
        {tiles}
        <ShopEmpty title={copy.emptyCatalog.title} body={copy.emptyCatalog.body}>
          {ebayHref ? (
            <a
              href={ebayHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary")}
            >
              {copy.emptyCatalog.ebayLabel}
              <span className="sr-only">{A11Y.opensInNewTab}</span>
            </a>
          ) : null}
        </ShopEmpty>
      </>
    );

  return (
    <>
      {tiles}
      <section id="products" aria-labelledby="prod-h" className="scroll-mt-24">
        <h2 id="prod-h" className="sr-only">
          {copy.productsHeading}
        </h2>
        <ShopGrid
          items={sorted}
          categories={categories.map((c) => c.label)}
          getKey={(p) => p.id}
          getCategory={(p) => labelFor(p.category)}
          renderItem={(p) => <ProductCard product={p} />}
          allLabel={copy.allLabel}
          value={filter}
          onFilterChange={setFilter}
          barClassName="sticky top-[var(--nav-h)] z-10 mb-8 flex flex-wrap items-center justify-between gap-4 bg-bg/85 py-4 backdrop-blur-md lg:top-[var(--nav-h-desktop)]"
          tabsClassName="flex flex-wrap gap-2"
          tabClassName="inline-flex h-8 items-center rounded-full border border-border px-4 text-body-sm text-text-secondary hover:border-border-strong hover:text-text aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-text-inverse"
          toolbarEnd={
            <div>
              <label htmlFor="shop-sort" className="sr-only">
                {copy.sortLabel}
              </label>
              <select
                id="shop-sort"
                data-testid="shop-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 min-w-[200px] rounded-md border border-border bg-surface px-4 text-body-sm text-text focus-visible:shadow-focus"
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {copy.sortOptions[k]}
                  </option>
                ))}
              </select>
            </div>
          }
          emptyState={
            <ShopEmpty title={copy.emptyCategory.title} body={copy.emptyCategory.body}>
              <a
                href={telHref(phone)}
                className={buttonClasses("secondary", "md", "h-control-sm px-4")}
              >
                {copy.emptyCategory.callLabel}
              </a>
              <button
                type="button"
                onClick={() => setFilter(null)}
                className={buttonClasses("link")}
              >
                {copy.emptyCategory.showAllLabel}
              </button>
            </ShopEmpty>
          }
          gridClassName="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
        />
      </section>
    </>
  );
}

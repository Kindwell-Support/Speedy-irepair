"use client";

import type { MouseEvent } from "react";
import type { CategoryKey } from "@/lib/shop/types";
import { CategoryIcon } from "./CategoryIcon";

/**
 * Design .cat-tiles: 2-col / 5-col tiles. Real links (/shop?category=…#products) so they work without JS;
 * with JS they set the grid filter in place (no reload) and scroll to the products.
 */
export function CategoryTiles({
  heading,
  categories,
  onSelect,
}: {
  heading: string;
  categories: { key: CategoryKey; label: string }[];
  onSelect: (key: CategoryKey) => void;
}) {
  const handle = (e: MouseEvent<HTMLAnchorElement>, key: CategoryKey) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelect(key);
    window.history.replaceState(null, "", `?category=${key}#products`);
    document.getElementById("products")?.scrollIntoView();
  };
  return (
    <section aria-labelledby="cat-h" className="mb-16">
      <h2 id="cat-h" className="mb-4 text-label font-semibold uppercase text-text-secondary">
        {heading}
      </h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-5" data-testid="category-tiles">
        {categories.map((c) => (
          <li key={c.key}>
            <a
              href={`/shop?category=${c.key}#products`}
              onClick={(e) => handle(e, c.key)}
              className="grid min-h-36 content-between gap-4 rounded-xl border border-border bg-surface p-6 transition-colors duration-instant hover:border-border-strong hover:bg-surface-2 focus-visible:shadow-focus"
            >
              <CategoryIcon category={c.key} />
              <span className="text-h5">{c.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

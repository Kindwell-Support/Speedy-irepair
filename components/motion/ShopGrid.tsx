"use client";
/**
 * A4 — /shop category filter with Framer Motion layout animations (REQ-054).
 * Purpose: "what just happened" — remaining cards glide to their new slots,
 * removed cards fade/scale out (AnimatePresence popLayout), tab underline slides (layoutId).
 * Generic: the Frontend supplies products + renderItem (prices come from Shopify/Sanity only).
 * Reduced motion: instant re-flow.
 */
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

type Props<T> = {
  items: T[];
  categories: string[]; // e.g. ["iPhones","iPads","Apple Watch","MacBooks","Accessories"]
  getKey: (item: T) => string;
  getCategory: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  allLabel?: string;
  className?: string;
  tabsClassName?: string;
  tabClassName?: string;
  gridClassName?: string;
  onFilterChange?: (category: string | null) => void;
};

export function ShopGrid<T>({
  items,
  categories,
  getKey,
  getCategory,
  renderItem,
  allLabel = "All",
  className,
  tabsClassName,
  tabClassName,
  gridClassName,
  onFilterChange,
}: Props<T>) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string | null>(null);
  const visible = useMemo(() => (filter ? items.filter((i) => getCategory(i) === filter) : items), [items, filter, getCategory]);
  const t = reduced ? { duration: 0 } : { duration: 0.3, ease: FM_EASE.inOut };
  const tabs: (string | null)[] = [null, ...categories];

  return (
    <div className={className} data-shop-grid>
      <LayoutGroup id="shop-tabs">
        <div role="toolbar" aria-label="Filter products by category" className={tabsClassName}>
          {tabs.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c ?? "all"}
                type="button"
                aria-pressed={active}
                className={cn("relative", tabClassName)}
                onClick={() => {
                  setFilter(c);
                  onFilterChange?.(c);
                }}
              >
                {c ?? allLabel}
                {active && (
                  <motion.span
                    layoutId="shop-tab-underline"
                    transition={t}
                    aria-hidden
                    className="absolute inset-x-0 bottom-[-2px] h-[2px] bg-brand"
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      <p aria-live="polite" className="sr-only">
        {visible.length} products shown
      </p>
      <motion.ul layout className={gridClassName} transition={t}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={getKey(item)}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={t}
            >
              {renderItem(item)}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

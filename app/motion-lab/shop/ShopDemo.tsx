"use client";
import { ShopGrid } from "@/components/motion/ShopGrid";
import { HoverCard } from "@/components/motion/HoverCard";

type Item = { id: string; name: string; cat: string };
const CATS = ["iPhones", "iPads", "Apple Watch", "MacBooks", "Accessories"];
const ITEMS: Item[] = Array.from({ length: 15 }, (_, i) => ({ id: `p${i}`, name: `${CATS[i % 5]} item ${i + 1}`, cat: CATS[i % 5]! }));

export function ShopDemo() {
  return (
    <ShopGrid
      items={ITEMS}
      categories={CATS}
      getKey={(i) => i.id}
      getCategory={(i) => i.cat}
      tabsClassName="mb-8 flex flex-wrap gap-6"
      tabClassName="py-2 text-body-sm text-text-secondary aria-pressed:text-text"
      gridClassName="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3"
      renderItem={(i) => (
        <HoverCard className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 aspect-[4/3] rounded-md bg-surface-2" />
          <h3 className="text-h6">{i.name}</h3>
          <p className="text-caption text-text-tertiary">{i.cat}</p>
        </HoverCard>
      )}
    />
  );
}

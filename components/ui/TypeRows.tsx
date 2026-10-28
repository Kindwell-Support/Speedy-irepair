import { cn } from "@/lib/utils/cn";

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
};

/**
 * Short CMS lists that are only names (values, who a plan is for, what you can finance): set as headline type
 * rather than boxed in cards, so a three-word list carries the section instead of rattling in it.
 */
export function TypeRows({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-8", COLS[items.length] ?? "md:grid-cols-3", className)}>
      {items.map((i) => (
        <li key={i} className="font-heading text-h3 font-black">
          {i}
        </li>
      ))}
    </ul>
  );
}

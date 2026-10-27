import { cn } from "@/lib/utils/cn";

const STAR = "M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8L6 11.6l-4.3-4 5.8-.7z";

/** One solid star glyph (SVG, never the ★ character). Inherits colour from `currentColor`. */
export function StarIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn("inline-block h-[0.8em] w-[0.8em] shrink-0", className)} fill="currentColor">
      <path d={STAR} />
    </svg>
  );
}

/** A 0–5 star rating. Filled stars use the brand red; the rest sit in the disabled grey. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={cn("inline-flex gap-1", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={cn("h-5 w-5", i < Math.round(rating) ? "text-brand" : "text-text-disabled")} />
      ))}
    </span>
  );
}

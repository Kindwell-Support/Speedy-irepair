/**
 * Hero proof row: three big figures set like the "Fixed in 45 min" line opposite, so the two bottom corners
 * balance. data-counter attributes drive the GSAP count-ups; the 45-minute figure is the hero's own, so it is
 * not repeated here.
 * Server component. Animation driven by bindHeroEntrance in lib/motion/bindings.ts.
 */
import { StarIcon } from "@/components/ui/Stars";

const STATS = [
  { counter: 4.9, suffix: <StarIcon className="ml-1.5 h-[0.8em] w-[0.8em] text-brand" />, label: "Google rating", aria: "4.9 star Google rating" },
  { counter: 1000, suffix: "+", label: "Reviews", aria: "Over 1,000 reviews" },
  { counter: 90, suffix: "-day", label: "Warranty", aria: "90-day warranty on repairs" },
];

function display(n: number): string {
  return n % 1 !== 0 ? n.toFixed(1) : n.toLocaleString("en-US");
}

export function TrustBar() {
  return (
    <ul data-trust-bar className="flex flex-wrap gap-x-10 gap-y-4" aria-label="Trust indicators">
      {STATS.map((stat) => (
        <li key={stat.label} aria-label={stat.aria}>
          <span aria-hidden className="flex items-center font-heading text-h4 font-black uppercase tabular-nums text-text">
            <span data-counter={stat.counter}>{display(stat.counter)}</span>
            {stat.suffix}
          </span>
          <span aria-hidden className="mt-2 block text-body-sm font-semibold uppercase tracking-[0.06em] text-text-secondary">
            {stat.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

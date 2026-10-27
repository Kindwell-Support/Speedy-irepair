/**
 * Hero trust row — one plain line of figures with data-counter attributes for GSAP animated counters. Sits under
 * the hero's visit text; the 45-minute figure is the hero's big number, so it is not repeated here.
 * Server component. Animation driven by bindHeroEntrance in lib/motion/bindings.ts.
 */
import { StarIcon } from "@/components/ui/Stars";

const STATS = [
  { counter: 4.9, suffix: <StarIcon className="ml-1 -translate-y-px text-brand" />, label: "Google", aria: "4.9 star Google rating" },
  { counter: 1000, suffix: "+", label: "reviews", aria: "Over 1,000 reviews" },
  { counter: 10, suffix: "+", label: "years", aria: "Over 10 years of experience" },
];

function display(n: number): string {
  return n % 1 !== 0 ? n.toFixed(1) : n.toLocaleString("en-US");
}

export function TrustBar() {
  return (
    <ul data-trust-bar className="flex flex-wrap gap-x-6 gap-y-1 text-body text-text-secondary" aria-label="Trust indicators">
      {STATS.map((stat) => (
        <li key={stat.label} className="inline-flex items-baseline gap-2" aria-label={stat.aria}>
          <span className="inline-flex items-center font-semibold tabular-nums text-text">
            <span data-counter={stat.counter}>{display(stat.counter)}</span>
            {stat.suffix}
          </span>
          {stat.label}
        </li>
      ))}
    </ul>
  );
}

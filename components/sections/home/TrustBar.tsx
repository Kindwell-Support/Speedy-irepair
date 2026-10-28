/**
 * Proof row: three big figures set like the hero's "Fixed in 45 min" line (the 45-minute figure is the hero's
 * own, so it is not repeated here). Lives on HeroProof's red panel, so everything is white: the star included,
 * since brand red would vanish on it. Stacks on phones, one row from md.
 */
import { StarIcon } from "@/components/ui/Stars";

const STATS = [
  { value: "4.9", suffix: <StarIcon className="ml-1.5 h-[0.8em] w-[0.8em] text-text" />, label: "Google rating", aria: "4.9 star Google rating" },
  { value: "1,000", suffix: "+", label: "Reviews", aria: "Over 1,000 reviews" },
  { value: "90", suffix: "-day", label: "Warranty", aria: "90-day warranty on repairs" },
];

export function TrustBar() {
  return (
    <ul className="grid grid-cols-1 gap-5 text-center md:grid-cols-3 md:gap-6" aria-label="Trust indicators">
      {STATS.map((stat) => (
        <li key={stat.label} aria-label={stat.aria}>
          <span aria-hidden className="flex items-center justify-center font-heading text-h4 font-black uppercase tabular-nums text-text">
            {stat.value}
            {stat.suffix}
          </span>
          <span aria-hidden className="mt-2 block text-body-sm font-semibold uppercase tracking-[0.06em] text-text opacity-80">
            {stat.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

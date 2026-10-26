import type { HeroChip } from "@/lib/sanity/types";

function ChipIcon({ name }: { name: HeroChip["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-brand"
    >
      {name === "shield" ? (
        <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" />
      ) : (
        <>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
          <rect x="4" y="8" width="16" height="11" rx="2" />
          <path d="M16 13.5h.01" strokeWidth="2.4" />
        </>
      )}
    </svg>
  );
}

/** Design .hero__trust: ruled row of short trust chips under the hero CTAs. */
export function HeroChips({ chips }: { chips: HeroChip[] }) {
  if (!chips.length) return null;
  return (
    <ul
      className="mt-6 flex flex-wrap gap-6 border-t border-border-subtle pt-6 text-body-sm text-text-secondary"
      data-testid="hero-chips"
    >
      {chips.map((c) => (
        <li key={c.label} className="inline-flex items-center gap-2">
          <ChipIcon name={c.icon} />
          {c.label}
        </li>
      ))}
    </ul>
  );
}

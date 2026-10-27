import type { BusinessInfo } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

function to12h(t: string): string {
  const [hRaw, m] = t.split(":");
  const h = Number(hRaw);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}

/**
 * One line for tight spots: runs of consecutive days with the same hours, closed days left out
 * ("Mon–Sat 12 PM – 6 PM"). Null while hours are a placeholder.
 */
export function hoursSummary(business: BusinessInfo): string | null {
  if (business.hoursIsPlaceholder) return null;
  const runs: { from: string; to: string; span: string }[] = [];
  let prev: string | null = null;
  for (const h of business.hours) {
    const span = h.closed || !h.opens || !h.closes ? null : `${to12h(h.opens)} – ${to12h(h.closes)}`;
    const last = runs[runs.length - 1];
    if (span && last && span === prev) last.to = h.day;
    else if (span) runs.push({ from: h.day, to: h.day, span });
    prev = span;
  }
  if (!runs.length) return null;
  const day = (d: string) => d.slice(0, 3);
  return runs.map((r) => `${day(r.from)}${r.to !== r.from ? `–${day(r.to)}` : ""} ${r.span}`).join(", ");
}

/** Opening hours from siteSettings (Decision #2). Falls back to the placeholder text when flagged. */
export function HoursList({ business, compact = false }: { business: BusinessInfo; compact?: boolean }) {
  if (business.hoursIsPlaceholder)
    return (
      <p className="text-body-sm text-text-secondary">
        <PlaceholderMark show>{business.hoursPlaceholderText}</PlaceholderMark>
      </p>
    );
  return (
    <dl className={compact ? "space-y-1 text-body-sm" : "space-y-2 text-body"}>
      {business.hours.map((h) => (
        <div key={h.day} className="flex justify-between gap-6">
          <dt className="text-text-secondary">{h.day}</dt>
          <dd className="text-text-primary">{h.closed || !h.opens || !h.closes ? "Closed" : `${to12h(h.opens)} – ${to12h(h.closes)}`}</dd>
        </div>
      ))}
    </dl>
  );
}

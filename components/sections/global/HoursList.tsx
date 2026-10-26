import type { BusinessInfo } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

function to12h(t: string): string {
  const [hRaw, m] = t.split(":");
  const h = Number(hRaw);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}

/** Opening hours from siteSettings (Decision #2). Falls back to the placeholder text when flagged. */
export function HoursList({
  business,
  compact = false,
}: {
  business: BusinessInfo;
  compact?: boolean;
}) {
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
          <dd className="text-text-primary">
            {h.closed || !h.opens || !h.closes
              ? "Closed"
              : `${to12h(h.opens)} – ${to12h(h.closes)}`}
          </dd>
        </div>
      ))}
    </dl>
  );
}

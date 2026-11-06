import type { PriceLine } from "@/lib/sanity/types";

/** Lists longer than this split into one collapsed group per brand; shorter ones stay a plain table. */
const GROUP_THRESHOLD = 10;

/** Brand groups in display order, matched on how the Studio labels start ("iPhone 13 screen", "Galaxy S24 screen"). */
const GROUPS: { name: string; match: RegExp }[] = [
  { name: "iPhone", match: /^iphone\b/i },
  { name: "Samsung", match: /^(galaxy|samsung)\b/i },
];
const OTHER = "Other";

const groupOf = (label: string) => GROUPS.find((g) => g.match.test(label.trim()))?.name ?? OTHER;

/** Lowest price in a group, for the "from $X" on the closed row. Rows that aren't a plain number are skipped. */
function lowestPrice(rows: PriceLine[]) {
  const values = rows.map((r) => Number.parseFloat(r.price.replace(/[^0-9.]/g, ""))).filter(Number.isFinite);
  return values.length ? rows[values.indexOf(Math.min(...values))]?.price ?? null : null;
}

function Rows({ rows }: { rows: PriceLine[] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((p, i) => (
        <div key={`${p.label}-${i}`} className="flex items-baseline justify-between gap-6 py-2.5">
          <dt className="text-body text-text-secondary">{p.label}</dt>
          <dd className="text-body font-bold tabular-nums text-text-primary">{p.price}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A service's price list. Long lists (Screen Repair) become one collapsed <details> per brand with a "from" price,
 * so the page isn't a 60-row scroll; the rows stay in the HTML either way.
 */
export function PriceTable({ prices, serviceTitle, className = "" }: { prices: PriceLine[]; serviceTitle: string; className?: string }) {
  const rows = prices.filter((p) => p.label && p.price);
  if (!rows.length) return null;

  const order = [...GROUPS.map((g) => g.name), OTHER];
  const groups = order
    .map((name) => ({ name, rows: rows.filter((r) => groupOf(r.label) === name) }))
    .filter((g) => g.rows.length);

  if (rows.length <= GROUP_THRESHOLD || groups.length < 2) {
    return (
      <div className={`max-w-md border-y border-border ${className}`}>
        <Rows rows={rows} />
      </div>
    );
  }

  // "Screen Repair" -> "screen", so the rows read "iPhone screen prices".
  const noun = serviceTitle.replace(/\s+(repair|replacement)$/i, "").toLowerCase();

  return (
    <div className={`grid max-w-md gap-2 ${className}`}>
      {groups.map((g) => {
        const from = lowestPrice(g.rows);
        return (
          <details
            key={g.name}
            className="group rounded-md border border-border bg-surface-2 [&>summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md px-5 py-3 transition-colors duration-fast hover:text-primary-text focus-visible:shadow-focus">
              <span className="text-body font-bold">
                {g.name === OTHER ? `Other ${noun} prices` : `${g.name} ${noun} prices`}
                {from ? <span className="ml-2 font-normal text-text-secondary">from {from}</span> : null}
              </span>
              <span
                aria-hidden
                className="text-h5 leading-none text-primary-text transition-transform duration-fast group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="border-t border-border px-5 pb-1">
              <Rows rows={g.rows} />
            </div>
          </details>
        );
      })}
    </div>
  );
}

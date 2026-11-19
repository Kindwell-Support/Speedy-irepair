import type { QuotePrice } from "@/lib/repair-prices";
import { StepHeading, continueClass } from "./ui";

/** Repairs that can't be priced before the shop has looked at the device. */
export const INSPECTION_ISSUES: readonly string[] = ["Water Damage", "Software Issue"];

/** The price lines for one repair, with the CMS disclaimer under them. Shared by /repair and /instant-quote. */
export function PriceList({ prices, disclaimer }: { prices: QuotePrice[]; disclaimer: string }) {
  return (
    <>
      <dl className="divide-y divide-border border-y border-border">
        {prices.map((p, i) => (
          <div key={`${p.label}-${i}`} className="flex items-baseline justify-between gap-6 py-4">
            <dt className="text-body-lg text-text-secondary">{p.label}</dt>
            <dd className="font-heading text-h4 font-black tabular-nums text-text">{p.price}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-body-sm text-text-tertiary">{disclaimer}</p>
    </>
  );
}

/**
 * /repair step 6, before the time picker: the price from the service pages' price lists (lib/repair-prices.ts),
 * "quote after inspection" for water damage and software faults, or "priced in store" when the CMS has no price.
 */
export function PriceStep({
  repair,
  issue,
  prices,
  disclaimer,
  onContinue,
}: {
  /** "Apple iPhone 15, cracked screen" */
  repair: string;
  issue: string;
  prices: QuotePrice[];
  disclaimer: string;
  onContinue: () => void;
}) {
  const inspection = INSPECTION_ISSUES.includes(issue);
  return (
    <>
      {prices.length && !inspection ? (
        <>
          <StepHeading title="Your repair price" intro={`${repair}.`} />
          <PriceList prices={prices} disclaimer={disclaimer} />
        </>
      ) : inspection ? (
        <StepHeading
          title="Quote after inspection"
          intro={`${repair}. This one needs a look before we can price it. We'll check your device in store and give you a price before we start any work.`}
        />
      ) : (
        <StepHeading
          title="We'll price it in store"
          intro={`${repair}. We don't have a set price for this one yet. We'll look at it when you come in and give you a price before we start any work.`}
        />
      )}
      <button type="button" className={`${continueClass} mt-8`} onClick={onContinue}>
        {prices.length && !inspection ? "Book this repair" : "Pick a time"}
      </button>
    </>
  );
}

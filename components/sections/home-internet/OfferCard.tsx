import { CountUp } from "@/components/motion/CountUp";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";

/** A "$40/month"-style figure inside the CMS item text (whatYouGet[]). Nothing is invented: no match, no figure. */
const PRICE = /\$(\d+(?:\.(\d+))?)(\s*\/\s*[a-z]+)?/i;

/**
 * Design home-internet.html `.offer .card`: icon, big figure, short line. The figure is parsed from the
 * CMS item ("Home internet for $40/month" → $40 /month, counted up by Motion's CountUp; SSR shows $40).
 */
export function OfferCard({
  item,
  icon,
  priceSource,
}: {
  item: string;
  icon: LineIconName;
  /** CMS text to take the figure from when the item has none (the page hero headline "…for $40/month."). */
  priceSource?: string;
}) {
  const m = PRICE.exec(item) ?? (priceSource ? PRICE.exec(priceSource) : null);
  return (
    <li
      className="grid content-start gap-3 rounded-xl border border-border bg-surface p-6"
      data-testid="offer-card"
    >
      <LineIcon name={icon} size={28} className="text-brand" />
      {m ? (
        <span
          data-testid="offer-price"
          className="text-h2 font-extrabold leading-none tracking-[-0.03em] text-text"
        >
          <CountUp value={Number(m[1])} decimals={m[2]?.length ?? 0} prefix="$" />
          {m[3] ? <span className="text-h5 font-semibold">{m[3].replace(/\s+/g, "")}</span> : null}
        </span>
      ) : null}
      <p className="text-body-sm text-text-secondary">{item}</p>
    </li>
  );
}

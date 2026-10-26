import Image from "next/image";
import type { CartLine } from "@/lib/shop/types";
import type { PdpChromeCopy } from "@/lib/sanity/types";
import { formatPrice } from "@/lib/utils/format";

/** One cart line in the drawer: thumb, title / variant, design `.qty` stepper, line cost. */
export function CartLineItem({
  line,
  copy,
  busy,
  onQuantity,
}: {
  line: CartLine;
  copy: PdpChromeCopy["drawer"];
  busy: boolean;
  onQuantity: (lineId: string, quantity: number) => void;
}) {
  return (
    <li data-testid="cart-line" className="grid grid-cols-[64px_1fr_auto] gap-4 py-4">
      <div className="relative size-16 overflow-hidden rounded-md bg-surface-2">
        {line.image ? (
          <Image
            src={line.image.url}
            alt={line.image.altText || line.productTitle}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        ) : null}
      </div>
      <div className="grid min-w-0 content-start gap-1">
        <p className="truncate text-body-sm font-semibold">{line.productTitle}</p>
        {line.variantTitle ? (
          <p className="text-caption text-text-tertiary">{line.variantTitle}</p>
        ) : null}
        <div
          role="group"
          aria-label={copy.quantityLabel}
          className="mt-2 inline-flex h-10 items-center self-start rounded-full border border-border"
        >
          <button
            type="button"
            aria-label={copy.decreaseLabel}
            disabled={busy}
            onClick={() => onQuantity(line.id, line.quantity - 1)}
            className="size-10 rounded-full text-body disabled:text-text-disabled"
          >
            −
          </button>
          <span className="min-w-8 text-center text-body-sm tabular-nums" aria-live="polite">
            {line.quantity}
          </span>
          <button
            type="button"
            aria-label={copy.increaseLabel}
            disabled={busy}
            onClick={() => onQuantity(line.id, line.quantity + 1)}
            className="size-10 rounded-full text-body disabled:text-text-disabled"
          >
            +
          </button>
        </div>
      </div>
      <p className="text-body-sm tabular-nums">
        {formatPrice(line.cost.amount, line.cost.currencyCode)}
      </p>
    </li>
  );
}

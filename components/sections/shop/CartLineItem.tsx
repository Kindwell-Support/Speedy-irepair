import { QuantityStepper } from "./QuantityStepper";
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
        <div className="mt-2">
          <QuantityStepper
            value={line.quantity}
            min={0}
            max={99}
            disabled={busy}
            onChange={(q) => onQuantity(line.id, q)}
            labels={{
              group: copy.quantityLabel,
              decrease: copy.decreaseLabel,
              increase: copy.increaseLabel,
            }}
          />
        </div>
      </div>
      <p className="text-body-sm tabular-nums">
        {formatPrice(line.cost.amount, line.cost.currencyCode)}
      </p>
    </li>
  );
}

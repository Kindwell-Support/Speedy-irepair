"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useTransition, type ReactNode } from "react";
import type { Cart } from "@/lib/shop/types";
import type { PdpChromeCopy } from "@/lib/sanity/types";
import { addToCart, goToCheckout, updateCartLine } from "@/lib/shop/actions";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { LineIcon } from "@/components/ui/LineIcon";
import { QuantityStepper } from "@/components/sections/shop/QuantityStepper";
import { VariantOptions } from "@/components/sections/shop/VariantOptions";
import type { CartNotice } from "@/components/sections/shop/CartDrawer";

/** Drawer code is only fetched after the first add (keeps it out of the PDP's first-load JS). */
const CartDrawer = dynamic(
  () => import("@/components/sections/shop/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);

export type BuyVariant = {
  id: string;
  title: string;
  available: boolean;
  price: string;
  options: { name: string; value: string }[];
};

const MAX_QTY = 10;

/**
 * Buy box (design shop-product.html): option groups (Shopify options) or a select, quantity stepper,
 * Add to Cart (default → Adding → Added / Sold out). A successful add opens the cart drawer; on staging
 * (no Storefront token) the drawer opens with the staging notice. `children` renders under the CTA row
 * (the Acima button + note from the route).
 */
export function AddToCart({
  variants,
  options,
  checkoutEnabled,
  copy,
  children,
}: {
  variants: BuyVariant[];
  /** Shopify product options with more than one value (single "Default Title" products pass []). */
  options: { name: string; values: string[] }[];
  checkoutEnabled: boolean;
  copy: PdpChromeCopy;
  children?: ReactNode;
}) {
  const first = variants.find((v) => v.available) ?? variants[0];
  const [variantId, setVariantId] = useState(first?.id ?? "");
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [added, setAdded] = useState(false);
  const [drawer, setDrawer] = useState<"unmounted" | "open" | "closed">("unmounted");
  const [pending, start] = useTransition();
  // The add button is disabled while pending, so focus return would land on <body>; restore it on close.
  const addRef = useRef<HTMLButtonElement>(null);
  const selected = variants.find((v) => v.id === variantId);
  const soldOut = !selected?.available;
  const choose = (id: string) => {
    setVariantId(id);
    setAdded(false);
  };

  return (
    <div className="mt-8 grid gap-6" data-testid="buy-box">
      {options.length ? (
        <VariantOptions
          options={options}
          variants={variants}
          selectedId={variantId}
          onSelect={choose}
          soldOutLabel={copy.soldOutLabel}
        />
      ) : variants.length > 1 ? (
        <label className="block">
          <span className="mb-2 block text-label">{copy.optionLabel}</span>
          <select
            className="h-control-md w-full rounded-md border border-border bg-surface px-3 focus-visible:shadow-focus focus-visible:outline-none"
            value={variantId}
            onChange={(e) => choose(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.available}>
                {v.title} — {v.price}
                {v.available ? "" : ` (${copy.soldOutLabel})`}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper
          size="lg"
          value={qty}
          max={MAX_QTY}
          disabled={soldOut || pending}
          onChange={(n) => {
            setQty(n);
            setAdded(false);
          }}
          labels={{
            group: copy.drawer.quantityLabel,
            decrease: copy.drawer.decreaseLabel,
            increase: copy.drawer.increaseLabel,
          }}
          testId="pdp-qty"
        />
        <button
          ref={addRef}
          type="button"
          data-testid="add-to-cart"
          aria-busy={pending || undefined}
          className={buttonClasses(added ? "secondary" : "primary", "lg", "flex-1")}
          disabled={pending || soldOut}
          onClick={() =>
            start(async () => {
              const r = await addToCart(variantId, qty);
              if (r.ok) {
                setCart(r.cart);
                setAdded(true);
                setNotice(null);
              } else setNotice({ tone: r.staging ? "staging" : "error", text: r.message });
              setDrawer("open");
            })
          }
        >
          {added ? <LineIcon name="check" size={18} /> : null}
          {soldOut
            ? copy.soldOutLabel
            : pending
              ? copy.addingLabel
              : added
                ? copy.addedLabel
                : copy.addLabel}
        </button>
        {children}
        {drawer === "closed" ? (
          <button type="button" className={buttonClasses("link")} onClick={() => setDrawer("open")}>
            {copy.viewCartLabel}
          </button>
        ) : null}
      </div>
      {drawer !== "unmounted" ? (
        <CartDrawer
          open={drawer === "open"}
          onClose={() => {
            setDrawer("closed");
            requestAnimationFrame(() => addRef.current?.focus());
          }}
          cart={cart}
          notice={notice}
          copy={copy.drawer}
          checkoutEnabled={checkoutEnabled}
          updateLine={updateCartLine}
          checkout={goToCheckout}
        />
      ) : null}
    </div>
  );
}

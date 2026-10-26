"use client";
import dynamic from "next/dynamic";
import { useRef, useState, useTransition } from "react";
import type { Cart } from "@/lib/shop/types";
import type { PdpChromeCopy } from "@/lib/sanity/types";
import { addToCart, goToCheckout, updateCartLine } from "@/lib/shop/actions";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { LineIcon } from "@/components/ui/LineIcon";
import type { CartNotice } from "@/components/sections/shop/CartDrawer";

/** Drawer code is only fetched after the first add (keeps it out of the PDP's first-load JS). */
const CartDrawer = dynamic(
  () => import("@/components/sections/shop/CartDrawer").then((m) => m.CartDrawer),
  {
    ssr: false,
  },
);

type V = { id: string; title: string; available: boolean; price: string };

/**
 * Buy box (design shop-product.html Frame 1 states: default → Adding → Added / Sold out).
 * A successful add opens the cart drawer; on staging (no Storefront token) the drawer opens with the
 * staging notice so the flow is still reviewable. Errors render inside the drawer's live region.
 */
export function AddToCart({
  variants,
  checkoutEnabled,
  copy,
}: {
  variants: V[];
  checkoutEnabled: boolean;
  copy: PdpChromeCopy;
}) {
  const first = variants.find((v) => v.available) ?? variants[0];
  const [variantId, setVariantId] = useState(first?.id ?? "");
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [added, setAdded] = useState(false);
  const [drawer, setDrawer] = useState<"unmounted" | "open" | "closed">("unmounted");
  const [pending, start] = useTransition();
  // The add button is disabled while pending, so the dialog's native focus return lands on <body>; restore it here.
  const addRef = useRef<HTMLButtonElement>(null);
  const selected = variants.find((v) => v.id === variantId);
  const soldOut = !selected?.available;

  return (
    <div className="mt-8 space-y-4" data-testid="buy-box">
      {variants.length > 1 ? (
        <label className="block">
          <span className="mb-2 block text-label">{copy.optionLabel}</span>
          <select
            className="h-control-md w-full rounded-md border border-border bg-surface px-3"
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              setAdded(false);
            }}
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
      <div className="flex flex-wrap gap-4">
        <button
          ref={addRef}
          type="button"
          data-testid="add-to-cart"
          aria-busy={pending || undefined}
          className={buttonClasses(added ? "secondary" : "primary", "lg")}
          disabled={pending || soldOut}
          onClick={() =>
            start(async () => {
              const r = await addToCart(variantId, 1);
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

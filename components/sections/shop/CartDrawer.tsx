"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Cart } from "@/lib/shop/types";
import type { PdpChromeCopy } from "@/lib/sanity/types";
import type { CartActionResult } from "@/lib/shop/actions";
import { formatPrice } from "@/lib/utils/format";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { Notice } from "@/components/ui/Notice";
import { LineIcon } from "@/components/ui/LineIcon";
import { Drawer } from "@/components/motion/Drawer";
import { CartLineItem } from "./CartLineItem";

export type CartNotice = { tone: "success" | "error" | "staging"; text: string };

/**
 * Cart drawer content (design shop-product.html: "Added" opens the cart drawer, which links to Shopify
 * checkout) inside Motion's <Drawer> (focus trap, Escape, aria-modal, inert page, scroll lock, slide-in).
 * Loaded with next/dynamic only after the first add.
 */
export function CartDrawer({
  open,
  onClose,
  cart: initialCart,
  notice,
  copy,
  checkoutEnabled,
  updateLine,
  checkout,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
  notice: CartNotice | null;
  copy: PdpChromeCopy["drawer"];
  checkoutEnabled: boolean;
  /** Server actions passed from the route (components never import lib/shop/actions at runtime). */
  updateLine: (lineId: string, quantity: number) => Promise<CartActionResult>;
  checkout: () => Promise<void>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [cart, setCart] = useState(initialCart);
  const [lineError, setLineError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => setCart(initialCart), [initialCart]);

  const lines = cart?.lines ?? [];
  const setQuantity = (lineId: string, quantity: number) =>
    start(async () => {
      const r = await updateLine(lineId, Math.max(0, quantity));
      if (r.ok) {
        setCart(r.cart);
        setLineError(null);
      } else setLineError(r.message);
    });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      ariaLabel={copy.title}
      closeLabel={null}
      testId="cart-drawer"
      initialFocusRef={closeRef}
      className="bg-surface text-text"
      footer={
        <div className="grid gap-4 py-2">
          {cart && lines.length ? (
            <div className="flex items-baseline justify-between">
              <span className="text-body-sm text-text-secondary">{copy.subtotalLabel}</span>
              <span className="text-h5 tabular-nums">
                {formatPrice(cart.subtotal.amount, cart.subtotal.currencyCode)}
              </span>
            </div>
          ) : null}
          <p className="text-caption text-text-tertiary">{copy.checkoutNote}</p>
          <button
            type="button"
            className={buttonClasses("primary", "lg", "w-full")}
            disabled={!checkoutEnabled || !lines.length || pending}
            onClick={() => start(() => checkout())}
            data-testid="cart-checkout"
          >
            {copy.checkoutLabel}
          </button>
          <button
            type="button"
            className={buttonClasses("secondary", "lg", "w-full")}
            onClick={onClose}
          >
            {copy.continueLabel}
          </button>
        </div>
      }
    >
      {/* Own sticky header (not Drawer's built-in one) so the icon close button keeps data-testid="cart-drawer-close". */}
      <div className="sticky -top-6 z-10 -mx-6 -mt-6 flex items-center justify-between border-b border-border-subtle bg-surface px-6 py-4">
        <h2 className="flex items-center gap-2 text-h5">
          <LineIcon name="cart" size={20} className="text-brand" />
          {copy.title}
          {cart?.totalQuantity ? (
            <span className="text-body-sm tabular-nums text-text-tertiary">
              ({cart.totalQuantity})
            </span>
          ) : null}
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={copy.closeLabel}
          data-testid="cart-drawer-close"
          className="grid size-10 place-items-center rounded-full border border-border hover:bg-surface-2 focus-visible:shadow-focus"
        >
          <LineIcon name="close" size={18} />
        </button>
      </div>
      <div aria-live="polite" className="grid gap-2 pt-4 empty:hidden">
        {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
        {lineError ? <Notice tone="error">{lineError}</Notice> : null}
      </div>
      {lines.length ? (
        <ul className="divide-y divide-border-subtle" aria-busy={pending}>
          {lines.map((l) => (
            <CartLineItem key={l.id} line={l} copy={copy} busy={pending} onQuantity={setQuantity} />
          ))}
        </ul>
      ) : (
        <div className="grid justify-items-center gap-2 py-16 text-center" data-testid="cart-empty">
          <LineIcon name="cart" size={32} className="text-text-tertiary" />
          <p className="text-h5">{copy.emptyTitle}</p>
          <p className="text-body-sm text-text-secondary">{copy.emptyBody}</p>
        </div>
      )}
    </Drawer>
  );
}

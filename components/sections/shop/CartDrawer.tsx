"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Cart } from "@/lib/shop/types";
import type { PdpChromeCopy } from "@/lib/sanity/types";
import type { CartActionResult } from "@/lib/shop/actions";
import { formatPrice } from "@/lib/utils/format";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { Notice } from "@/components/ui/Notice";
import { LineIcon } from "@/components/ui/LineIcon";
import { CartLineItem } from "./CartLineItem";

export type CartNotice = { tone: "success" | "error" | "staging"; text: string };

/**
 * Cart drawer markup (design shop-product.html: "Added" opens the cart drawer, which links to Shopify
 * checkout). Native <dialog> + showModal() gives the focus trap, Esc, inert page and focus return for
 * free. Right-anchored panel; the slide-in (320ms) is the Motion lane's, keyed on
 * data-animate="drawer" + data-state. Loaded with next/dynamic only after the first add.
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
  const ref = useRef<HTMLDialogElement>(null);
  const [cart, setCart] = useState(initialCart);
  const [lineError, setLineError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => setCart(initialCart), [initialCart]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

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
    <dialog
      ref={ref}
      aria-labelledby="cart-drawer-title"
      data-testid="cart-drawer"
      data-animate="drawer"
      data-state={open ? "open" : "closed"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[420px] border-0 border-l border-border bg-surface p-0 text-text backdrop:bg-[rgb(0_0_0/0.6)]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 id="cart-drawer-title" className="flex items-center gap-2 text-h5">
            <LineIcon name="cart" size={20} className="text-brand" />
            {copy.title}
            {cart?.totalQuantity ? (
              <span className="text-body-sm tabular-nums text-text-tertiary">
                ({cart.totalQuantity})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeLabel}
            data-testid="cart-drawer-close"
            className="grid size-10 place-items-center rounded-full border border-border hover:bg-surface-2 focus-visible:shadow-focus"
          >
            <LineIcon name="close" size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6">
          <div aria-live="polite" className="grid gap-2 pt-4 empty:hidden">
            {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
            {lineError ? <Notice tone="error">{lineError}</Notice> : null}
          </div>
          {lines.length ? (
            <ul className="divide-y divide-border-subtle" aria-busy={pending}>
              {lines.map((l) => (
                <CartLineItem
                  key={l.id}
                  line={l}
                  copy={copy}
                  busy={pending}
                  onQuantity={setQuantity}
                />
              ))}
            </ul>
          ) : (
            <div
              className="grid justify-items-center gap-2 py-16 text-center"
              data-testid="cart-empty"
            >
              <LineIcon name="cart" size={32} className="text-text-tertiary" />
              <p className="text-h5">{copy.emptyTitle}</p>
              <p className="text-body-sm text-text-secondary">{copy.emptyBody}</p>
            </div>
          )}
        </div>
        <footer className="grid gap-4 border-t border-border-subtle px-6 py-6">
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
        </footer>
      </div>
    </dialog>
  );
}

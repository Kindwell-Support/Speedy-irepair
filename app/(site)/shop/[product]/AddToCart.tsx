"use client";
import { useState, useTransition } from "react";
import { addToCart, goToCheckout } from "@/lib/shop/actions";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { Notice } from "@/components/ui/Notice";

type V = { id: string; title: string; available: boolean; price: string };

export function AddToCart({ variants, checkoutEnabled }: { variants: V[]; checkoutEnabled: boolean }) {
  const first = variants.find((v) => v.available) ?? variants[0];
  const [variantId, setVariantId] = useState(first?.id ?? "");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "staging"; text: string } | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, start] = useTransition();
  const selected = variants.find((v) => v.id === variantId);

  return (
    <div className="mt-8 space-y-4">
      {variants.length > 1 ? (
        <label className="block">
          <span className="mb-2 block text-label">Option</span>
          <select
            className="h-control-md w-full rounded-md border border-border bg-surface px-3"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.available}>
                {v.title} — {v.price}
                {v.available ? "" : " (sold out)"}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClasses("primary", "lg")}
          disabled={pending || !selected?.available}
          onClick={() =>
            start(async () => {
              const r = await addToCart(variantId, 1);
              if (r.ok) {
                setAdded(true);
                setMessage({ tone: "success", text: "Added to cart." });
              } else setMessage({ tone: r.staging ? "staging" : "error", text: r.message });
            })
          }
        >
          {pending ? "Adding…" : selected?.available ? "Add to Cart" : "Sold out"}
        </button>
        {checkoutEnabled && added ? (
          <button type="button" className={buttonClasses("secondary", "lg")} onClick={() => start(() => goToCheckout())}>
            Checkout
          </button>
        ) : null}
      </div>
      <div aria-live="polite">{message ? <Notice tone={message.tone}>{message.text}</Notice> : null}</div>
    </div>
  );
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CART_COOKIE } from "./config";
import { getCatalog } from "./index";
import type { Cart } from "./types";

/**
 * Cart server actions. Cart id lives in an httpOnly cookie; all mutations run server-side.
 * Fixture mode: returns { ok: false, staging: true } so the UI shows the staging notice.
 */
export type CartActionResult =
  | { ok: true; cart: Cart }
  | { ok: false; staging: true; message: string }
  | { ok: false; staging: false; message: string };

const STAGING_MESSAGE = "Staging preview: checkout is not connected yet (Shopify Storefront token pending).";

async function setCartCookie(id: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<CartActionResult> {
  const catalog = getCatalog();
  if (!catalog.supportsCheckout) return { ok: false, staging: true, message: STAGING_MESSAGE };
  try {
    const existing = (await cookies()).get(CART_COOKIE)?.value;
    const cart = existing
      ? await catalog.addLines(existing, [{ merchandiseId, quantity }])
      : await catalog.createCart([{ merchandiseId, quantity }]);
    await setCartCookie(cart.id);
    return { ok: true, cart };
  } catch (error) {
    console.error("[addToCart]", error);
    return { ok: false, staging: false, message: "Could not add to cart. Please try again." };
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartActionResult> {
  const catalog = getCatalog();
  if (!catalog.supportsCheckout) return { ok: false, staging: true, message: STAGING_MESSAGE };
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return { ok: false, staging: false, message: "No cart." };
  const cart = await catalog.updateLines(cartId, [{ id: lineId, quantity }]);
  return { ok: true, cart };
}

export async function getCurrentCart(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return getCatalog().getCart(cartId);
}

/** Redirects to Shopify-hosted checkout (cart.checkoutUrl). */
export async function goToCheckout(): Promise<void> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  const url = cartId ? await getCatalog().checkoutUrl(cartId) : null;
  if (!url) redirect("/shop?checkout=unavailable");
  redirect(url);
}

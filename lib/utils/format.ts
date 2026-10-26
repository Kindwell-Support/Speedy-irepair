/** Format a money amount. `null` means "no price available" and renders "Contact us" (never invent prices). */
export const PRICE_PLACEHOLDER = "Price from Shopify";

/** Formats a Shopify decimal string. Null/unknown => `fallback` (never a made-up number). */
export function formatPrice(amount: string | number | null, currencyCode = "USD", fallback = "Contact us"): string {
  if (amount === null || amount === "") return fallback;
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(value)) return fallback;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(value);
}

/** "1.855.377.3339" -> "tel:+18553773339" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

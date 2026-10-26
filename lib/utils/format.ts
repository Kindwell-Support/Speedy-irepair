/** Format a money amount. `null` means "no price available" and renders "Contact us" (never invent prices). */
export function formatPrice(amount: string | number | null, currencyCode = "USD"): string {
  if (amount === null || amount === "") return "Contact us";
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "Contact us";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(value);
}

/** "1.855.377.3339" -> "tel:+18553773339" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

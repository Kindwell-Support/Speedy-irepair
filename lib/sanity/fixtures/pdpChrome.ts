import type { PdpChromeCopy } from "../types";

/** Design shop-product.html buy box states + cart drawer ("Added" opens the drawer → Shopify checkout). */
export const pdpChrome: PdpChromeCopy = {
  optionLabel: "Option",
  addLabel: "Add to Cart",
  addingLabel: "Adding",
  addedLabel: "Added",
  soldOutLabel: "Sold out",
  viewCartLabel: "View cart",
  inStockLabel: "In stock",
  viewLabel: "View",
  acimaLabel: "Finance with Acima",
  acimaNote: "Lease-to-own through Acima. No credit needed.",
  assurances: [
    {
      key: "shipping",
      title: "Domestic shipping",
      body: "Most orders ship within 7–10 business days via ePacket Mail, with tracking.",
    },
    {
      key: "returns",
      title: "30-day returns",
      body: "Unused, in the original packaging.",
      linkLabel: "Return policy",
      linkHref: "/policies/shipping-return",
    },
    { key: "store", title: "See it in store" },
    { key: "payments", title: "Pay your way", body: "Cards, PayPal and Venmo." },
  ],
  related: { eyebrow: "Related", heading: "You might also like." },
  drawer: {
    title: "Your cart",
    closeLabel: "Close cart",
    emptyTitle: "Your cart is empty.",
    emptyBody: "Add a device or accessory to get started.",
    subtotalLabel: "Subtotal",
    checkoutNote: "Taxes and shipping are calculated at checkout on Shopify.",
    checkoutLabel: "Checkout",
    continueLabel: "Keep shopping",
    quantityLabel: "Quantity",
    decreaseLabel: "Decrease quantity",
    increaseLabel: "Increase quantity",
  },
};

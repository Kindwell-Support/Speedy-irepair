import type { PdpChromeCopy } from "../types";

/** Design shop-product.html buy box states + cart drawer ("Added" opens the drawer → Shopify checkout). */
export const pdpChrome: PdpChromeCopy = {
  optionLabel: "Option",
  addLabel: "Add to Cart",
  addingLabel: "Adding",
  addedLabel: "Added",
  soldOutLabel: "Sold out",
  viewCartLabel: "View cart",
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

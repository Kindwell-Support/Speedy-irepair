import type { ShopChromeCopy } from "../types";

/** Design shop.html: "Shop by category" tiles, shop-bar (filters + sort), loading + empty frames. */
export const shopChrome: ShopChromeCopy = {
  categoriesHeading: "Shop by category",
  productsHeading: "Products",
  filterAriaLabel: "Filter by category",
  allLabel: "All",
  otherCategoryLabel: "Other",
  sortLabel: "Sort",
  sortOptions: {
    featured: "Sort: Featured",
    priceAsc: "Price: low to high",
    priceDesc: "Price: high to low",
  },
  loadingLabel: "Loading products",
  emptyCategory: {
    title: "Nothing here right now.",
    body: "Call us or visit the store to ask about a device.",
    callLabel: "Call us",
    showAllLabel: "Show all",
  },
  emptyCatalog: {
    title: "No devices listed right now",
    body: "New stock is added regularly. Meanwhile, browse our eBay store.",
    ebayLabel: "Shop on eBay",
  },
};

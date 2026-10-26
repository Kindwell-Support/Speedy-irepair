/** Normalised commerce types. Shopify owns catalog data; nothing here comes from Sanity. */
export interface Money {
  /** Decimal string exactly as Shopify returns it, or null when unknown ("Contact us"). */
  amount: string | null;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: ProductImage | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  images: ProductImage[];
  featuredImage: ProductImage | null;
  priceRange: { min: Money; max: Money };
  availableForSale: boolean;
  /** Our category key (lib/shop/config.ts), resolved from collection membership / product type. */
  category: CategoryKey | null;
}

export type CategoryKey = "iphones" | "ipads" | "apple-watch" | "macbooks" | "accessories";

export interface Collection {
  handle: string;
  title: string;
  category: CategoryKey | null;
  products: Product[];
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  productTitle: string;
  variantTitle: string;
  cost: Money;
  image: ProductImage | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string | null;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdate {
  id: string;
  quantity: number;
}

/** Adapter interface. Implementations: shopifyAdapter (Storefront API) and fixtureAdapter (snapshot). */
export interface CatalogProvider {
  readonly name: "shopify" | "fixture";
  /** True when cart/checkout are real (fixture mode shows a staging notice instead). */
  readonly supportsCheckout: boolean;
  listProducts(options?: { category?: CategoryKey; first?: number }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCollection(category: CategoryKey): Promise<Collection | null>;
  createCart(lines?: CartLineInput[]): Promise<Cart>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: CartLineUpdate[]): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | null>;
  checkoutUrl(cartId: string): Promise<string | null>;
}

import snapshot from "./fixtures/snapshot.json";
import { categoryForProductType, SHOP_CATEGORIES } from "./config";
import type { Cart, CatalogProvider, CategoryKey, Money, Product, ProductImage } from "./types";

/**
 * Fixture adapter: serves a verbatim snapshot of the live store's public products.json
 * (lib/shop/fixtures/snapshot.json). Used automatically when Shopify env vars are missing.
 * Cart operations return an empty, non-checkout cart; the UI shows a staging notice (supportsCheckout=false).
 */
type SnapshotProduct = (typeof snapshot.products)[number];

const money = (amount: string | null): Money => ({ amount, currencyCode: "USD" });

function toImage(img: { src: string; width: number; height: number; alt?: string | null }): ProductImage {
  return { url: img.src, width: img.width, height: img.height, altText: img.alt ?? null };
}

function toProduct(p: SnapshotProduct): Product {
  // Prices are deliberately dropped: a snapshot price can be stale, and Shopify is the only price
  // authority (ARCHITECTURE §5). The UI shows "Price from Shopify"; JSON-LD emits no Offer.
  const images = p.images.map(toImage);
  return {
    id: `fixture-${p.id}`,
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.body_html,
    productType: p.product_type,
    tags: p.tags,
    vendor: p.vendor,
    options: p.options,
    images,
    featuredImage: images[0] ?? null,
    variants: p.variants.map((v) => ({
      id: `fixture-variant-${v.id}`,
      title: v.title,
      availableForSale: v.available,
      price: money(null),
      compareAtPrice: null,
      selectedOptions: p.options
        .map((o, i) => ({ name: o.name, value: [v.option1, v.option2, v.option3][i] ?? "" }))
        .filter((o) => o.value),
      image: v.image_src ? (images.find((i) => i.url === v.image_src) ?? null) : null,
    })),
    priceRange: { min: money(null), max: money(null) },
    source: "fixture",
    availableForSale: p.variants.some((v) => v.available),
    category: categoryForProductType(p.product_type),
  };
}

const products: Product[] = snapshot.products.map(toProduct);

const emptyCart = (id = "fixture-cart"): Cart => ({
  id,
  checkoutUrl: null,
  totalQuantity: 0,
  subtotal: money(null),
  lines: [],
});

export const fixtureAdapter: CatalogProvider = {
  name: "fixture",
  supportsCheckout: false,
  async listProducts(options) {
    const list = options?.category ? products.filter((p) => p.category === options.category) : products;
    return list.slice(0, options?.first ?? 250);
  },
  async getProduct(handle) {
    return products.find((p) => p.handle === handle) ?? null;
  },
  async getCollection(category: CategoryKey) {
    const cfg = SHOP_CATEGORIES.find((c) => c.key === category);
    if (!cfg) return null;
    return { handle: cfg.collectionHandle, title: cfg.label, category, products: products.filter((p) => p.category === category) };
  },
  async createCart() {
    return emptyCart();
  },
  async addLines(cartId) {
    return emptyCart(cartId);
  },
  async updateLines(cartId) {
    return emptyCart(cartId);
  },
  async getCart(cartId) {
    return emptyCart(cartId);
  },
  async checkoutUrl() {
    return null;
  },
};

export const fixtureMeta = { source: snapshot._source, fetchedAt: snapshot._fetchedAt };

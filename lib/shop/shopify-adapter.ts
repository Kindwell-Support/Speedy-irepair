import "server-only";
import { serverEnv } from "@/lib/env.server";
import { categoryForProductType, SHOP_CATEGORIES, SHOP_REVALIDATE_SECONDS } from "./config";
import type {
  Cart,
  CartLineInput,
  CartLineUpdate,
  CatalogProvider,
  CategoryKey,
  Money,
  Product,
  ProductImage,
} from "./types";

/**
 * Shopify Storefront API (GraphQL) adapter. API version pinned via SHOPIFY_API_VERSION (default 2025-10).
 * Catalog reads use ISR (revalidate 300 + tag "shopify"); cart ops are uncached.
 * Docs: https://shopify.dev/docs/api/storefront
 */

interface GqlImage { url: string; altText: string | null; width: number | null; height: number | null }
interface GqlMoney { amount: string; currencyCode: string }
interface GqlVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: GqlMoney;
  compareAtPrice: GqlMoney | null;
  selectedOptions: { name: string; value: string }[];
  image: GqlImage | null;
}
interface GqlProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  availableForSale: boolean;
  options: { name: string; values: string[] }[];
  featuredImage: GqlImage | null;
  images: { nodes: GqlImage[] };
  variants: { nodes: GqlVariant[] };
  priceRange: { minVariantPrice: GqlMoney; maxVariantPrice: GqlMoney };
}
interface GqlCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: GqlMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: GqlMoney };
      merchandise: { id: string; title: string; image: GqlImage | null; product: { title: string } };
    }[];
  };
}

const IMAGE = `url altText width height`;
const PRODUCT = `
  id handle title descriptionHtml productType tags vendor availableForSale
  options { name values }
  featuredImage { ${IMAGE} }
  images(first: 10) { nodes { ${IMAGE} } }
  variants(first: 50) { nodes { id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } image { ${IMAGE} } } }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }`;
const CART = `
  id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } }
  lines(first: 100) { nodes { id quantity cost { totalAmount { amount currencyCode } }
    merchandise { ... on ProductVariant { id title image { ${IMAGE} } product { title } } } } }`;

async function storefront<T>(query: string, variables: Record<string, unknown>, cached: boolean): Promise<T> {
  const url = `https://${serverEnv.shopifyStoreDomain}/api/${serverEnv.shopifyApiVersion}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": serverEnv.shopifyStorefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    ...(cached
      ? { next: { revalidate: SHOP_REVALIDATE_SECONDS, tags: ["shopify"] } }
      : { cache: "no-store" as const }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length || !json.data) {
    throw new Error(`Shopify Storefront error: ${json.errors?.map((e) => e.message).join("; ") ?? res.status}`);
  }
  return json.data;
}

const money = (m: GqlMoney | null): Money | null => (m ? { amount: m.amount, currencyCode: m.currencyCode } : null);
const image = (i: GqlImage | null): ProductImage | null =>
  i ? { url: i.url, altText: i.altText, width: i.width ?? 1000, height: i.height ?? 1000 } : null;

function toProduct(p: GqlProduct, category: CategoryKey | null = null): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    productType: p.productType,
    tags: p.tags,
    vendor: p.vendor,
    options: p.options,
    availableForSale: p.availableForSale,
    featuredImage: image(p.featuredImage),
    images: p.images.nodes.map((i) => image(i)).filter((i): i is ProductImage => i !== null),
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: money(v.price) ?? { amount: null, currencyCode: "USD" },
      compareAtPrice: money(v.compareAtPrice),
      selectedOptions: v.selectedOptions,
      image: image(v.image),
    })),
    priceRange: {
      min: money(p.priceRange.minVariantPrice) ?? { amount: null, currencyCode: "USD" },
      max: money(p.priceRange.maxVariantPrice) ?? { amount: null, currencyCode: "USD" },
    },
    category: category ?? categoryForProductType(p.productType),
  };
}

function toCart(c: GqlCart): Cart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: money(c.cost.subtotalAmount) ?? { amount: null, currencyCode: "USD" },
    lines: c.lines.nodes.map((l) => ({
      id: l.id,
      quantity: l.quantity,
      merchandiseId: l.merchandise.id,
      productTitle: l.merchandise.product.title,
      variantTitle: l.merchandise.title,
      cost: money(l.cost.totalAmount) ?? { amount: null, currencyCode: "USD" },
      image: image(l.merchandise.image),
    })),
  };
}

async function getCollection(category: CategoryKey) {
  const cfg = SHOP_CATEGORIES.find((c) => c.key === category);
  if (!cfg) return null;
  const data = await storefront<{ collection: { handle: string; title: string; products: { nodes: GqlProduct[] } } | null }>(
    `query Collection($handle: String!) { collection(handle: $handle) { handle title products(first: 100) { nodes { ${PRODUCT} } } } }`,
    { handle: cfg.collectionHandle },
    true,
  );
  if (!data.collection) return null;
  return {
    handle: data.collection.handle,
    title: cfg.label,
    category,
    products: data.collection.products.nodes.map((p) => toProduct(p, category)),
  };
}

export const shopifyAdapter: CatalogProvider = {
  name: "shopify",
  supportsCheckout: true,
  async listProducts(options) {
    if (options?.category) return (await getCollection(options.category))?.products ?? [];
    const data = await storefront<{ products: { nodes: GqlProduct[] } }>(
      `query Products($first: Int!) { products(first: $first, sortKey: BEST_SELLING) { nodes { ${PRODUCT} } } }`,
      { first: options?.first ?? 100 },
      true,
    );
    return data.products.nodes.map((p) => toProduct(p));
  },
  async getProduct(handle) {
    const data = await storefront<{ product: GqlProduct | null }>(
      `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT} } }`,
      { handle },
      true,
    );
    return data.product ? toProduct(data.product) : null;
  },
  getCollection,
  async createCart(lines: CartLineInput[] = []) {
    const data = await storefront<{ cartCreate: { cart: GqlCart } }>(
      `mutation CartCreate($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ${CART} } } }`,
      { lines },
      false,
    );
    return toCart(data.cartCreate.cart);
  },
  async addLines(cartId, lines) {
    const data = await storefront<{ cartLinesAdd: { cart: GqlCart } }>(
      `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART} } } }`,
      { cartId, lines },
      false,
    );
    return toCart(data.cartLinesAdd.cart);
  },
  async updateLines(cartId, lines: CartLineUpdate[]) {
    const data = await storefront<{ cartLinesUpdate: { cart: GqlCart } }>(
      `mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART} } } }`,
      { cartId, lines },
      false,
    );
    return toCart(data.cartLinesUpdate.cart);
  },
  async getCart(cartId) {
    const data = await storefront<{ cart: GqlCart | null }>(`query Cart($id: ID!) { cart(id: $id) { ${CART} } }`, { id: cartId }, false);
    return data.cart ? toCart(data.cart) : null;
  },
  async checkoutUrl(cartId) {
    return (await this.getCart(cartId))?.checkoutUrl ?? null;
  },
};

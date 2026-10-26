import type { Product } from "@/lib/shop/types";
import { Section } from "@/components/ui/Section";
import { ProductCard, type ProductCardLabels } from "@/components/sections/shared/ProductCard";

/** Design shop-product.html "You might also like.": up to 4 product cards (same category first). */
export function RelatedProducts({
  copy,
  products,
  labels,
}: {
  copy: { eyebrow?: string | null; heading: string };
  products: Product[];
  labels: ProductCardLabels;
}) {
  if (!products.length) return null;
  return (
    <Section id="related" copy={copy} testId="related-products">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-animate="stagger">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} labels={labels} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

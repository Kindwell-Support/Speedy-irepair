import type { Brand, SectionCopy } from "@/lib/sanity/types";

/**
 * Spec 2.1.4. A compact band between the two heavy sections: the heading on the left, the makes set as
 * Orbitron wordmarks on the right. Logos replace the wordmarks once monochrome assets exist in Sanity (brand.logo).
 */
export function Brands({ copy, brands }: { copy: SectionCopy; brands: Brand[] }) {
  return (
    <section id="brands" aria-labelledby="brands-heading" className="border-y border-border-subtle py-14 md:py-20">
      <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <h2 id="brands-heading" className="text-h4 lg:col-span-3">
          {copy.heading}
        </h2>
        <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-4 lg:col-span-9 lg:justify-between" aria-label={copy.heading}>
          {brands.map((b) => (
            <li key={b.id} className="whitespace-nowrap font-heading text-h3 font-bold text-text-secondary">
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

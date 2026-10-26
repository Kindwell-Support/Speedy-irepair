import type { Brand, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { BrandMarquee } from "@/components/motion/BrandMarquee";

/** Spec 2.1.4. Wordmarks render as text until monochrome logo assets are added in Sanity (brand.logo). */
export function Brands({ copy, brands }: { copy: SectionCopy; brands: Brand[] }) {
  // landmark={false}: the marquee is already role="region" "Brands we repair" (axe landmark-unique, BUG-031).
  return (
    <Section id="brands" copy={copy} section="brands" testId="brands-marquee" landmark={false}>
      <BrandMarquee
        brands={brands.map((b) => ({
          name: b.name,
          logo: <span className="whitespace-nowrap text-h4 font-semibold">{b.name}</span>,
        }))}
      />
    </Section>
  );
}

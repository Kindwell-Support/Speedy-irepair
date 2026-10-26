import { Section } from "@/components/ui/Section";
import type { Brand, SectionCopy } from "@/lib/sanity/types";

/** Design .brand-strip: brand names set as type (licensed logos TBD), 2 / 3 / 6 columns. */
export function BrandStrip({
  id,
  copy,
  brands,
}: {
  id: string;
  copy: SectionCopy;
  brands: Brand[];
}) {
  return (
    <Section
      id={id}
      copy={copy}
      tone="raised"
      className="border-t border-border-subtle"
      section="brands"
    >
      <ul className="grid list-none grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {brands.map((b) => (
          <li
            key={b.id}
            className="grid h-24 place-items-center rounded-lg border border-border-subtle bg-surface text-h5 font-bold tracking-[-0.01em] text-text-secondary"
          >
            {b.shortName}
          </li>
        ))}
      </ul>
    </Section>
  );
}

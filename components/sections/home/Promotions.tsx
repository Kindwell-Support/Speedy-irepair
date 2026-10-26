import type { Promotion, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PromoCard } from "./PromoCard";

/** Spec 2.1.7 / design home.html `.promos`: 6fr/3fr/3fr at lg, first card is the feature card. */
export function Promotions({ copy, items }: { copy: SectionCopy; items: Promotion[] }) {
  return (
    <Section
      id="promotions"
      copy={copy}
      section="promotions"
      testId="promotions"
      className="border-t border-border-subtle"
    >
      <ul
        className="grid list-none gap-4 lg:grid-cols-[6fr_3fr_3fr] lg:gap-6"
        data-animate="stagger"
      >
        {items.map((p, i) => (
          <PromoCard key={p.id} promo={p} feature={i === 0} />
        ))}
      </ul>
    </Section>
  );
}

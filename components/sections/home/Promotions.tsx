import type { Promotion, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/** Spec 2.1.7 */
export function Promotions({ copy, items }: { copy: SectionCopy; items: Promotion[] }) {
  return (
    <Section id="promotions" copy={copy} tone="raised">
      <ul className="grid gap-4 md:grid-cols-3" data-animate="stagger">
        {items.map((p) => (
          <li key={p.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
            <h3 className="text-h5">
              <PlaceholderMark show={p.isPlaceholder}>{p.title}</PlaceholderMark>
            </h3>
            {p.body ? <p className="text-body-sm text-text-secondary">{p.body}</p> : null}
            <ButtonLink cta={p.cta} className="mt-auto self-start" />
          </li>
        ))}
      </ul>
    </Section>
  );
}

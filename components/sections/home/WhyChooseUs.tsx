import type { SectionCopy, ValueProp } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { ValueProps } from "@/components/motion/ValueProps";

/** Spec 2.1.5. Framer layout animation lives in <ValueProps> (Motion lane); speakable via data-speakable. */
export function WhyChooseUs({ copy, items }: { copy: SectionCopy; items: ValueProp[] }) {
  return (
    <Section id="why-choose-us" copy={copy} tone="raised" section="why-choose-us">
      <ValueProps
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        items={items.map((v) => ({ id: v.id, title: v.title, detail: v.detail ?? undefined }))}
      />
    </Section>
  );
}

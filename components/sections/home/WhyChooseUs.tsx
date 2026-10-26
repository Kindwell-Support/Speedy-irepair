import type { SectionCopy, ValueProp } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { ValueProps } from "@/components/motion/ValueProps";
import { WhyStat } from "./WhyStat";

/** Design .why-grid: ruled 1/2/3-col grid, stat numbers from CMS valueProp.stat (v1.3). Layout animation lives in <ValueProps> (Motion lane). */
export function WhyChooseUs({ copy, items }: { copy: SectionCopy; items: ValueProp[] }) {
  return (
    <Section id="why-choose-us" copy={copy} tone="raised" section="why-choose-us">
      <ValueProps
        className="grid border-t border-border md:grid-cols-2 xl:grid-cols-3"
        itemClassName="grid min-h-[220px] content-start gap-4 border-b border-border py-8 pr-6 outline-none focus-visible:shadow-focus md:py-12 md:pr-8 md:even:border-l md:even:pl-8 xl:even:border-l-0 xl:even:pl-0 xl:[&:not(:nth-child(3n+1))]:border-l xl:[&:not(:nth-child(3n+1))]:pl-8 [&_p]:text-body-sm [&_p]:text-text-secondary [&_strong]:text-h4 [&_strong]:font-semibold"
        items={items.map((v) => ({
          id: v.id,
          title: v.title,
          detail: v.detail ?? undefined,
          lead: v.stat ? <WhyStat value={v.stat.value} label={v.stat.label} /> : undefined,
        }))}
      />
    </Section>
  );
}

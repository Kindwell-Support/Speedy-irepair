import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import type { HowItWorksStep, SectionCopy } from "@/lib/sanity/types";

/** Design .num-step cards (01/02/03; first numeral solid, the rest outlined). Used on /sell-your-device. */
export function NumberedSteps({
  id,
  copy,
  steps,
}: {
  id: string;
  copy: SectionCopy;
  steps: HowItWorksStep[];
}) {
  return (
    <Section id={id} copy={copy} className="border-t border-border-subtle" testId="how-it-works">
      <ol className="grid list-none gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="flex min-h-[240px] flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-8"
          >
            <span
              aria-hidden
              className={
                i === 0
                  ? "text-h1 font-extrabold tabular-nums leading-none tracking-[-0.05em] text-text"
                  : "text-h1 font-extrabold tabular-nums leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_var(--color-border-strong)]"
              }
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-auto text-balance text-h4 font-semibold">{s.title}</h3>
            {s.body ? (
              <p className="text-body-sm text-text-secondary">
                <PlaceholderMark show={s.isPlaceholder}>{s.body}</PlaceholderMark>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

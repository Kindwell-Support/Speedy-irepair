import type { HowItWorksStep, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * Spec 2.1.3 showpiece / PinnedSteps hook: data-pin="how" + [data-step] + [data-steps-progress].
 * Behaviour (pin on >=768px, stacked reveal on mobile, none under reduced motion) is bound by
 * lib/motion/bindings.ts (Motion & 3D lane). Markup stays a plain ordered list without JS.
 */
export function HowItWorks({
  copy,
  steps,
  id = "how-it-works",
}: {
  copy: SectionCopy;
  steps: HowItWorksStep[];
  id?: string;
}) {
  return (
    <Section id={id} copy={copy} tone="raised" section="how-it-works" testId="how-it-works">
      <div data-pin="how">
        <div data-steps-pin>
          <div className="mb-8 h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            <div data-steps-progress className="h-full w-full origin-left bg-brand" />
          </div>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.id} data-step className="rounded-xl border border-border bg-surface p-6">
                <span className="text-label uppercase text-primary-text">Step {i + 1}</span>
                <h3 className="mt-3 text-h4">{s.title}</h3>
                {s.body ? (
                  <p className="mt-2 text-body-sm text-text-secondary">
                    <PlaceholderMark show={s.isPlaceholder}>{s.body}</PlaceholderMark>
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

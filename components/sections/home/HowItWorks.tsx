import type { HowItWorksStep, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { cn } from "@/lib/utils/cn";

/**
 * Spec 2.1.3 showpiece / PinnedSteps hook: data-pin="how" + [data-step] + [data-steps-progress].
 * Behaviour (pin on >=768px, stacked reveal on mobile, none under reduced motion) is bound by
 * lib/motion/bindings.ts (Motion & 3D lane). Markup stays a plain ordered list without JS; the progress
 * rail only appears once motion is running, so the static page never shows a bar that is already "full".
 */
export function HowItWorks({ copy, steps, id = "how-it-works" }: { copy: SectionCopy; steps: HowItWorksStep[]; id?: string }) {
  return (
    <Section id={id} copy={copy} tone="raised">
      <div data-pin="how">
        <div data-steps-pin>
          <div className="mb-8 hidden h-1 overflow-hidden rounded-full bg-surface-3 [html[data-motion=ok]_&]:block" aria-hidden>
            <div data-steps-progress className="h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
          <ol className={cn("grid gap-4", steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4")}>
            {steps.map((s, i) => (
              <li
                key={s.id}
                data-step
                className="flex min-h-[220px] flex-col justify-between gap-10 rounded-md border border-border bg-bg p-6 lg:min-h-[280px] lg:p-8"
              >
                <span data-step-number className="font-heading text-h1 font-black tabular-nums text-text-tertiary transition-colors duration-fast">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-h4">{s.title}</h3>
                  {s.body ? (
                    <p className="mt-2 text-body text-text-secondary">
                      <PlaceholderMark show={s.isPlaceholder}>{s.body}</PlaceholderMark>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

import type { HowItWorksStep, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";

/** Decorative step icons in design order (quote → bring in → fix → warranty). Presentational, not copy. */
const STEP_ICONS: LineIconName[] = ["quote", "pin", "wrench", "shield"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Design home.html `#how`: rail (01 · progress · 04) + 4 tall step tiles with an outlined big numeral,
 * icon tile and title pinned to the bottom. PinnedSteps contract: data-pin="how", [data-step],
 * [data-steps-progress]. The Motion lane sets data-state="active" | "done" on each step; the active /
 * done looks below are pure CSS keyed on that attribute (no animation code here).
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
    <Section
      id={id}
      copy={copy}
      tone="raised"
      section="how-it-works"
      testId="how-it-works"
      className="border-t border-border-subtle"
    >
      <div data-pin="how">
        <div data-steps-pin>
          <div
            className="mb-8 flex items-center gap-4 text-caption tabular-nums text-text-tertiary"
            aria-hidden
          >
            <span>{pad(1)}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
              <div data-steps-progress className="h-full w-full origin-left bg-brand" />
            </div>
            <span>{pad(steps.length)}</span>
          </div>
          <ol className="grid list-none gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {steps.map((s, i) => (
              <li
                key={s.id}
                data-step={pad(i + 1)}
                className="group relative flex min-h-[320px] flex-col gap-6 overflow-hidden rounded-xl border border-border-subtle bg-surface px-6 py-8 data-[state=active]:border-[rgb(237_28_36/0.45)] data-[state=active]:bg-[linear-gradient(180deg,#1a1a1a,#121212)] data-[state=active]:shadow-[0_24px_64px_rgb(237_28_36/0.12)] md:min-h-[420px] md:p-8"
              >
                <span
                  aria-hidden
                  className="text-[clamp(4rem,3rem+4vw,7.5rem)] font-extrabold tabular-nums leading-[0.85] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_#3a3a3a] group-data-[state=active]:text-text group-data-[state=active]:[-webkit-text-stroke:0] group-data-[state=done]:[-webkit-text-stroke:1px_var(--color-brand)]"
                >
                  {pad(i + 1)}
                </span>
                <span className="grid size-12 place-items-center rounded-md border border-border text-text-secondary group-data-[state=active]:border-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-text">
                  <LineIcon name={STEP_ICONS[i % STEP_ICONS.length]} />
                </span>
                <div className="mt-auto grid gap-2">
                  <h3 className="text-h4">{s.title}</h3>
                  {s.body ? (
                    <p className="text-body-sm text-text-secondary">
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

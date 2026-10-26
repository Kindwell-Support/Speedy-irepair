import { ButtonLink } from "@/components/ui/ButtonLink";
import type { CtaLink, SectionCopy } from "@/lib/sanity/types";

/** Design .cta-band: bordered red-glow card, heading + lede left, CTAs right (7fr/5fr at lg). */
export function CtaBand({
  id,
  copy,
  testId,
}: {
  id?: string;
  copy: SectionCopy & { ctas: CtaLink[] };
  testId?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      data-testid={testId}
      aria-labelledby={headingId}
      className="border-t border-border-subtle py-section"
    >
      <div className="container-site">
        <div className="border-brand/30 grid items-end gap-6 rounded-xl border bg-surface bg-[radial-gradient(90%_140%_at_100%_100%,rgb(237_28_36/0.22),transparent_60%)] px-8 py-12 lg:grid-cols-[7fr_5fr] lg:px-12 lg:py-16">
          <div className="grid gap-4">
            <h2 id={headingId} className="text-balance text-h2">
              {copy.heading}
            </h2>
            {copy.intro ? <p className="text-body-lg text-text-secondary">{copy.intro}</p> : null}
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            {copy.ctas.map((c) => (
              <ButtonLink key={c.href} cta={c} size="lg" className="w-full sm:w-auto" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

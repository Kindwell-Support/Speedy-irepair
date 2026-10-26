import type { Service } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { RichText } from "@/components/ui/RichText";
import { RiveIcon } from "@/components/rive/RiveIcon";
import { toRiveIconId } from "./rive";

/** Spec 2.2 / design .svc: one section per service (all 14, in order), anchor = slug. Rendered inside the page's .svc-layout column. */
export function ServiceSections({ services }: { services: Service[] }) {
  return (
    <div>
      {services.map((s) => {
        const icon = toRiveIconId(s.riveIcon);
        return (
          <section
            key={s.id}
            id={s.slug}
            data-testid="service-section"
            aria-labelledby={`${s.slug}-heading`}
            className="scroll-mt-24 border-t border-border-subtle py-12 first:border-t-0 first:pt-0"
            data-animate="reveal"
          >
            <div className="grid gap-6 md:grid-cols-[96px_1fr] md:gap-8" data-rive-host>
              <div>
                {icon ? (
                  <span className="grid size-16 place-items-center rounded-lg border border-border bg-surface text-text-secondary">
                    <RiveIcon id={icon} size={40} />
                  </span>
                ) : null}
              </div>
              <div>
                <h2 id={`${s.slug}-heading`} className="text-h3">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-prose text-body-lg text-text-primary">{s.summary}</p>
                {s.body.length ? (
                  <div className="mt-6">
                    <PlaceholderMark show={s.isPlaceholder}>
                      <RichText value={s.body} />
                    </PlaceholderMark>
                  </div>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  {s.ctas.map((c) => (
                    <ButtonLink key={`${s.id}-${c.label}`} cta={c} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

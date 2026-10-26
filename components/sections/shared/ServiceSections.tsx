import type { Service } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { RichText } from "@/components/ui/RichText";
import { RiveIcon } from "@/components/rive/RiveIcon";
import { toRiveIconId } from "./rive";

/** Spec 2.2: one section per service (all 14, in order), anchor = slug. */
export function ServiceSections({ services }: { services: Service[] }) {
  return (
    <div className="container-site divide-y divide-border-subtle">
      {services.map((s) => {
        const icon = toRiveIconId(s.riveIcon);
        return (
          <section key={s.id} id={s.slug} aria-labelledby={`${s.slug}-heading`} className="scroll-mt-28 py-16" data-animate="reveal">
            <div className="grid gap-8 lg:grid-cols-[96px_1fr]" data-rive-host>
              <div>{icon ? <RiveIcon id={icon} size={56} /> : null}</div>
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

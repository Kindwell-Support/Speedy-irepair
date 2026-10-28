import Image from "next/image";
import type { Service } from "@/lib/sanity/types";
import { SITE_IMAGES, type SiteImageKey } from "@/lib/site-images";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { RichText } from "@/components/ui/RichText";
import { RiveIcon } from "@/components/rive/RiveIcon";
import { toRiveIconId } from "./rive";

/** Services that have a photograph of that kind of work; the rest stay type-only. */
const PHOTO_BY_SLUG: Partial<Record<string, SiteImageKey>> = {
  "screen-repair": "screenLift",
  "battery-replacement": "battery",
  "charger-port-repair": "port",
  "water-damage-inspection": "microsolder",
  "certified-pre-owned-devices": "devices",
  "replacement-parts": "boardMacro",
};

/**
 * Spec 2.2: one section per service (all 14, in order), anchor = slug.
 * On desktop a sticky index of every service sits on the left, so fourteen rows read as a directory, not a scroll.
 */
export function ServiceSections({ services }: { services: Service[] }) {
  return (
    <div className="container-site lg:grid lg:grid-cols-12 lg:gap-x-8">
      <nav aria-label="Services on this page" className="hidden self-start pt-16 lg:sticky lg:top-28 lg:col-span-3 lg:block">
        <h2 className="mb-3 font-sans text-h5 font-bold">All services</h2>
        <ul>
          {services.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.slug}`}
                className="flex min-h-10 items-center text-body text-text-secondary transition-colors duration-fast hover:text-primary-text"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:col-span-9">
        {services.map((s) => {
          const icon = toRiveIconId(s.riveIcon);
          const photoKey = PHOTO_BY_SLUG[s.slug];
          const photo = photoKey ? SITE_IMAGES[photoKey] : null;
          return (
            <section key={s.id} id={s.slug} aria-labelledby={`${s.slug}-heading`} className="scroll-mt-28 py-16 md:py-20" data-animate="reveal">
              <div className="grid gap-6 md:grid-cols-[56px_1fr] md:gap-8" data-rive-host>
                <div>{icon ? <RiveIcon id={icon} size={48} /> : null}</div>
                <div className={photo ? "grid gap-8 xl:grid-cols-[1fr_280px] xl:gap-10" : undefined}>
                  <div>
                    <h2 id={`${s.slug}-heading`} className="text-h3">
                      {s.title}
                    </h2>
                    <p className="mt-4 max-w-prose text-body-lg text-text-primary">{s.summary}</p>
                    {s.body.length ? (
                      <div className="mt-6 max-w-prose">
                        <PlaceholderMark show={s.isPlaceholder}>
                          <RichText value={s.body} />
                        </PlaceholderMark>
                      </div>
                    ) : null}
                    <div className="mt-7 flex flex-wrap gap-3">
                      {s.ctas.map((c) => (
                        <ButtonLink key={`${s.id}-${c.label}`} cta={c} />
                      ))}
                    </div>
                  </div>
                  {photo ? (
                    <figure className="max-w-sm xl:max-w-none">
                      <div className="photo aspect-[4/3]">
                        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1280px) 280px, 384px" />
                      </div>
                    </figure>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

import Image from "next/image";
import type { SectionCopy, ValueProp } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * Spec 2.1.5. Editorial split: a bench photograph on one side, the reasons on the other. The first two props
 * (speed and warranty) are the promises people ask about at the counter, so they lead at display size; the
 * rest follow as a plain list. Speakable via data-speakable.
 */
export function WhyChooseUs({ copy, items }: { copy: SectionCopy; items: ValueProp[] }) {
  const lead = items.slice(0, 2);
  const rest = items.slice(2);
  return (
    <section id="why-choose-us" aria-labelledby="why-choose-us-heading" className="bg-bg-raised py-section">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-x-12">
        <figure className="lg:col-span-5">
          <div className="photo aspect-[4/5]">
            <Image
              src="/images/site/microsolder.webp"
              alt="Soldering iron working on a phone logic board under a red stereo microscope"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <figcaption className="text-tag mt-3 text-text-tertiary">Board-level work under the microscope</figcaption>
        </figure>

        <div className="lg:col-span-7 lg:pt-8">
          <h2 id="why-choose-us-heading" className="text-h2">
            {copy.heading}
          </h2>
          {copy.intro ? (
            <p className="mt-5 max-w-[52ch] text-body-lg text-text-secondary">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}

          <dl className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10" data-speakable>
            {lead.map((v) => (
              <div key={v.id} className="border-t-2 border-brand pt-5">
                <dt className="font-heading text-h3 font-black">{v.title}</dt>
                {v.detail ? <dd className="mt-3 text-body-lg text-text-secondary">{v.detail}</dd> : null}
              </div>
            ))}
          </dl>

          {rest.length ? (
            <dl className="mt-12 grid border-t border-border md:grid-cols-2" data-speakable>
              {rest.map((v) => (
                <div key={v.id} className="border-b border-border py-5 md:odd:pr-8">
                  <dt className="text-h5 font-heading">
                    <PlaceholderMark show={v.isPlaceholder}>{v.title}</PlaceholderMark>
                  </dt>
                  {v.detail ? <dd className="mt-1 text-body text-text-secondary">{v.detail}</dd> : null}
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

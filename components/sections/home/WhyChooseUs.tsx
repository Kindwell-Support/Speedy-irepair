import Image from "next/image";
import type { SectionCopy, ValueProp } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/** The props no other shop nearby can claim lead the list; the rest keep their CMS order. */
const FIRST = ["vp-3", "vp-5", "vp-6"];
const rank = (id: string) => (FIRST.includes(id) ? FIRST.indexOf(id) : FIRST.length);

/**
 * Spec 2.1.5. Editorial split: a bench photograph on one side, the reasons on the other as six equal items.
 * Speakable via data-speakable.
 */
export function WhyChooseUs({ copy, items }: { copy: SectionCopy; items: ValueProp[] }) {
  const sorted = [...items].sort((a, b) => rank(a.id) - rank(b.id));
  return (
    <section id="why-choose-us" aria-labelledby="why-choose-us-heading" className="bg-bg-raised py-section">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-x-12">
        <figure className="lg:col-span-5">
          <div className="photo aspect-[4/5]">
            <div data-parallax="6" className="absolute inset-x-0 -inset-y-[10%]">
              <Image
                src="/images/site/microsolder.webp"
                alt="Soldering iron working on a phone logic board under a red stereo microscope"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </figure>

        <div className="lg:col-span-7 lg:pt-8">
          <div data-animate="reveal" data-reveal="children">
            <h2 id="why-choose-us-heading" className="text-h2">
              {copy.heading}
            </h2>
            {copy.intro ? (
              <p className="mt-5 max-w-[52ch] text-body-lg text-text-secondary">
                <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
              </p>
            ) : null}
          </div>

          <dl className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2" data-speakable data-stagger>
            {sorted.map((v) => (
              <div key={v.id}>
                <dt className="font-heading text-h4 font-black">
                  <PlaceholderMark show={v.isPlaceholder}>{v.title}</PlaceholderMark>
                </dt>
                {v.detail ? <dd className="mt-2 text-body-lg text-text-secondary">{v.detail}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

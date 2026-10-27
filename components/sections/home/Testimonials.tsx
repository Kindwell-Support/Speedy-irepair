import Image from "next/image";
import type { SectionCopy, Testimonial } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { Stars } from "@/components/ui/Stars";

/**
 * Spec 2.1.6 (Decision #4): real reviews from Sanity only. Placeholder reviews are never rendered (QC sees
 * them in Sanity) and never get Review schema. The Google rating panel always shows (the figures are
 * the same verified ones as the hero trust bar). With no real reviews yet, a bench photograph takes the quotes' place.
 */
export function Testimonials({ copy, items, reviewUrl }: { copy: SectionCopy; items: Testimonial[]; reviewUrl: string }) {
  const shown = items.filter((t) => !t.isPlaceholder);
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="py-section">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="testimonials-heading" className="text-h2">
            {copy.heading}
          </h2>
          <div className="mt-10 flex items-end gap-5">
            <p className="font-heading text-[clamp(4.5rem,3rem+6vw,8rem)] font-black leading-[0.85] tabular-nums">4.9</p>
            <div className="pb-2">
              <Stars rating={5} />
              <p className="mt-2 text-body-lg font-semibold text-text">1,000+ Google reviews</p>
            </div>
          </div>
          {copy.intro ? (
            <p className="mt-8 max-w-[46ch] text-body-lg text-text-secondary">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
          <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md", "mt-10")}>
            Review us on Google
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        {shown.length ? (
          <ul className="grid content-start gap-4 md:grid-cols-2 lg:col-span-7">
            {shown.map((t, i) => (
              <li
                key={t.id}
                className={
                  i === 0
                    ? "flex flex-col gap-5 rounded-md border border-border bg-surface p-6 md:col-span-2 md:p-8"
                    : "flex flex-col gap-4 rounded-md border border-border bg-surface p-6"
                }
              >
                {t.isPlaceholder ? null : <Stars rating={t.rating} />}
                <blockquote className={i === 0 ? "text-h4 font-heading font-bold text-text" : "text-body-lg text-text-primary"}>
                  <PlaceholderMark show={t.isPlaceholder}>{t.text}</PlaceholderMark>
                </blockquote>
                <p className="mt-auto text-body font-semibold text-text-secondary">{t.author}</p>
              </li>
            ))}
          </ul>
        ) : (
          <figure className="lg:col-span-7">
            <div className="photo aspect-[16/10]">
              <Image
                src="/images/site/bench.webp"
                alt="An opened phone held by a suction cup on an anti-static mat, under a white work lamp"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
            <figcaption className="text-tag mt-3 text-text-tertiary">Screen replacement on the bench</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

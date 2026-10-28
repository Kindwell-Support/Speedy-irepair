import type { SectionCopy, Testimonial } from "@/lib/sanity/types";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { StarIcon, Stars } from "@/components/ui/Stars";

/**
 * Spec 2.1.6 (Decision #4): real reviews from Sanity only. Placeholder reviews are never rendered (QC sees
 * them in Sanity) and never get Review schema. The Google rating panel always shows (the figures are
 * the same verified ones as the hero trust bar) and is the page's one centred moment: the figure counts up and the
 * stars fill in turn (bindRating). With no real reviews yet, the rating panel stands alone.
 */
export function Testimonials({ copy, items, reviewUrl }: { copy: SectionCopy; items: Testimonial[]; reviewUrl: string }) {
  const shown = items.filter((t) => !t.isPlaceholder);
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="py-section">
      <div className="container-site">
        <div data-rating className="mx-auto flex max-w-[60ch] flex-col items-center text-center">
          <h2 id="testimonials-heading" className="text-h2">
            {shown.length ? copy.heading : "Loved on Google"}
          </h2>
          <p className="mt-10 font-heading text-[clamp(6rem,2rem+12vw,12rem)] font-black leading-[0.85] tabular-nums">
            <span aria-hidden data-rating-value>
              4.9
            </span>
            <span className="sr-only">Rated 4.9 out of 5 on Google</span>
          </p>
          <span role="img" aria-label="5 out of 5 stars" className="mt-6 inline-flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} data-rating-star className="inline-flex text-brand">
                <StarIcon className="h-8 w-8 md:h-10 md:w-10" />
              </span>
            ))}
          </span>
          <p className="mt-4 text-body-lg font-semibold text-text">1,000+ Google reviews</p>
          {copy.intro ? (
            <p className="mt-6 max-w-[46ch] text-body-lg text-text-secondary">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
          <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "lg", "mt-10")}>
            Review us on Google
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        {shown.length ? (
          <ul className="mt-16 grid content-start gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {shown.map((t, i) => (
              <li
                key={t.id}
                className={
                  i === 0
                    ? "flex flex-col gap-5 rounded-md bg-surface p-6 md:col-span-2 md:p-8 lg:col-span-3"
                    : "flex flex-col gap-4 rounded-md bg-surface p-6"
                }
              >
                <Stars rating={t.rating} />
                <blockquote className={i === 0 ? "text-h4 font-heading font-bold text-text" : "text-body-lg text-text-primary"}>
                  {t.text}
                </blockquote>
                <p className="mt-auto text-body font-semibold text-text-secondary">{t.author}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

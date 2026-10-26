import type { SectionCopy, Testimonial } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { A11Y } from "@/components/ui/a11yStrings";

/** Spec 2.1.6 (Decision #4): real reviews from Sanity only; placeholders are visibly marked and never get Review schema. */
export function Testimonials({
  copy,
  items,
  reviewUrl,
  reviewLabel,
}: {
  copy: SectionCopy;
  items: Testimonial[];
  reviewUrl: string;
  /** CMS label of the review link (navigation.footerLegalLinks entry for the review URL); no label, no button. */
  reviewLabel?: string | null;
}) {
  return (
    <Section id="testimonials" copy={copy} section="testimonials" testId="testimonials">
      <ul className="grid gap-4 md:grid-cols-3" data-animate="stagger">
        {items.map((t) => (
          <li
            key={t.id}
            data-testid={t.isPlaceholder ? "testimonial-placeholder" : "testimonial"}
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6"
          >
            {/* D2: no aggregate rating; a per-review star row only for real (non-placeholder) Sanity reviews with a rating. */}
            {t.isPlaceholder || t.rating === null ? null : (
              <p
                role="img"
                aria-label={A11Y.starRating(t.rating)}
                className="text-brand"
                data-testid="star-rating"
              >
                {"★".repeat(t.rating)}
                <span className="text-text-disabled">{"★".repeat(5 - t.rating)}</span>
              </p>
            )}
            <blockquote className="text-body text-text-primary">
              <PlaceholderMark show={t.isPlaceholder}>{t.text}</PlaceholderMark>
            </blockquote>
            <p className="mt-auto text-body-sm text-text-secondary">{t.author}</p>
          </li>
        ))}
      </ul>
      {reviewLabel ? (
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "md", "mt-8")}
        >
          {reviewLabel}
          <span className="sr-only">{A11Y.opensInNewTab}</span>
        </a>
      ) : null}
    </Section>
  );
}

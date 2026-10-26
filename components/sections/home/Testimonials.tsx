import type { SectionCopy, Testimonial } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";

/** Spec 2.1.6 (Decision #4): real reviews from Sanity only; placeholders are visibly marked and never get Review schema. */
export function Testimonials({ copy, items, reviewUrl }: { copy: SectionCopy; items: Testimonial[]; reviewUrl: string }) {
  return (
    <Section id="testimonials" copy={copy}>
      <ul className="grid gap-4 md:grid-cols-3" data-animate="stagger">
        {items.map((t) => (
          <li key={t.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
            {t.isPlaceholder ? null : (
              <p aria-label={`${t.rating} out of 5 stars`} className="text-brand">
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
      <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md", "mt-8")}>
        Leave a Review
        <span className="sr-only"> on Google (opens in a new tab)</span>
      </a>
    </Section>
  );
}

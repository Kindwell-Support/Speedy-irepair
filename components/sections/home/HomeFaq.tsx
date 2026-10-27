import Link from "next/link";
import type { Faq, HomePage } from "@/lib/sanity/types";
import { FaqList } from "@/components/sections/shared/FaqList";
import { LineIcon } from "@/components/ui/LineIcon";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { telHref } from "@/lib/utils/format";

/** Spec 2.1.8 homepage FAQ in the design .faq-layout: heading stack + call/All FAQs left, accordion right (QA BUG-005). */
export function HomeFaq({
  copy,
  faqs,
  phone,
}: {
  copy: HomePage["faqSection"];
  faqs: Faq[];
  phone: string;
}) {
  return (
    <section id="faq" data-section="faq" aria-labelledby="faq-heading" className="py-section">
      <div className="container-site grid gap-12 lg:grid-cols-[4fr_8fr] lg:gap-16">
        <div className="grid content-start gap-4">
          {copy.eyebrow ? (
            <p className="inline-flex items-center gap-2 text-label font-semibold uppercase text-text-secondary before:size-2 before:rounded-[2px] before:bg-brand before:content-['']">
              {copy.eyebrow}
            </p>
          ) : null}
          <h2 id="faq-heading" className="text-h2">
            {copy.heading}
          </h2>
          {copy.intro ? (
            <p className="text-body-lg text-text-secondary">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
          {copy.callPrompt ? (
            <p className="text-body text-text-secondary">
              {copy.callPrompt}{" "}
              <a
                href={telHref(phone)}
                className="font-semibold tabular-nums text-text underline-offset-4 hover:text-primary-text hover:underline"
              >
                {phone}
              </a>
              .
            </p>
          ) : null}
          {copy.allLabel ? (
            <Link
              href="/faq"
              className="inline-flex min-h-8 items-center gap-2 justify-self-start text-body-sm font-semibold text-primary-text underline-offset-4 hover:underline"
            >
              {copy.allLabel}
              <LineIcon name="arrowRight" size={16} />
            </Link>
          ) : null}
        </div>
        <FaqList faqs={faqs} defaultOpen={faqs.length ? [0] : undefined} />
      </div>
    </section>
  );
}

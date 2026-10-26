import type { Metadata } from "next";
import { getFaqs, getFinancingPage, getHowItWorksSteps } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForFinancing } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { RichText } from "@/components/ui/RichText";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { InfoCard } from "@/components/sections/shared/InfoCard";
import { NumberedSteps } from "@/components/sections/shared/NumberedSteps";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { FaqList } from "@/components/sections/shared/FaqList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/financing", (await getFinancingPage()).seo);
}

/** Decorative icons for the finance cards (phones / accessories / more). Presentational only. */
const ITEM_ICONS: LineIconName[] = ["phone", "headphones", "plus"];

/**
 * R10 / design financing.html: hero → What is Acima (split: copy + check-list | partner visual) →
 * 3 numbered steps → what you can finance (info cards) → FAQ → CTA band. Step copy + FAQs stay
 * Sanity placeholders until approved.
 */
export default async function FinancingPage() {
  const [page, steps, faqs, seo] = await Promise.all([
    getFinancingPage(),
    getHowItWorksSteps("financing"),
    getFaqs("financing"),
    getSeoData(),
  ]);
  const what = page.whatIsSection;
  const finance = page.whatYouCanFinanceSection;
  const cta = page.ctaSection ?? {
    heading: page.applyCta.label,
    ctas: [page.applyCta],
  };
  return (
    <>
      <JsonLd data={jsonLdForFinancing(seo)} />
      <Breadcrumbs data={jsonLdForFinancing(seo)} />
      <PageHero hero={page.hero} />
      <Section
        id="what-is-acima"
        copy={{ eyebrow: what.eyebrow, heading: what.heading }}
        className="border-t border-border-subtle"
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 [&>*]:min-w-0">
          <div className="grid gap-6">
            {what.body?.length ? (
              <div className="text-body-lg text-text">
                <RichText value={what.body} />
              </div>
            ) : what.intro ? (
              <p className="text-body-lg text-text">{what.intro}</p>
            ) : null}
            {what.highlights?.length ? (
              <ul className="grid list-none gap-4" data-testid="check-list">
                {what.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-4 text-body text-text-secondary">
                    <LineIcon name="check" size={18} className="mt-1 shrink-0 text-brand" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {what.visualLabel ? (
            <div
              aria-hidden
              className="grid aspect-[4/3] place-items-center rounded-xl border border-border-subtle bg-surface bg-[radial-gradient(70%_70%_at_30%_30%,rgb(225_29_46/0.18),transparent_70%)]"
            >
              <span className="text-display font-extrabold tracking-[-0.04em] text-text">
                {what.visualLabel}
              </span>
            </div>
          ) : null}
        </div>
      </Section>
      <NumberedSteps id="financing-steps" copy={page.howItWorksSection} steps={steps} />
      <Section
        id="what-you-can-finance"
        copy={{ eyebrow: finance.eyebrow, heading: finance.heading, intro: finance.intro }}
        className="border-t border-border-subtle"
      >
        <ul className="grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {finance.items.map((item, i) => (
            <InfoCard
              key={item}
              icon={ITEM_ICONS[Math.min(i, ITEM_ICONS.length - 1)]}
              title={item}
              body={finance.itemBodies?.[item]}
            />
          ))}
        </ul>
      </Section>
      <Section
        id="financing-faq"
        copy={page.faqSection}
        tone="raised"
        className="border-t border-border-subtle"
      >
        <FaqList faqs={faqs} />
      </Section>
      <CtaBand id="financing-cta" copy={cta} testId="cta-band" />
    </>
  );
}

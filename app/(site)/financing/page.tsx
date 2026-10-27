import type { Metadata } from "next";
import { getFaqs, getFinancingPage, getHowItWorksSteps } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForFinancing } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { TypeRows } from "@/components/ui/TypeRows";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { FaqList } from "@/components/sections/shared/FaqList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/financing", (await getFinancingPage()).seo);
}

/** R10 — Acima lease-to-own; step copy + FAQs are Sanity placeholders until Abdullah approves. */
export default async function FinancingPage() {
  const [page, steps, faqs, seo] = await Promise.all([getFinancingPage(), getHowItWorksSteps("financing"), getFaqs("financing"), getSeoData()]);
  return (
    <>
      <JsonLd data={jsonLdForFinancing(seo)} />
      <PageHero hero={page.hero} photo="boardMacro" />
      <Section id="what-is-acima" copy={page.whatIsSection} />
      <HowItWorks id="financing-steps" copy={page.howItWorksSection} steps={steps} />
      <Section id="what-you-can-finance" copy={page.whatYouCanFinanceSection}>
        <TypeRows items={page.whatYouCanFinanceSection.items} />
        <ButtonLink cta={page.applyCta} size="lg" className="mt-10" />
      </Section>
      <Section id="financing-faq" copy={page.faqSection} tone="raised" layout="side">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}

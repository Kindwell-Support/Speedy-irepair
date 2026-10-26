import type { Metadata } from "next";
import { getQuotePage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForInstantQuote } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { QuoteForm } from "@/components/sections/forms/QuoteForm";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/instant-quote", (await getQuotePage()).seo);
}

/** R06 — pricing TBD, so the tool runs in lead-capture mode (F1). */
export default async function InstantQuotePage() {
  const [page, seo] = await Promise.all([getQuotePage(), getSeoData()]);
  return (
    <>
      <JsonLd data={jsonLdForInstantQuote(seo)} />
      <PageHero hero={page.hero} />
      <Section id="quote" copy={page.formSection}>
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-6 md:p-8">
          <QuoteForm deviceTypes={page.deviceTypes} issues={page.issues} successMessage={page.successMessage} />
        </div>
      </Section>
    </>
  );
}

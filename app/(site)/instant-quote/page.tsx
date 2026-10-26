import type { Metadata } from "next";
import { getLeadFlow, getQuotePage, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForInstantQuote } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceSummary } from "@/components/ui/ServiceSummary";
import { PageHero } from "@/components/ui/PageHero";
import { LeadFlow } from "@/components/sections/forms/lead/LeadFlow";
import { LeadFlowAside } from "@/components/sections/forms/lead/LeadFlowAside";
import { withEnumOptions } from "@/components/sections/forms/lead/enumOptions";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/instant-quote", (await getQuotePage()).seo);
}

/** R06: lead-capture LeadFlow (device, model, issue, contact) + sticky aside. NO prices (Decision #5). */
export default async function InstantQuotePage() {
  const [page, lead, settings, seo] = await Promise.all([
    getQuotePage(),
    getLeadFlow("quote"),
    getSiteSettings(),
    getSeoData(),
  ]);
  const { business } = settings;
  const a = business.address;
  const address = `${a.street}${a.suite ? ` ${a.suite}` : ""}, ${a.city}, ${a.state} ${a.zip}`;
  return (
    <>
      <JsonLd data={jsonLdForInstantQuote(seo)} />
      <Breadcrumbs data={jsonLdForInstantQuote(seo)} />
      <PageHero hero={page.hero} />
      <ServiceSummary text={page.intro} />
      <section id="quote" aria-labelledby="quote-heading" className="py-section">
        <div className="container-site">
          <h2 id="quote-heading" className="sr-only">
            {page.formSection.heading}
          </h2>
          <div className="grid gap-12 lg:grid-cols-[8fr_4fr] [&>*]:min-w-0">
            <LeadFlow
              kind="quote"
              copy={withEnumOptions("quote", lead.flow)}
              phoneDisplay={business.phone}
              testId="quote-form"
            />
            <LeadFlowAside
              label={lead.asideLabel}
              cards={lead.aside}
              contactLabel={lead.contactCardLabel}
              phone={business.phone}
              address={address}
            />
          </div>
        </div>
      </section>
    </>
  );
}

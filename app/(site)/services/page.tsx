import type { Metadata } from "next";
import { getFaqs, getServices, getServicesChrome, getServicesPage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForServices } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ServiceSections } from "@/components/sections/shared/ServiceSections";
import { FaqList } from "@/components/sections/shared/FaqList";
import { ServicesIndex } from "@/components/sections/shared/ServicesIndex";
import { ServiceChips } from "@/components/sections/shared/ServiceChips";
import { CtaBand } from "@/components/sections/shared/CtaBand";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/services", (await getServicesPage()).seo);
}

/** R02 — all 14 services in spec order (S01–S14), each anchored by slug. */
export default async function ServicesPage() {
  const [page, services, faqs, seo, chrome] = await Promise.all([
    getServicesPage(),
    getServices(),
    getFaqs("services"),
    getSeoData(),
    getServicesChrome(),
  ]);
  return (
    <>
      <JsonLd data={jsonLdForServices(seo)} />
      <Breadcrumbs data={jsonLdForServices(seo)} />
      <PageHero hero={page.hero} />
      <div className="container-site py-16">
        <div className="grid gap-12 lg:grid-cols-[3fr_9fr] lg:gap-16 [&>*]:min-w-0">
          <ServicesIndex
            services={services}
            label={chrome.indexLabel.replace("{count}", String(services.length))}
            ariaLabel={chrome.indexAriaLabel}
          />
          <div>
            <ServiceChips services={services} ariaLabel={chrome.chipsAriaLabel} />
            <ServiceSections services={services} />
          </div>
        </div>
      </div>
      <Section id="services-faq" copy={page.faqSection} tone="raised">
        <FaqList faqs={faqs} />
      </Section>
      <CtaBand id="services-cta" copy={chrome.ctaSection} testId="cta-band" />
    </>
  );
}

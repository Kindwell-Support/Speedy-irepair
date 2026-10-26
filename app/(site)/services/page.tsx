import type { Metadata } from "next";
import { getFaqs, getServices, getServicesPage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForServices } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ServiceSections } from "@/components/sections/shared/ServiceSections";
import { FaqList } from "@/components/sections/shared/FaqList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/services", (await getServicesPage()).seo);
}

/** R02 — all 14 services in spec order (S01–S14), each anchored by slug. */
export default async function ServicesPage() {
  const [page, services, faqs, seo] = await Promise.all([
    getServicesPage(),
    getServices(),
    getFaqs("services"),
    getSeoData(),
  ]);
  return (
    <>
      <JsonLd data={jsonLdForServices(seo)} />
      <Breadcrumbs data={jsonLdForServices(seo)} />
      <PageHero hero={page.hero} />
      <ServiceSections services={services} />
      <Section id="services-faq" copy={page.faqSection} tone="raised">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}

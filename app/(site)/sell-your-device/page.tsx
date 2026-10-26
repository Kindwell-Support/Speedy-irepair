import type { Metadata } from "next";
import {
  getBrands,
  getHowItWorksSteps,
  getLeadFlow,
  getSellPage,
  getSiteSettings,
} from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForSellYourDevice } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { BrandStrip } from "@/components/sections/shared/BrandStrip";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { NumberedSteps } from "@/components/sections/shared/NumberedSteps";
import { LeadFlow } from "@/components/sections/forms/lead/LeadFlow";
import { LeadFlowAside } from "@/components/sections/forms/lead/LeadFlowAside";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/sell-your-device", (await getSellPage()).seo);
}

/** R05: hero, 3 numbered steps, trade-in LeadFlow (lead capture; no quote values), brands, CTA band. */
export default async function SellYourDevicePage() {
  const [page, steps, brands, lead, settings, seo] = await Promise.all([
    getSellPage(),
    getHowItWorksSteps("sell"),
    getBrands(),
    getLeadFlow("tradein"),
    getSiteSettings(),
    getSeoData(),
  ]);
  const { business } = settings;
  const a = business.address;
  const address = `${a.street}${a.suite ? ` ${a.suite}` : ""}, ${a.city}, ${a.state} ${a.zip}`;
  const accepted = brands.filter((b) => b.acceptsTradeIn);
  return (
    <>
      <JsonLd data={jsonLdForSellYourDevice(seo)} />
      <Breadcrumbs data={jsonLdForSellYourDevice(seo)} />
      <PageHero hero={page.hero} />
      <NumberedSteps id="sell-steps" copy={page.howItWorksSection} steps={steps} />
      <Section id="trade-in" copy={page.formSection} tone="raised">
        <div className="grid gap-12 lg:grid-cols-[8fr_4fr] [&>*]:min-w-0">
          <LeadFlow
            kind="tradein"
            copy={lead.flow}
            brandOptions={accepted.map((b) => ({ key: b.shortName, label: b.shortName }))}
            phoneDisplay={business.phone}
            testId="trade-in-form"
          />
          <LeadFlowAside
            label={lead.asideLabel}
            cards={lead.aside}
            contactLabel={lead.contactCardLabel}
            phone={business.phone}
            address={address}
          />
        </div>
      </Section>
      <BrandStrip id="brands-accepted" copy={page.brandsSection} brands={accepted} />
      <CtaBand id="sell-cta" copy={page.ctaSection} />
    </>
  );
}

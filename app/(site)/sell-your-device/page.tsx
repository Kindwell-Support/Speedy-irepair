import type { Metadata } from "next";
import { getBrands, getHowItWorksSteps, getSellPage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForSellYourDevice } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { TradeInForm } from "@/components/sections/forms/TradeInForm";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/sell-your-device", (await getSellPage()).seo);
}

/** R05 — hero, 3 steps, trade-in multi-step form (lead capture; quote values TBD), brands, CTA. */
export default async function SellYourDevicePage() {
  const [page, steps, brands, seo] = await Promise.all([
    getSellPage(),
    getHowItWorksSteps("sell"),
    getBrands(),
    getSeoData(),
  ]);
  const accepted = brands.filter((b) => b.acceptsTradeIn);
  return (
    <>
      <JsonLd data={jsonLdForSellYourDevice(seo)} />
      <Breadcrumbs data={jsonLdForSellYourDevice(seo)} />
      <PageHero hero={page.hero} />
      <HowItWorks id="sell-steps" copy={page.howItWorksSection} steps={steps} />
      <Section id="trade-in" copy={page.formSection}>
        <div className="max-w-2xl rounded-xl border border-border bg-surface p-6 md:p-8">
          <TradeInForm brands={accepted.map((b) => b.shortName)} />
        </div>
      </Section>
      <Section id="brands-accepted" copy={page.brandsSection} tone="raised">
        <ul className="flex flex-wrap gap-3">
          {accepted.map((b) => (
            <li key={b.id} className="rounded-full border border-border px-4 py-2 text-body">
              {b.name}
            </li>
          ))}
        </ul>
      </Section>
      <Section id="sell-cta" copy={page.ctaSection}>
        <div className="flex flex-wrap gap-3">
          {page.ctaSection.ctas.map((c) => (
            <ButtonLink key={c.label} cta={c} size="lg" />
          ))}
        </div>
      </Section>
    </>
  );
}

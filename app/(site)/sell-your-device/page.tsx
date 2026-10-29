import type { Metadata } from "next";
import Image from "next/image";
import { SITE_IMAGES } from "@/lib/site-images";
import { getBrands, getHowItWorksSteps, getSellPage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForSellYourDevice } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
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
  const [page, steps, brands, seo] = await Promise.all([getSellPage(), getHowItWorksSteps("sell"), getBrands(), getSeoData()]);
  const accepted = brands.filter((b) => b.acceptsTradeIn);
  const photo = page.photo ?? SITE_IMAGES.port;
  return (
    <>
      <JsonLd data={jsonLdForSellYourDevice(seo)} />
      <PageHero hero={page.hero} photo="devices" />
      <HowItWorks id="sell-steps" copy={page.howItWorksSection} steps={steps} />
      <section id="trade-in" aria-labelledby="trade-in-heading" className="py-section">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="rounded-md border border-border bg-surface p-6 md:p-10 lg:col-span-7 lg:self-start">
            <h2 id="trade-in-heading" className="mb-8 text-h3">
              {page.formSection.heading}
            </h2>
            <TradeInForm brands={accepted.map((b) => b.shortName)} />
          </div>

          <aside aria-labelledby="brands-accepted-heading" className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            <div id="brands-accepted">
              <h2 id="brands-accepted-heading" className="font-sans text-h5 font-bold">
                {page.brandsSection.heading}
              </h2>
              <ul className="mt-4 border-t border-border">
                {accepted.map((b) => (
                  <li key={b.id} className="flex min-h-12 items-center border-b border-border font-heading text-h5 font-bold">
                    {b.name}
                  </li>
                ))}
              </ul>
            </div>
            <figure className="hidden lg:block">
              <div className="photo aspect-[4/5]">
                <Image src={photo.src} alt={photo.alt} fill sizes="30vw" />
              </div>
            </figure>
          </aside>
        </div>
      </section>
      <Section id="sell-cta" copy={page.ctaSection} tone="raised">
        <div className="flex flex-wrap gap-3">
          {page.ctaSection.ctas.map((c) => (
            <ButtonLink key={c.label} cta={c} size="lg" />
          ))}
        </div>
      </Section>
    </>
  );
}

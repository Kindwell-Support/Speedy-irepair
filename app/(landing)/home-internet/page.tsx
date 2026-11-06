import type { Metadata } from "next";
import { Tomorrow } from "next/font/google";
import { getFaqs, getHomeInternetPage, getHomePage, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForHomeInternet } from "@/lib/seo/routes";
import { telHref } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/Section";
import { TypeRows } from "@/components/ui/TypeRows";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { FaqList } from "@/components/sections/shared/FaqList";
import { InternetIntake } from "@/components/internet-intake/InternetIntake";
import { StickyCheckBar } from "@/components/internet-intake/StickyCheckBar";

// Same face as the home hero's SPEEDY, so the ghost word reads as the brand's.
const wordmark = Tomorrow({ subsets: ["latin"], weight: "900", style: "italic", display: "swap" });

const FORM_ID = "check-address";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/home-internet", (await getHomeInternetPage()).seo);
}

/**
 * Home internet ad landing page (Spectrum Authorized Retailer): the offer and the address check above the fold,
 * then how it works, who it's for, why us and FAQs, each ending back at the form. Every word comes from the CMS.
 */
export default async function HomeInternetPage() {
  const [page, faqs, seo, settings, home] = await Promise.all([
    getHomeInternetPage(),
    getFaqs("internet"),
    getSeoData(),
    getSiteSettings(),
    getHomePage(),
  ]);
  const b = settings.business;
  // "Can we help with something else?" when neither provider covers the address: the home page's service cards.
  const otherServices = home.serviceCards
    .filter((c) => !/home-internet/.test(c.href))
    .sort((x, y) => x.order - y.order)
    .slice(0, 4)
    .map(({ title, description, href }) => ({ title, description, href }));
  const { hero, offer } = page;
  return (
    <>
      <JsonLd data={jsonLdForHomeInternet(seo, faqs)} />

      <section className="landing-stage relative isolate overflow-hidden pb-16 pt-28 md:pt-32 lg:pb-24 lg:pt-40">
        <p aria-hidden className={`landing-word pointer-events-none absolute -z-10 ${wordmark.className}`}>
          {page.ghostWord}
        </p>
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <div className="lg:col-span-6">
            {hero.eyebrow ? <p className="text-tag mb-5 text-primary-text">{hero.eyebrow}</p> : null}
            <h1 className="max-w-[14ch] text-h1">{hero.headline}</h1>
            {hero.subline ? <p className="mt-6 max-w-[48ch] text-body-lg text-text-secondary">{hero.subline}</p> : null}

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
              <p className="landing-price font-heading font-black tabular-nums text-text">
                {offer.price}
                <span className="landing-price-unit">{offer.unit}</span>
              </p>
              <ul className="grid gap-2">
                {offer.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-body-lg font-bold text-text">
                    <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-primary-text" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id={FORM_ID} className="scroll-mt-28 landing-card rounded-md border border-border p-6 md:p-8 lg:col-span-6 xl:col-span-5 xl:col-start-8">
            <p className="text-tag text-primary-text">{page.formSection.heading}</p>
            {page.formSection.intro ? <p className="mb-6 mt-2 text-body text-text-secondary">{page.formSection.intro}</p> : null}
            <InternetIntake
              confirmationMessage={page.confirmationMessage}
              spectrumOrderUrl={page.spectrumOrderUrl}
              shop={{ address: b.footerAddressLine, phone: b.phone }}
              results={page.availabilityResults}
              services={otherServices}
            />
          </div>
        </div>
      </section>

      <Section id="what-you-get" copy={page.whatYouGetSection} tone="raised">
        <TypeRows items={page.whatYouGetSection.items} />
      </Section>

      <Section id="how-it-works" copy={page.howToSignUpSection}>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {page.howToSignUpSection.steps.map((s, i) => (
            <li key={s.title} className="border-t border-border-strong pt-6">
              <p aria-hidden className="font-heading text-h3 font-black tabular-nums text-primary-text">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-sans text-h5 font-bold">{s.title}</h3>
              <p className="mt-2 max-w-[40ch] text-body text-text-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="who-its-for" copy={page.whoItsForSection} tone="raised">
        <TypeRows items={page.whoItsForSection.items} />
      </Section>

      <Section id="why-speedy" copy={page.whySection}>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {page.whySection.items.map((w) => (
            <li key={w.title} className="border-t border-border-strong pt-6">
              <h3 className="font-sans text-h5 font-bold">{w.title}</h3>
              <p className="mt-2 max-w-[40ch] text-body text-text-secondary">{w.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="internet-faq" copy={page.faqSection} tone="raised" layout="side">
        <FaqList faqs={faqs} />
      </Section>

      <section aria-labelledby="get-connected-heading" className="landing-stage relative isolate overflow-hidden py-section">
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="get-connected-heading" className="max-w-[16ch] text-h2">
              Ready to get connected?
            </h2>
            <p className="mt-4 max-w-[48ch] text-body-lg text-text-secondary">
              {offer.price}
              {offer.unit}, {offer.items.slice(0, 2).join(", ").toLowerCase()}. Check your address or call the store.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href={`#${FORM_ID}`} className={buttonClasses("primary", "lg")}>
              Check my address
            </a>
            <a href={telHref(b.phone)} className={buttonClasses("secondary", "lg", "tabular-nums")}>
              Call {b.phone}
            </a>
          </div>
        </div>
      </section>

      <div className="container-site pb-10">
        <p className="max-w-[90ch] text-caption text-text-tertiary">{page.disclaimer}</p>
      </div>

      <StickyCheckBar target={FORM_ID} />
    </>
  );
}

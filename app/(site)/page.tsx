import type { Metadata } from "next";
import {
  getBrands,
  getEmbedCopy,
  getHeroChips,
  getFaqs,
  getHomePage,
  getHowItWorksSteps,
  getPromotions,
  getSiteSettings,
  getTestimonials,
  getValueProps,
} from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForHome } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/Section";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { ServicesGrid } from "@/components/sections/home/ServicesGrid";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { Brands } from "@/components/sections/home/Brands";
import { WhyChooseUs } from "@/components/sections/home/WhyChooseUs";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { Promotions } from "@/components/sections/home/Promotions";
import { HomeFaq } from "@/components/sections/home/HomeFaq";
import { LocationContact } from "@/components/sections/shared/LocationContact";
import dynamic from "next/dynamic";

/** Below-the-fold client form: own chunk, keeps homepage first-load JS under budget. */
const NewsletterForm = dynamic(() =>
  import("@/components/sections/forms/NewsletterForm").then((m) => m.NewsletterForm),
);

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  return pageMetadata("/", page.seo);
}

/** R01 — section order per spec 2.1.0–2.1.11 (banner/header/footer live in the (site) layout). */
export default async function HomePage() {
  const [
    page,
    settings,
    steps,
    brands,
    values,
    testimonials,
    promotions,
    faqs,
    seo,
    mapCopy,
    heroChips,
  ] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getHowItWorksSteps("home"),
    getBrands(),
    getValueProps(),
    getTestimonials(),
    getPromotions(),
    getFaqs("general"),
    getSeoData(),
    getEmbedCopy("map"),
    getHeroChips(),
  ]);
  return (
    <>
      <JsonLd data={jsonLdForHome(seo)} />
      <HomeHero hero={page.hero} chips={heroChips} />
      <ServicesGrid
        copy={page.serviceCardsSection}
        cards={page.serviceCards}
        linkLabel={page.serviceCardLinkLabel}
      />
      <HowItWorks copy={page.howItWorksSection} steps={steps} />
      <Brands copy={page.brandsSection} brands={brands.filter((b) => b.repairs)} />
      <WhyChooseUs copy={page.whySection} items={values} />
      <Testimonials
        copy={page.testimonialsSection}
        items={testimonials}
        reviewUrl={settings.business.externalLinks.review}
        reviewLabel={
          settings.navigation.footerLegalLinks.find(
            (l) => l.href === settings.business.externalLinks.review,
          )?.label
        }
      />
      <Promotions copy={page.promotionsSection} items={promotions} />
      <HomeFaq copy={page.faqSection} faqs={faqs} phone={settings.business.phone} />
      <LocationContact
        copy={page.locationSection}
        section="location"
        business={settings.business}
        mapCopy={mapCopy}
        directionsLabel={page.locationSection.directionsLabel}
        contactCopy={page.contactSection}
      />
      <Section id="newsletter" section="newsletter" tone="raised">
        <div className="grid gap-8 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-16">
          <div className="grid gap-4">
            {page.newsletter.eyebrow ? (
              <p className="inline-flex items-center gap-2 text-label font-semibold uppercase text-text-secondary before:size-2 before:rounded-[2px] before:bg-brand before:content-['']">
                {page.newsletter.eyebrow}
              </p>
            ) : null}
            <h2 className="text-h2">{page.newsletter.heading}</h2>
          </div>
          <NewsletterForm
            emailLabel={page.newsletter.emailLabel}
            buttonLabel={page.newsletter.buttonLabel}
            successMessage={page.newsletter.successMessage}
            inline
          />
        </div>
      </Section>
    </>
  );
}

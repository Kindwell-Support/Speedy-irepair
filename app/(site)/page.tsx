import type { Metadata } from "next";
import {
  getBrands,
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
import { FaqList } from "@/components/sections/shared/FaqList";
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
  const [page, settings, steps, brands, values, testimonials, promotions, faqs, seo] =
    await Promise.all([
      getHomePage(),
      getSiteSettings(),
      getHowItWorksSteps("home"),
      getBrands(),
      getValueProps(),
      getTestimonials(),
      getPromotions(),
      getFaqs("general"),
      getSeoData(),
    ]);
  return (
    <>
      <JsonLd data={jsonLdForHome(seo)} />
      <HomeHero hero={page.hero} />
      <ServicesGrid copy={page.serviceCardsSection} cards={page.serviceCards} />
      <HowItWorks copy={page.howItWorksSection} steps={steps} />
      <Brands copy={page.brandsSection} brands={brands.filter((b) => b.repairs)} />
      <WhyChooseUs copy={page.whySection} items={values} />
      <Testimonials
        copy={page.testimonialsSection}
        items={testimonials}
        reviewUrl={settings.business.externalLinks.review}
      />
      <Promotions copy={page.promotionsSection} items={promotions} />
      <Section id="faq" copy={page.faqSection} section="faq">
        <FaqList faqs={faqs} />
      </Section>
      <LocationContact
        copy={page.locationSection}
        section="location"
        business={settings.business}
        directionsLabel={page.locationSection.directionsLabel}
      />
      <Section id="newsletter" section="newsletter" tone="raised" className="text-center">
        <h2 className="text-h3">{page.newsletter.heading}</h2>
        <div className="mx-auto mt-6 max-w-md">
          <NewsletterForm
            emailLabel={page.newsletter.emailLabel}
            buttonLabel={page.newsletter.buttonLabel}
            successMessage={page.newsletter.successMessage}
          />
        </div>
      </Section>
    </>
  );
}

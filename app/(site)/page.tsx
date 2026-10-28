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
import { HeroProof } from "@/components/sections/home/HeroProof";
import { ServicesGrid } from "@/components/sections/home/ServicesGrid";
import { HowItWorks } from "@/components/sections/home/HowItWorks";
import { Brands } from "@/components/sections/home/Brands";
import { WhyChooseUs } from "@/components/sections/home/WhyChooseUs";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { Promotions } from "@/components/sections/home/Promotions";
import { FaqList } from "@/components/sections/shared/FaqList";
import { LocationContact } from "@/components/sections/shared/LocationContact";
import { NewsletterForm } from "@/components/sections/forms/NewsletterForm";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  return pageMetadata("/", page.seo);
}

/** R01 — section order per spec 2.1.0–2.1.11 (banner/header/footer live in the (site) layout). */
export default async function HomePage() {
  const [page, settings, steps, brands, values, testimonials, promotions, faqs, seo] = await Promise.all([
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
      <HeroProof business={settings.business} />
      <ServicesGrid copy={page.serviceCardsSection} cards={page.serviceCards} />
      <HowItWorks copy={page.howItWorksSection} steps={steps} />
      <Brands copy={page.brandsSection} brands={brands.filter((b) => b.repairs)} />
      <WhyChooseUs copy={page.whySection} items={values} />
      <Testimonials copy={page.testimonialsSection} items={testimonials} reviewUrl={settings.business.externalLinks.review} />
      <Promotions copy={page.promotionsSection} items={promotions} />
      <Section id="faq" copy={page.faqSection} layout="side" reveal>
        <FaqList faqs={faqs} stagger />
      </Section>
      <LocationContact copy={page.locationSection} business={settings.business} directionsLabel={page.locationSection.directionsLabel} />
      <section id="newsletter" aria-labelledby="newsletter-heading" className="bg-bg-raised py-20 md:py-24">
        <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-8" data-animate="reveal" data-reveal="children">
          <h2 id="newsletter-heading" className="max-w-[18ch] text-h3 lg:col-span-6">
            {page.newsletter.heading}
          </h2>
          <div className="lg:col-span-5 lg:col-start-8">
            <NewsletterForm
              emailLabel={page.newsletter.emailLabel}
              buttonLabel={page.newsletter.buttonLabel}
              successMessage={page.newsletter.successMessage}
            />
          </div>
        </div>
      </section>
    </>
  );
}

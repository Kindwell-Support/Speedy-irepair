import type { Metadata } from "next";
import { getFaqPage, getFaqs } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForFaq } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { ContactPrompt } from "@/components/sections/shared/ContactPrompt";
import { FaqList } from "@/components/sections/shared/FaqList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/faq", (await getFaqPage()).seo);
}

/** R08 — all 8 FAQs verbatim, GSAP accordion. */
export default async function FaqPage() {
  const [page, faqs, seo] = await Promise.all([getFaqPage(), getFaqs("general"), getSeoData()]);
  return (
    <>
      <JsonLd data={jsonLdForFaq(seo)} />
      <PageHero hero={page.hero} />
      <div className="container-site max-w-3xl py-16">
        {page.intro ? <p className="mb-8 text-body-lg text-text-secondary">{page.intro}</p> : null}
        <FaqList faqs={faqs} engine="gsap" />
      </div>
      <ContactPrompt id="faq-contact" heading="Still have a question?" intro="Send us a message and we'll get back to you." />
    </>
  );
}

import type { Metadata } from "next";
import { getFaqPage, getFaqs } from "@/lib/sanity/content";
import type { Faq, FaqCategory } from "@/lib/sanity/types";
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

/** Groups in page order. "services" only places an answer on /services, so it isn't a group of its own. */
const GROUPS: { key: FaqCategory; heading: string }[] = [
  { key: "general", heading: "Repairs & general" },
  { key: "repairs", heading: "Repair details & unlocking" },
  { key: "visiting", heading: "Visiting the store" },
  { key: "selling", heading: "Selling & trade-in" },
  { key: "shop", heading: "Shop & pre-owned" },
  { key: "plans", heading: "Prepaid plans & bill pay" },
  { key: "financing", heading: "Financing" },
  { key: "internet", heading: "Home internet" },
];

/** Each FAQ shows once, under the first group it belongs to. */
const groupFaqs = (faqs: Faq[]) => {
  const groupOf = (f: Faq) => GROUPS.find((g) => f.categories.includes(g.key))?.key ?? "repairs";
  return GROUPS.map((g) => ({ ...g, faqs: faqs.filter((f) => groupOf(f) === g.key) })).filter((g) => g.faqs.length);
};

/** R08 — every FAQ, grouped by topic with jump links; FAQPage markup lists exactly what is shown. */
export default async function FaqPage() {
  const [page, faqs, seo] = await Promise.all([getFaqPage(), getFaqs(null), getSeoData()]);
  const groups = groupFaqs(faqs);
  return (
    <>
      <JsonLd data={jsonLdForFaq(seo, groups.flatMap((g) => g.faqs))} />
      <PageHero hero={page.hero} />
      <div className="container-site max-w-3xl py-16">
        {page.intro ? <p className="mb-8 text-body-lg text-text-secondary">{page.intro}</p> : null}
        {groups.length > 1 ? (
          <nav aria-label="FAQ topics" className="mb-12 flex flex-wrap gap-x-6 gap-y-2">
            {groups.map((g) => (
              <a key={g.key} href={`#faq-${g.key}`} className="inline-flex min-h-10 items-center text-body font-bold text-primary-text hover:underline">
                {g.heading}
              </a>
            ))}
          </nav>
        ) : null}
        {groups.map((g) => (
          <section key={g.key} id={`faq-${g.key}`} aria-labelledby={`faq-${g.key}-heading`} className="mt-14 scroll-mt-28 first-of-type:mt-0">
            <h2 id={`faq-${g.key}-heading`} className="mb-6 text-h3">
              {g.heading}
            </h2>
            <FaqList faqs={g.faqs} engine="gsap" />
          </section>
        ))}
      </div>
      <ContactPrompt id="faq-contact" heading="Still have a question?" intro="Send us a message and we'll get back to you." />
    </>
  );
}

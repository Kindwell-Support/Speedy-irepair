import type { Metadata } from "next";
import { getFaqs, getHomeInternetPage } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForHomeInternet } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { FaqList } from "@/components/sections/shared/FaqList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/home-internet", (await getHomeInternetPage()).seo);
}

/** R11 — $40/mo, first month free, free smartphone (spec facts); Jotform behind a click-to-load facade. */
export default async function HomeInternetPage() {
  const [page, faqs, seo] = await Promise.all([getHomeInternetPage(), getFaqs("internet"), getSeoData()]);
  const lists = [
    { id: "who-its-for", s: page.whoItsForSection },
    { id: "what-you-get", s: page.whatYouGetSection },
  ];
  return (
    <>
      <JsonLd data={jsonLdForHomeInternet(seo)} />
      <PageHero hero={page.hero} />
      {lists.map(({ id, s }) => (
        <Section key={id} id={id} copy={s}>
          <ul className="grid gap-3 md:grid-cols-3">
            {s.items.map((i) => (
              <li key={i} className="rounded-xl border border-border bg-surface p-6">
                {i}
              </li>
            ))}
          </ul>
        </Section>
      ))}
      <Section id="sign-up" copy={page.howToSignUpSection} tone="raised">
        <EmbedFacade
          src={page.jotformUrl}
          title="Home Internet sign-up form (Jotform)"
          loadLabel="Load sign-up form"
          directHref={page.jotformUrl}
          directLabel="Open the sign-up form in a new tab"
          heightClass="h-[1100px]"
        />
      </Section>
      <Section id="internet-faq" copy={page.faqSection}>
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}

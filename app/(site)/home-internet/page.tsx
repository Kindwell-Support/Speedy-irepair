import type { Metadata } from "next";
import Image from "next/image";
import { SITE_IMAGES } from "@/lib/site-images";
import { TypeRows } from "@/components/ui/TypeRows";
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
  const board = SITE_IMAGES.boardMacro;
  const lists = [
    { id: "who-its-for", s: page.whoItsForSection },
    { id: "what-you-get", s: page.whatYouGetSection },
  ];
  return (
    <>
      <JsonLd data={jsonLdForHomeInternet(seo)} />
      <PageHero hero={page.hero} photo="devices" />
      {lists.map(({ id, s }, n) => (
        <Section key={id} id={id} copy={s} tone={n === 1 ? "raised" : "default"}>
          <TypeRows items={s.items} />
        </Section>
      ))}
      <Section id="sign-up" copy={page.howToSignUpSection}>
        <EmbedFacade
          src={page.jotformUrl}
          title="Home Internet sign-up form (Jotform)"
          loadLabel="Load sign-up form"
          directHref={page.jotformUrl}
          directLabel="Open the sign-up form in a new tab"
          heightClass="h-[1100px]"
          idleHeightClass="h-[420px] md:h-[480px]"
          backdrop={
            <>
              <Image src={board.src} alt="" fill sizes="100vw" className="object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            </>
          }
        />
      </Section>
      <Section id="internet-faq" copy={page.faqSection} tone="raised" layout="side">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}

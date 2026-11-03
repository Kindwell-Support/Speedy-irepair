import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, getServiceFaqs, getServices } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { SERVICE_PAGES, SERVICES } from "@/lib/seo/content";
import { jsonLdForServiceDetail } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { RichText } from "@/components/ui/RichText";
import { ContactPrompt } from "@/components/sections/shared/ContactPrompt";
import { FaqList } from "@/components/sections/shared/FaqList";
import { PHOTO_BY_SLUG } from "@/components/sections/shared/ServiceSections";
import type { Service } from "@/lib/sanity/types";

type Params = { params: Promise<{ slug: string }> };

// Only the services in SERVICE_PAGES get a page; every other slug 404s.
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(SERVICE_PAGES).map((slug) => ({ slug }));
}

const words = (s: string) => s.trim().split(/\s+/).length;

/** The direct answer under the H1: the Studio summary once it is snippet-length (40+ words), else the SEO copy. */
const answerFor = (s: Service) =>
  words(s.summary) >= 40 ? s.summary : (SERVICES.find((x) => x.slug === s.slug)?.snippet ?? s.summary);

const metaFor = (s: Service) => ({
  metaTitle: s.seo?.metaTitle || SERVICE_PAGES[s.slug].metaTitle,
  metaDescription: s.seo?.metaDescription || SERVICE_PAGES[s.slug].metaDescription,
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s || !SERVICE_PAGES[slug]) return {};
  return pageMetadata("/services", { ...s.seo, ...metaFor(s), ogImage: s.seo?.ogImage ?? s.image }, `/services/${slug}`);
}

/** One service: direct answer, prices, details, its FAQs, and links to the other service pages. */
export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const [s, faqs, services, seo] = await Promise.all([getService(slug), getServiceFaqs(slug), getServices(), getSeoData()]);
  if (!s || !SERVICE_PAGES[slug]) notFound();

  const answer = answerFor(s);
  const prices = s.priceList?.filter((p) => p.label && p.price) ?? [];
  const related = services.filter((x) => x.slug !== slug && SERVICE_PAGES[x.slug]);
  const [primaryCta, secondaryCta] = s.ctas ?? [];

  return (
    <>
      <JsonLd
        data={jsonLdForServiceDetail(seo, { slug, title: s.title, metaTitle: metaFor(s).metaTitle, description: answer, faqs })}
      />
      <nav aria-label="Breadcrumb" className="container-site pt-10 md:pt-12">
        <ol className="flex flex-wrap items-center gap-2 text-body text-text-secondary">
          <li>
            <Link href="/" className="hover:text-primary-text">Home</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/services" className="hover:text-primary-text">Services</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-text-primary">{s.title}</li>
        </ol>
      </nav>
      <PageHero
        hero={{ headline: `${s.title} in Akron, OH`, subline: answer, primaryCta, secondaryCta, poster: s.image }}
        photo={PHOTO_BY_SLUG[slug]}
      />

      {s.priceFrom || prices.length || s.body?.length ? (
        <Section id="service-details" copy={{ heading: `${s.title} details` }} layout="side">
          {s.priceFrom ? <p className="text-h4 font-bold text-primary-text">{s.priceFrom}</p> : null}
          {prices.length ? (
            <dl className="mt-5 max-w-md divide-y divide-border border-y border-border">
              {prices.map((p) => (
                <div key={p.label} className="flex items-baseline justify-between gap-6 py-2.5">
                  <dt className="text-body text-text-secondary">{p.label}</dt>
                  <dd className="text-body font-bold tabular-nums text-text-primary">{p.price}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {s.body?.length ? (
            <div className="mt-8 max-w-prose">
              <PlaceholderMark show={s.isPlaceholder}>
                <RichText value={s.body} />
              </PlaceholderMark>
            </div>
          ) : null}
        </Section>
      ) : null}

      {faqs.length ? (
        <Section id="service-faq" copy={{ heading: `${s.title} FAQs` }} tone="raised" layout="side">
          <FaqList faqs={faqs} />
        </Section>
      ) : null}

      <Section id="related-services" copy={{ heading: "Other services" }} layout="side">
        <ul className="grid gap-x-8 sm:grid-cols-2">
          {related.map((x) => (
            <li key={x.id} className="border-b border-border">
              <Link
                href={`/services/${x.slug}`}
                className="flex min-h-12 items-center justify-between gap-4 text-body-lg font-bold transition-colors duration-fast hover:text-primary-text"
              >
                {x.title} <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/services" className="mt-6 inline-flex min-h-10 items-center text-body font-bold text-primary-text hover:underline">
          All services →
        </Link>
      </Section>

      <ContactPrompt id="service-contact" heading="Questions about your device?" intro="Tell us what's wrong and we'll let you know if we can fix it." />
    </>
  );
}

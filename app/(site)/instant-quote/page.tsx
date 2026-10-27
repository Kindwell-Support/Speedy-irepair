import type { Metadata } from "next";
import Image from "next/image";
import { getQuotePage, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForInstantQuote } from "@/lib/seo/routes";
import { SITE_IMAGES } from "@/lib/site-images";
import { telHref } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { QuoteForm } from "@/components/sections/forms/QuoteForm";
import { HoursList } from "@/components/sections/global/HoursList";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/instant-quote", (await getQuotePage()).seo);
}

const NEXT_STEPS = [
  { title: "We read your request", body: "Your device, model and fault go straight to the repair counter." },
  { title: "We get back to you", body: "By phone, or by email if you left one, during opening hours." },
  { title: "You decide", body: "The quote is free and there is no obligation to book." },
];

/**
 * R06 — pricing TBD, so the tool runs in lead-capture mode (F1). The hero stays type-only so the form is near
 * the top on a phone; the photo and the reassurance (what happens next, tap to call, hours) sit beside it.
 */
export default async function InstantQuotePage() {
  const [page, settings, seo] = await Promise.all([getQuotePage(), getSiteSettings(), getSeoData()]);
  const b = settings.business;
  const photo = SITE_IMAGES.screenLift;
  return (
    <>
      <JsonLd data={jsonLdForInstantQuote(seo)} />
      <PageHero hero={page.hero} />
      <section id="quote" aria-labelledby="quote-heading" className="py-16 md:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="rounded-md border border-border bg-surface p-6 md:p-10 lg:col-span-7">
            <h2 id="quote-heading" className="mb-8 text-h3">
              {page.formSection.heading}
            </h2>
            <QuoteForm deviceTypes={page.deviceTypes} issues={page.issues} successMessage={page.successMessage} />
          </div>

          <aside aria-label="About your quote" className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            <div>
              <h2 className="font-sans text-h5 font-bold">What happens next</h2>
              <ol className="mt-5 flex flex-col gap-5">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
                    <span className="font-heading text-h5 font-black tabular-nums text-primary-text">{i + 1}</span>
                    <div>
                      <p className="text-body-lg font-bold">{s.title}</p>
                      <p className="mt-1 text-body text-text-secondary">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="font-sans text-h5 font-bold">Rather talk to someone?</h2>
              <a href={telHref(b.phone)} className="mt-2 inline-flex min-h-12 items-center font-heading text-h3 font-black tabular-nums hover:text-primary-text">
                {b.phone}
              </a>
              <div className="mt-4">
                <HoursList business={b} compact />
              </div>
            </div>

            <figure className="hidden lg:block">
              <div className="photo aspect-[4/5]">
                <Image src={photo.src} alt={photo.alt} fill sizes="30vw" />
              </div>
              <figcaption className="text-tag mt-3 text-text-tertiary">{photo.caption}</figcaption>
            </figure>
          </aside>
        </div>
      </section>
    </>
  );
}

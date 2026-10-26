import type { Metadata } from "next";
import { getSchedulePage, getSiteSettings } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForScheduleRepair } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceSummary } from "@/components/ui/ServiceSummary";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { RichText } from "@/components/ui/RichText";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { LocationContact } from "@/components/sections/shared/LocationContact";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/schedule-repair", (await getSchedulePage()).seo);
}

/** R07 — branded wrapper; Square booking stays on-site (click-to-load iframe, direct link fallback). */
export default async function ScheduleRepairPage() {
  const [page, settings, seo] = await Promise.all([
    getSchedulePage(),
    getSiteSettings(),
    getSeoData(),
  ]);
  return (
    <>
      <JsonLd data={jsonLdForScheduleRepair(seo)} />
      <Breadcrumbs data={jsonLdForScheduleRepair(seo)} />
      <PageHero hero={page.hero} />
      <ServiceSummary data={jsonLdForScheduleRepair(seo)} />
      <Section id="booking">
        <EmbedFacade
          src={page.squareBookingUrl}
          title="Book a repair appointment with Speedy iRepair (Square)"
          loadLabel="Load booking calendar"
          directHref={page.squareBookingUrl}
          directLabel="Open booking in a new tab"
          heightClass="h-[900px]"
          description="Booking is provided by Square. Loading it sets Square cookies."
        />
      </Section>
      <div className="container-site grid gap-10 pb-8 md:grid-cols-2">
        {[page.whatToExpect, page.whatToBring].map((s) => (
          <section key={s.heading} aria-label={s.heading}>
            <h2 className="text-h3">{s.heading}</h2>
            {s.intro ? <p className="mt-4 text-body-lg text-text-secondary">{s.intro}</p> : null}
            {s.body?.length ? (
              <div className="mt-4">
                <RichText value={s.body} />
              </div>
            ) : null}
          </section>
        ))}
      </div>
      <LocationContact
        copy={page.locationSection}
        business={settings.business}
        showForm={false}
        id="schedule-location"
      />
    </>
  );
}

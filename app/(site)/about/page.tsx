import type { Metadata } from "next";
import { getAboutPage, getSiteSettings, getTeamMembers } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForAbout } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { SmartImage } from "@/components/ui/SmartImage";
import { LocationContact } from "@/components/sections/shared/LocationContact";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about", (await getAboutPage()).seo);
}

/** R09 — story/team content is TBD -> Sanity placeholders (visibly marked, no Person schema). */
export default async function AboutPage() {
  const [page, settings, team, seo] = await Promise.all([
    getAboutPage(),
    getSiteSettings(),
    getTeamMembers(),
    getSeoData(),
  ]);
  return (
    <>
      <JsonLd data={jsonLdForAbout(seo)} />
      <Breadcrumbs data={jsonLdForAbout(seo)} />
      <PageHero hero={page.hero} />
      <Section id="about-us" copy={page.aboutSection} />
      <Section id="team" copy={page.teamSection} tone="raised">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <li key={m.id} className="rounded-xl border border-border bg-surface p-6">
              {m.photo ? (
                <SmartImage
                  image={m.photo}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="mb-4 aspect-square rounded-lg object-cover"
                />
              ) : null}
              <h3 className="text-h5">
                <PlaceholderMark show={m.isPlaceholder}>{m.name}</PlaceholderMark>
              </h3>
              <p className="text-body-sm text-primary-text">{m.role}</p>
              <p className="mt-2 text-body-sm text-text-secondary">{m.bio}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section id="story" copy={page.storySection} />
      <Section id="values" copy={page.valuesSection} tone="raised">
        <ul className="grid gap-3 md:grid-cols-3">
          {page.valuesSection.values.map((v) => (
            <li key={v} className="rounded-xl border border-border bg-surface p-6 text-h5">
              {v}
            </li>
          ))}
        </ul>
      </Section>
      {settings.business.spectrumAuthorizedRetailer ? (
        <Section id="spectrum" copy={page.spectrumSection} />
      ) : null}
      <Section id="about-cta" copy={page.ctaSection} tone="raised">
        <div className="flex flex-wrap gap-3">
          {page.ctaSection.ctas.map((c) => (
            <ButtonLink key={c.label} cta={c} size="lg" />
          ))}
        </div>
      </Section>
      <LocationContact
        copy={page.locationSection ?? page.contactSection}
        contactCopy={page.contactSection}
        business={settings.business}
        id="about-contact"
      />
    </>
  );
}

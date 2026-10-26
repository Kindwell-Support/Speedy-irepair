import type { Metadata } from "next";
import { getAboutPage, getEmbedCopy, getSiteSettings, getTeamMembers } from "@/lib/sanity/content";
import { pageMetadata } from "@/lib/page/meta";
import { getSeoData } from "@/lib/seo/getSeoData";
import { jsonLdForAbout } from "@/lib/seo/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";
import { InfoCard } from "@/components/sections/shared/InfoCard";
import { CtaBand } from "@/components/sections/shared/CtaBand";
import { LocationContact } from "@/components/sections/shared/LocationContact";
import { AboutSplit } from "@/components/sections/about/AboutSplit";
import { MemberCard } from "@/components/sections/about/MemberCard";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about", (await getAboutPage()).seo);
}

/** Decorative value icons in design order (fast / fair / honest). Presentational only. */
const VALUE_ICONS: LineIconName[] = ["bolt", "tag", "shield"];

/**
 * R09 / design about.html: hero → Who we are (split + Spectrum badge) → values (info cards) → story
 * (split, photo slot) → team (4-up member cards) → location & contact → CTA band. Story/team copy is
 * TBD and stays visibly marked as placeholder (no Person schema).
 */
export default async function AboutPage() {
  const [page, settings, team, seo, mapCopy] = await Promise.all([
    getAboutPage(),
    getSiteSettings(),
    getTeamMembers(),
    getSeoData(),
    getEmbedCopy("map"),
  ]);
  const values = page.valuesSection.items?.length
    ? page.valuesSection.items
    : page.valuesSection.values.map((title) => ({ title, body: null }));
  return (
    <>
      <JsonLd data={jsonLdForAbout(seo)} />
      <Breadcrumbs data={jsonLdForAbout(seo)} />
      <PageHero hero={page.hero} />
      <AboutSplit
        id="about-us"
        copy={page.aboutSection}
        aside={
          <>
            {page.intro ? <p className="text-body-lg text-text">{page.intro}</p> : null}
            {settings.business.spectrumAuthorizedRetailer ? (
              <p
                data-testid="spectrum-badge"
                className="inline-flex items-center gap-4 self-start rounded-lg border border-border bg-surface px-6 py-4 text-body-sm font-semibold"
              >
                <LineIcon name="badge" className="shrink-0 text-brand" />
                {page.spectrumSection.heading}
              </p>
            ) : null}
          </>
        }
      />
      <Section
        id="values"
        copy={page.valuesSection}
        tone="raised"
        className="border-t border-border-subtle"
      >
        <ul className="grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {values.map((v, i) => (
            <InfoCard
              key={v.title}
              icon={VALUE_ICONS[i % VALUE_ICONS.length]}
              title={v.title}
              body={v.body}
            />
          ))}
        </ul>
      </Section>
      <AboutSplit
        id="story"
        copy={page.storySection}
        aside={
          <div
            aria-hidden
            className="grid aspect-[4/3] place-items-center rounded-xl border border-border-subtle bg-[radial-gradient(60%_60%_at_50%_40%,#1e1e1e,#121212)] text-text-tertiary"
          >
            <LineIcon name="pin" size={48} />
          </div>
        }
      />
      <Section
        id="team"
        copy={page.teamSection}
        tone="raised"
        className="border-t border-border-subtle"
      >
        <ul
          className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          data-testid="team-grid"
        >
          {team.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </ul>
      </Section>
      <LocationContact
        copy={page.locationSection ?? page.contactSection}
        contactCopy={page.contactSection}
        business={settings.business}
        mapCopy={mapCopy}
        id="about-contact"
      />
      <CtaBand id="about-cta" copy={page.ctaSection} testId="cta-band" />
    </>
  );
}

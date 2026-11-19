import type { BusinessInfo } from "@/lib/sanity/types";
import type { PartnerAudience } from "@/lib/forms/schemas";
import type { SiteImageKey } from "@/lib/site-images";
import { telHref } from "@/lib/utils/format";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { PartnerForm } from "@/components/sections/forms/PartnerForm";
import { HoursList } from "@/components/sections/global/HoursList";

export interface PartnerPageCopy {
  audience: PartnerAudience;
  headline: string;
  subline: string;
  photo: SiteImageKey;
  benefitsHeading: string;
  benefits: { title: string; body: string }[];
  formHeading: string;
}

/**
 * /business-support and /education: hero, three reasons to work with the shop, then the inquiry form
 * (GHL General Inquiries) with the phone number and hours beside it.
 */
export function PartnerPage({ copy, business }: { copy: PartnerPageCopy; business: BusinessInfo }) {
  return (
    <>
      <PageHero
        hero={{
          headline: copy.headline,
          subline: copy.subline,
          primaryCta: { label: "Get in touch", href: "#inquiry", variant: "primary" },
        }}
        photo={copy.photo}
      />

      <Section id="benefits" copy={{ heading: copy.benefitsHeading }} tone="raised">
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {copy.benefits.map((b, i) => (
            <li key={b.title} className="border-t border-border pt-6">
              <span className="font-heading text-h4 font-black tabular-nums text-primary-text">{i + 1}</span>
              <h3 className="mt-3 text-h4">{b.title}</h3>
              <p className="mt-3 text-body-lg text-text-secondary">{b.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section id="inquiry" aria-labelledby="inquiry-heading" className="scroll-mt-32 py-section">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="rounded-md border border-border bg-surface p-6 md:p-10 lg:col-span-7">
            <h2 id="inquiry-heading" className="mb-8 text-h3">
              {copy.formHeading}
            </h2>
            <PartnerForm audience={copy.audience} />
          </div>

          <aside aria-label="Other ways to reach us" className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9">
            <div>
              <h2 className="font-sans text-h5 font-bold">Rather talk to someone?</h2>
              <a
                href={telHref(business.phone)}
                className="mt-2 inline-flex min-h-12 items-center font-heading text-h3 font-black tabular-nums hover:text-primary-text"
              >
                {business.phone}
              </a>
              <div className="mt-4">
                <HoursList business={business} compact />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

import { A11Y } from "@/components/ui/a11yStrings";
import type { BusinessInfo, EmbedCopy, SectionCopy } from "@/lib/sanity/types";
import { publicEnv } from "@/lib/env";
import { Section } from "@/components/ui/Section";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "@/components/sections/global/HoursList";
import dynamic from "next/dynamic";

/** Below the fold on every route that uses it: split the client form into its own chunk (first-load JS budget). */
const ContactForm = dynamic(() =>
  import("@/components/sections/forms/ContactForm").then((m) => m.ContactForm),
);

/** Spec 2.1.9 location + contact (also used on /about and /schedule-repair). */
export function LocationContact({
  copy,
  business,
  directionsLabel = "Get Directions",
  showForm = true,
  id = "location",
  section,
  contactCopy,
  mapCopy,
}: {
  copy: SectionCopy;
  /** Heading/intro above the contact form (CMS homePage/aboutPage.contactHeading, contract v1.3). */
  contactCopy?: SectionCopy | null;
  business: BusinessInfo;
  /** Map facade copy (getEmbedCopy("map")). */
  mapCopy: EmbedCopy;
  directionsLabel?: string;
  showForm?: boolean;
  id?: string;
  /** QA hook (homepage only). */
  section?: string;
}) {
  const embed = business.googleMapsEmbedUrl || publicEnv.googleMapsEmbedUrl;
  const a = business.address;
  return (
    <Section id={id} copy={copy} section={section}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <address className="space-y-2 text-body-lg not-italic">
            <p>
              {a.street}
              {a.suite ? ` ${a.suite}` : ""}, {a.city}, {a.state} {a.zip}
            </p>
            <p>
              <a href={telHref(business.phone)} className="hover:text-primary-text">
                {business.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${business.email}`} className="hover:text-primary-text">
                {business.email}
              </a>
            </p>
          </address>
          <div>
            <h3 className="mb-3 text-h5">Hours</h3>
            <HoursList business={business} />
          </div>
          <a
            href={business.externalLinks.maps}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary", "lg")}
          >
            {directionsLabel}
            <span className="sr-only">{A11Y.opensMapsInNewTab}</span>
          </a>
          {embed ? (
            <div data-testid="map-embed" data-qa-mask>
              <EmbedFacade
                src={embed}
                copy={mapCopy}
                directHref={business.externalLinks.maps}
                heightClass="h-[320px]"
              />
            </div>
          ) : null}
        </div>
        {showForm ? (
          <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
            {contactCopy ? (
              <div className="mb-6 grid gap-2">
                <h3 className="text-h4">{contactCopy.heading}</h3>
                {contactCopy.intro ? (
                  <p className="text-body-sm text-text-secondary">{contactCopy.intro}</p>
                ) : null}
              </div>
            ) : null}
            <ContactForm idPrefix={`${id}-contact`} />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

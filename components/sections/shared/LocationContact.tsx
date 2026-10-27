import { A11Y } from "@/components/ui/a11yStrings";
import type { BusinessInfo, EmbedCopy, SectionCopy } from "@/lib/sanity/types";
import { publicEnv } from "@/lib/env";
import { Section } from "@/components/ui/Section";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "@/components/sections/global/HoursList";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { LineIcon } from "@/components/ui/LineIcon";

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
      {/* Design .loc: map 7fr + NAP/hours card 5fr; without a configured embed the card spans the row. */}
      <div className={cn("grid gap-6", embed && "lg:grid-cols-[7fr_5fr]")}>
        {embed ? (
          <div data-testid="map-embed" data-qa-mask>
            <EmbedFacade
              src={embed}
              copy={mapCopy}
              directHref={business.externalLinks.maps}
              heightClass="h-[320px] lg:h-full lg:min-h-[480px]"
            />
          </div>
        ) : null}
        <div
          className={cn(
            "grid content-start gap-6 rounded-xl border border-border bg-surface p-6 md:p-8",
            !embed && "lg:grid-cols-2 lg:gap-x-16",
          )}
        >
          <div className="grid content-start gap-6">
            <address className="grid gap-4 text-body not-italic">
              <p className="flex items-start gap-3">
                <LineIcon name="pin" size={20} className="mt-[2px] flex-none text-text-tertiary" />
                <span>
                  {a.street}
                  {a.suite ? ` ${a.suite}` : ""}, {a.city}, {a.state} {a.zip}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <LineIcon
                  name="phone"
                  size={20}
                  className="mt-[2px] flex-none text-text-tertiary"
                />
                <a href={telHref(business.phone)} className="tabular-nums hover:text-primary-text">
                  {business.phone}
                </a>
              </p>
              <p className="flex items-start gap-3">
                <LineIcon name="mail" size={20} className="mt-[2px] flex-none text-text-tertiary" />
                <a href={`mailto:${business.email}`} className="break-all hover:text-primary-text">
                  {business.email}
                </a>
              </p>
            </address>
            <div className="flex flex-wrap gap-3">
              <a
                href={business.externalLinks.maps}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("primary", "md")}
              >
                {directionsLabel}
                <span className="sr-only">{A11Y.opensMapsInNewTab}</span>
              </a>
              {mapCopy.callLabel ? (
                <a href={telHref(business.phone)} className={buttonClasses("secondary", "md")}>
                  {mapCopy.callLabel}
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-label font-semibold uppercase text-text-secondary">Hours</h3>
            <HoursList business={business} />
          </div>
        </div>
      </div>
      {showForm ? (
        // Design .contact-wrap: full-width card, heading stack 4fr + form 8fr.
        <div className="mt-6 grid gap-8 rounded-xl border border-border bg-surface p-6 md:p-8 lg:grid-cols-[4fr_8fr] lg:gap-16 lg:p-12">
          {contactCopy ? (
            <div className="grid content-start gap-2">
              <h3 className="text-h3">{contactCopy.heading}</h3>
              {contactCopy.intro ? (
                <p className="text-body-sm text-text-secondary">{contactCopy.intro}</p>
              ) : null}
            </div>
          ) : (
            <div aria-hidden="true" className="hidden lg:block" />
          )}
          <ContactForm idPrefix={`${id}-contact`} />
        </div>
      ) : null}
    </Section>
  );
}

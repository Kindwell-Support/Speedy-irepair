import type { BusinessInfo, SectionCopy } from "@/lib/sanity/types";
import { publicEnv } from "@/lib/env";
import { Section } from "@/components/ui/Section";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "@/components/sections/global/HoursList";
import { ContactForm } from "@/components/sections/forms/ContactForm";

/** Spec 2.1.9 location + contact (also used on /about and /schedule-repair). */
export function LocationContact({
  copy,
  business,
  directionsLabel = "Get Directions",
  showForm = true,
  id = "location",
}: {
  copy: SectionCopy;
  business: BusinessInfo;
  directionsLabel?: string;
  showForm?: boolean;
  id?: string;
}) {
  const embed = business.googleMapsEmbedUrl || publicEnv.googleMapsEmbedUrl;
  const a = business.address;
  return (
    <Section id={id} copy={copy}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <address className="space-y-2 text-body-lg not-italic">
            <p>
              {a.street}
              {a.suite ? ` ${a.suite}` : ""}, {a.city}, {a.state} {a.zip}
            </p>
            <p>
              <a href={telHref(business.phone)} className="hover:text-brand">
                {business.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${business.email}`} className="hover:text-brand">
                {business.email}
              </a>
            </p>
          </address>
          <div>
            <h3 className="mb-3 text-h5">Hours</h3>
            <HoursList business={business} />
          </div>
          <a href={business.externalLinks.maps} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
            {directionsLabel}
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
          {embed ? (
            <EmbedFacade
              src={embed}
              title={`Map: ${business.name}`}
              loadLabel="Show map"
              directHref={business.externalLinks.maps}
              directLabel="Open in Google Maps"
              heightClass="h-[320px]"
            />
          ) : null}
        </div>
        {showForm ? (
          <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
            <h3 className="mb-6 text-h4">Send us a message</h3>
            <ContactForm idPrefix={`${id}-contact`} />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

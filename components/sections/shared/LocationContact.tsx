import Image from "next/image";
import type { BusinessInfo, SectionCopy } from "@/lib/sanity/types";
import { publicEnv } from "@/lib/env";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { SITE_IMAGES } from "@/lib/site-images";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "@/components/sections/global/HoursList";
import { ContactForm } from "@/components/sections/forms/ContactForm";
import { MapEmbed } from "./MapEmbed";
import { OpenStatus } from "./OpenStatus";

/**
 * Spec 2.1.9 location + contact.
 * The street address is set as display type: it is the one thing a visitor needs to carry away.
 * Storefront photo above the map on the right, so visitors know the building (MapEmbed, with a poster while it loads); a live open/closed line sits above the hours.
 * The contact form runs underneath as its own row.
 */
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
  const a = business.address;
  // Without a configured embed URL, fall back to Google's keyless query embed so the map column never drops out.
  const embed =
    business.googleMapsEmbedUrl ||
    publicEnv.googleMapsEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(`${business.name}, ${a.street}${a.suite ? ` ${a.suite}` : ""}, ${a.city}, ${a.state} ${a.zip}`)}&output=embed`;
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="py-section">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="flex flex-col gap-10 lg:col-span-5">
            <div>
              <h2 id={headingId} className="text-h2">
                {copy.heading}
              </h2>
              {copy.intro ? (
                <p className="mt-5 max-w-[46ch] text-body-lg text-text-secondary">
                  <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
                </p>
              ) : null}
            </div>

            <address className="not-italic">
              <p className="font-heading text-h3 font-black">
                {a.street}
                {a.suite ? ` ${a.suite}` : ""}
              </p>
              <p className="mt-1 text-body-lg text-text-secondary">
                {a.city}, {a.state} {a.zip}
              </p>
              <ul className="mt-6 flex flex-col">
                <li>
                  <a href={telHref(business.phone)} className="inline-flex min-h-12 items-center text-h4 font-bold tabular-nums hover:text-primary-text">
                    {business.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${business.email}`} className="inline-flex min-h-12 items-center text-body-lg text-text-secondary underline-offset-4 hover:text-text hover:underline">
                    {business.email}
                  </a>
                </li>
              </ul>
            </address>

            <a href={business.externalLinks.maps} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg", "self-start")}>
              {directionsLabel}
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>

            <div className="pt-2">
              <h3 className="mb-4 font-sans text-h5 font-bold">Opening hours</h3>
              <OpenStatus business={business} className="mb-5" />
              <div className="max-w-sm">
                <HoursList business={business} stagger />
              </div>
            </div>
          </div>

          {embed ? (
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div className="photo relative aspect-[16/9]">
                <Image
                  src={SITE_IMAGES.storeExterior.src}
                  alt={SITE_IMAGES.storeExterior.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-[50%_32%]"
                />
              </div>
              <MapEmbed
                src={embed}
                title={`Map: ${business.name}`}
                address={`${a.street}${a.suite ? ` ${a.suite}` : ""}, ${a.city}, ${a.state} ${a.zip}`}
                mapsHref={business.externalLinks.maps}
                className="h-[360px] w-full lg:min-h-[360px] lg:flex-1"
              />
            </div>
          ) : null}
        </div>

        {showForm ? (
          <div className="mt-24 grid gap-8 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-4">
              <h3 className="text-h3">Send us a message</h3>
              <p className="mt-4 max-w-[40ch] text-body-lg text-text-secondary">Ask about a repair, a device you want to buy or sell, or an order.</p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ContactForm idPrefix={`${id}-contact`} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

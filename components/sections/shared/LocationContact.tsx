import type { BusinessInfo, SectionCopy } from "@/lib/sanity/types";
import { publicEnv } from "@/lib/env";
import { EmbedFacade } from "@/components/ui/EmbedFacade";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "@/components/sections/global/HoursList";
import { ContactForm } from "@/components/sections/forms/ContactForm";

/**
 * Spec 2.1.9 location + contact (also used on /about and /schedule-repair).
 * The street address is set as display type: it is the one thing a visitor needs to carry away.
 * Map on the right; the contact form runs underneath as its own ruled row.
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

            <div className="border-t border-border pt-6">
              <h3 className="mb-4 font-sans text-h5 font-bold">Opening hours</h3>
              <div className="max-w-sm">
                <HoursList business={business} />
              </div>
            </div>
          </div>

          {embed ? (
            <div className="lg:col-span-7">
              <EmbedFacade
                src={embed}
                title={`Map: ${business.name}`}
                loadLabel="Show map"
                description={`${a.street}, ${a.city}. The map loads from Google when you ask for it.`}
                directHref={business.externalLinks.maps}
                directLabel="Open in Google Maps"
                heightClass="h-[360px] lg:h-full lg:min-h-[560px]"
                backdrop={<StreetSketch street={a.street} />}
              />
            </div>
          ) : null}
        </div>

        {showForm ? (
          <div className="mt-20 grid gap-8 border-t border-border pt-14 lg:grid-cols-12 lg:gap-x-8">
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

/** Schematic street grid behind the map facade: the shop's road and a pin, not a real map. */
function StreetSketch({ street }: { street: string }) {
  const road = street.replace(/^\d+\s+/, "");
  return (
    <svg viewBox="0 0 700 560" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="street-fade" cx="50%" cy="52%" r="60%">
          <stop offset="0%" className="[stop-color:var(--color-surface)] [stop-opacity:0.9]" />
          <stop offset="100%" className="[stop-color:var(--color-surface)] [stop-opacity:0]" />
        </radialGradient>
      </defs>
      <g stroke="rgba(255,255,255,0.07)" strokeWidth="2">
        {[60, 170, 290, 410, 530, 640].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x - 40} y2="560" />
        ))}
        {[40, 250, 330, 420, 510].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="700" y2={y + 18} />
        ))}
      </g>
      <path d="M-20 150 L720 118" stroke="rgba(255,255,255,0.16)" strokeWidth="18" fill="none" />
      <text x="470" y="104" fill="rgba(255,255,255,0.45)" fontSize="15" fontWeight="700" transform="rotate(-2.5 470 104)">
        {road}
      </text>
      <rect x="0" y="0" width="700" height="560" fill="url(#street-fade)" />
      <g transform="translate(350 134)">
        <circle r="22" className="[fill:var(--color-primary)]" opacity="0.25" />
        <path d="M0 0 C-14 -16 -16 -28 -16 -34 a16 16 0 0 1 32 0 c0 6 -2 18 -16 34 Z" className="[fill:var(--color-primary)]" />
        <circle cy="-34" r="6" fill="#fff" />
      </g>
    </svg>
  );
}

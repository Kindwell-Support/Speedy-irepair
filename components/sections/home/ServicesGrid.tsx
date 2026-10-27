import Image from "next/image";
import Link from "next/link";
import type { SectionCopy, ServiceCard } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils/cn";

/** Photographs for the cards that lead the section. Cards without one fall into the compact list. */
const FEATURE_PHOTOS: Record<string, { src: string; alt: string; w: number; h: number }> = {
  c1: { src: "/images/site/screen-lift.webp", alt: "Gloved hands lifting a cracked phone screen with a suction cup and a blue pry tool", w: 1856, h: 2304 },
  c2: { src: "/images/site/devices.webp", alt: "Phones and a tablet laid out on a workbench beside precision screwdrivers", w: 2000, h: 1116 },
};

/** The repairs inside "Smartphone Repair", each with its own photo, linking to its /services section. */
const REPAIRS = [
  { label: "Battery", href: "/services#battery-replacement", src: "/images/site/battery.webp", alt: "A new battery being placed into an opened phone" },
  { label: "Charger port", href: "/services#charger-port-repair", src: "/images/site/port.webp", alt: "A USB-C charging port being cleaned with a fine brush under a light" },
  { label: "Water damage", href: "/services#water-damage-inspection", src: "/images/site/board-macro.webp", alt: "Tweezers lifting a flex connector on a phone logic board" },
];

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn("h-5 w-5 shrink-0", className)} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

/**
 * Spec 2.1.2: all 8 cards (C1–C8). Two tiers instead of a grid of equal tiles: repair leads with a full-height
 * photograph and its three most-asked-for repairs; pre-owned devices sit beside it; everything sold at the
 * counter follows as a compact list.
 */
export function ServicesGrid({ copy, cards }: { copy: SectionCopy; cards: ServiceCard[] }) {
  const lead = cards.find((c) => c.id === "c1") ?? cards[0];
  const second = cards.find((c) => c !== lead && FEATURE_PHOTOS[c.id]);
  const rest = cards.filter((c) => c !== lead && c !== second);
  const leadPhoto = lead ? (FEATURE_PHOTOS[lead.id] ?? FEATURE_PHOTOS.c1!) : null;
  const secondPhoto = second ? FEATURE_PHOTOS[second.id] : null;

  return (
    <Section
      id="services"
      copy={copy}
      aside={
        <Link href="/services" className="inline-flex h-12 items-center gap-2 self-start text-body-lg font-bold text-text hover:text-primary-text">
          All services
          <Arrow />
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        {lead && leadPhoto ? (
          <article className="group relative lg:col-span-7 lg:row-span-2">
            <div className="photo photo-shade aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[640px]">
              <Image src={leadPhoto.src} alt={leadPhoto.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="transition-transform duration-slow ease-out group-hover:scale-[1.03]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-raised p-6 md:p-10">
              <h3 className="text-h2">
                <Link href={lead.href} className="after:absolute after:inset-0 after:rounded-md">
                  {lead.title}
                </Link>
              </h3>
              <p className="mt-4 max-w-[48ch] text-body-lg text-text-primary">{lead.description}</p>
            </div>
          </article>
        ) : null}

        <ul className="grid grid-cols-3 gap-3 lg:col-span-5 lg:gap-4" aria-label="Popular repairs">
          {REPAIRS.map((r) => (
            <li key={r.href} className="group relative">
              <div className="photo aspect-[3/4]">
                <Image src={r.src} alt={r.alt} fill sizes="(min-width: 1024px) 13vw, 31vw" className="transition-transform duration-slow ease-out group-hover:scale-[1.04]" />
              </div>
              <Link
                href={r.href}
                className="mt-3 flex min-h-12 items-center justify-between gap-2 text-body font-bold leading-tight text-text after:absolute after:inset-0 group-hover:text-primary-text"
              >
                {r.label}
                <Arrow className="hidden md:block" />
              </Link>
            </li>
          ))}
        </ul>

        {second ? (
          <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface lg:col-span-5">
            {secondPhoto ? (
              <div className="photo aspect-[16/8] rounded-none">
                <Image src={secondPhoto.src} alt={secondPhoto.alt} fill sizes="(min-width: 1024px) 42vw, 100vw" className="transition-transform duration-slow ease-out group-hover:scale-[1.03]" />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col gap-3 p-6">
              <h3 className="text-h4">
                <Link href={second.href} className="after:absolute after:inset-0">
                  {second.title}
                </Link>
              </h3>
              <p className="max-w-[52ch] text-body text-text-secondary">{second.description}</p>
            </div>
          </article>
        ) : null}
      </div>

      {rest.length ? (
        <ul className="mt-12 grid border-t border-border md:mt-16 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((card) => (
            <li key={card.id} className="group relative flex flex-col gap-2 border-b border-border py-6 md:pr-8">
              <h3 className="flex items-center justify-between gap-4 text-h5">
                <Link href={card.href} className="after:absolute after:inset-0 group-hover:text-primary-text">
                  {card.title}
                </Link>
                <Arrow className="text-text-tertiary transition-transform duration-fast group-hover:translate-x-1 group-hover:text-primary-text" />
              </h3>
              <p className="max-w-[46ch] text-body text-text-secondary">{card.description}</p>
              {card.externalLink ? (
                <a
                  href={card.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-raised inline-flex min-h-12 items-center self-start text-body font-bold text-primary-text underline underline-offset-4"
                >
                  {card.externalLink.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}

import Link from "next/link";
import type { SectionCopy, ServiceCard } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { ServicesCarousel, type ServiceSlide, type ServiceTile } from "@/components/motion/ServicesCarousel";
import { SITE_IMAGES, type SiteImage } from "@/lib/site-images";

type Look = { photo: SiteImage } | { tile: ServiceTile };

/** Gallery order and look per card id: photos where there is an honest one, a drawn text tile for the rest. */
const CARD_SLIDES: { id: string; label: string; look: Look }[] = [
  { id: "c1", label: "Phone Repair", look: { photo: SITE_IMAGES.screenLift } },
  { id: "c6", label: "Home Internet", look: { tile: { tone: "brand", big: "First month free", small: "Plus a free smartphone when you sign up" } } },
  { id: "c7", label: "Financing", look: { tile: { tone: "brand", big: "No credit needed", small: "Acima lease-to-own" } } },
  { id: "c2", label: "Pre-Owned", look: { photo: SITE_IMAGES.devices } },
  { id: "c4", label: "Prepaid Plans", look: { tile: { tone: "dark", big: "Save every month", small: "Simple Mobile, AT&T and Verizon" } } },
  { id: "c8", label: "Unlocking", look: { tile: { tone: "dark", big: "Unlocked", small: "From any carrier" } } },
  { id: "c3", label: "Sell / Trade", look: { photo: SITE_IMAGES.storeCounter } },
  { id: "c5", label: "Bill Pay", look: { tile: { tone: "dark", big: "Pay bills here", small: "Water, electric and gas" } } },
];

/** The most-asked-for repairs inside "Smartphone Repair", each with its own photo and /services section. */
const REPAIRS: (Omit<ServiceSlide, "photo"> & { photo: SiteImage; after: string })[] = [
  {
    id: "battery",
    after: "c1",
    label: "Battery",
    title: "Battery Replacement",
    href: "/services#battery-replacement",
    description: "Phone dying fast or won't hold a charge? We fit a new battery for Apple, Samsung, LG and Google, covered by our 90-day warranty.",
    photo: SITE_IMAGES.battery,
  },
  {
    id: "port",
    after: "c6",
    label: "Charger Port",
    title: "Charger Port Repair",
    href: "/services#charger-port-repair",
    description: "Won't charge, or the cable won't stay in? We repair the port on Apple, Samsung, LG and Google, with a 90-day warranty.",
    photo: SITE_IMAGES.port,
  },
  {
    id: "water",
    after: "c4",
    label: "Water Damage",
    title: "Water Damage Inspection",
    href: "/services#water-damage-inspection",
    description: "We inspect the phone and try to preserve your data. Full function can't be guaranteed after water damage, and we tell you what we find first.",
    photo: SITE_IMAGES.boardMacro,
  },
];

const photoOf = (img: SiteImage) => ({ src: img.src, alt: img.alt });

function buildSlides(cards: ServiceCard[]): ServiceSlide[] {
  const slides: ServiceSlide[] = [];
  const used = new Set<string>();
  for (const spec of CARD_SLIDES) {
    const card = cards.find((c) => c.id === spec.id);
    if (card) {
      used.add(card.id);
      slides.push({
        id: card.id,
        label: spec.label,
        title: card.title,
        href: card.href,
        description: card.description,
        // A CMS photo on the card replaces the built-in photo or text tile.
        ...(card.image
          ? { photo: { src: card.image.src, alt: card.image.alt } }
          : "photo" in spec.look
            ? { photo: photoOf(spec.look.photo) }
            : { tile: spec.look.tile }),
      });
    }
    for (const { after, photo, ...repair } of REPAIRS) if (after === spec.id) slides.push({ ...repair, photo: photoOf(photo) });
  }
  // Cards added in the CMS later still appear, as dark text tiles.
  for (const card of cards)
    if (!used.has(card.id))
      slides.push({
        id: card.id,
        label: card.title,
        title: card.title,
        href: card.href,
        description: card.description,
        ...(card.image
          ? { photo: { src: card.image.src, alt: card.image.alt } }
          : { tile: { tone: "dark" as const, big: card.title, small: card.description } }),
      });
  return slides;
}

function Arrow() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

/**
 * Spec 2.1.2: all 8 cards (C1–C8), plus the three most-asked-for repairs, as a circular gallery that runs
 * edge to edge. Photos and drawn text tiles alternate; the panel under it names the centred service.
 */
export function ServicesGrid({ copy, cards }: { copy: SectionCopy; cards: ServiceCard[] }) {
  return (
    <Section
      id="services"
      copy={copy}
      reveal
      aside={
        <Link href="/services" className="inline-flex h-12 items-center gap-2 self-start text-body-lg font-bold text-text hover:text-primary-text">
          All services
          <Arrow />
        </Link>
      }
      bleed={<ServicesCarousel slides={buildSlides(cards)} />}
    />
  );
}

import { A11Y } from "@/components/ui/a11yStrings";
import Link from "next/link";
import type { SectionCopy, ServiceCard } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { RiveIcon } from "@/components/rive/RiveIcon";
import { toRiveIconId } from "@/components/sections/shared/rive";
import { LineIcon } from "@/components/ui/LineIcon";

/** Spec 2.1.2: all 8 cards (C1–C8), GSAP stagger reveal via data-animate="stagger". */
export function ServicesGrid({
  copy,
  cards,
  linkLabel,
}: {
  copy: SectionCopy;
  cards: ServiceCard[];
  /** CMS/fixture homePage.serviceCardLinkLabel (design .card-service__foot). */
  linkLabel?: string | null;
}) {
  return (
    <Section id="services" copy={copy} section="services">
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-animate="stagger">
        {cards.map((card) => {
          const icon = toRiveIconId(card.riveIcon);
          return (
            <li
              key={card.id}
              data-testid="service-card"
              data-rive-host
              className="group relative flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition-colors duration-fast hover:bg-surface-2"
            >
              {icon ? <RiveIcon id={icon} size={40} /> : null}
              <h3 className="text-h5">
                <Link href={card.href} className="after:absolute after:inset-0">
                  {card.title}
                </Link>
              </h3>
              <p className="text-body-sm text-text-secondary">{card.description}</p>
              {card.externalLink ? (
                <a
                  href={card.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-raised text-body-sm font-semibold text-primary-text underline-offset-4 hover:underline"
                >
                  {card.externalLink.label}
                  <span className="sr-only">{A11Y.opensInNewTab}</span>
                </a>
              ) : null}
              {linkLabel ? (
                // Decorative repeat of the stretched title link (design .card-service__foot); hidden from AT to avoid a duplicate link name.
                <div
                  aria-hidden="true"
                  className="mt-auto flex items-center justify-between pt-2 text-body-sm font-semibold text-text"
                >
                  {linkLabel}
                  <span className="grid size-8 place-items-center rounded-full border border-border transition duration-fast group-hover:-rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <LineIcon name="arrowRight" size={14} />
                  </span>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

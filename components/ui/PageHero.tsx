import Image from "next/image";
import type { ReactNode } from "react";
import type { PageHero as PageHeroData } from "@/lib/sanity/types";
import { SITE_IMAGES, type SiteImageKey } from "@/lib/site-images";
import { cn } from "@/lib/utils/cn";
import { ButtonLink } from "./ButtonLink";

/**
 * Standard inner-page hero. Renders the page's ONE <h1> from the CMS hero.headline.
 * With `photo`, the headline holds seven columns and a captioned photograph of the trade takes the other five;
 * without it the hero stays a compact type-only band (FAQ, policies).
 */
export function PageHero({ hero, photo, children }: { hero: PageHeroData; photo?: SiteImageKey; children?: ReactNode }) {
  const img = photo ? SITE_IMAGES[photo] : null;
  return (
    <section>
      <div className={cn("container-site grid gap-10 pb-14 pt-14 md:pt-20 lg:gap-x-8 lg:pb-20", img && "lg:grid-cols-12 lg:items-end")}>
        <div className={img ? "lg:col-span-7" : undefined}>
          {hero.eyebrow ? <p className="mb-4 text-body-lg font-bold text-primary-text">{hero.eyebrow}</p> : null}
          <h1 className="max-w-[20ch] text-h1" data-animate="split-heading" data-split="words" data-split-trigger="load">
            {hero.headline}
          </h1>
          {hero.subline ? <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">{hero.subline}</p> : null}
          {hero.primaryCta || hero.secondaryCta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.primaryCta ? <ButtonLink cta={hero.primaryCta} size="lg" /> : null}
              {hero.secondaryCta ? <ButtonLink cta={hero.secondaryCta} size="lg" /> : null}
            </div>
          ) : null}
          {children}
        </div>
        {img ? (
          <figure className="lg:col-span-5">
            <div className="photo aspect-[16/10]">
              <Image src={img.src} alt={img.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

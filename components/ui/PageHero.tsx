import type { ReactNode } from "react";
import type { PageHero as PageHeroData } from "@/lib/sanity/types";
import { ButtonLink } from "./ButtonLink";

/** Standard inner-page hero. Renders the page's ONE <h1> from the CMS hero.headline. */
export function PageHero({ hero, children }: { hero: PageHeroData; children?: ReactNode }) {
  return (
    <section className="border-b border-border-subtle pb-16 pt-20 md:pb-20 md:pt-28">
      <div className="container-site">
        {hero.eyebrow ? (
          <p className="mb-4 inline-flex items-center gap-2 text-label font-semibold uppercase text-text-secondary before:size-2 before:rounded-[2px] before:bg-brand before:content-['']">
            {hero.eyebrow}
          </p>
        ) : null}
        <h1
          className="max-w-[18ch] text-h1"
          data-animate="split-heading"
          data-split="words"
          data-split-trigger="load"
        >
          {hero.headline}
        </h1>
        {hero.subline ? (
          <p className="mt-6 max-w-prose text-body-lg text-text-secondary">{hero.subline}</p>
        ) : null}
        {hero.primaryCta || hero.secondaryCta ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {hero.primaryCta ? <ButtonLink cta={hero.primaryCta} size="lg" /> : null}
            {hero.secondaryCta ? <ButtonLink cta={hero.secondaryCta} size="lg" /> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

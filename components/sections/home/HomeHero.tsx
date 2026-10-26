import type { PageHero } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HeroDevice } from "@/components/3d/HeroDevice";

/** Placeholder poster art until Design/Motion ship /hero/phone-poster.{avif,webp,png}. */
const POSTER = { png: "/hero/phone-poster.svg", width: 960, height: 1200 };

/**
 * Spec 2.1.1. H1 + subline + magnetic CTAs (server-rendered text = LCP), 3D device lazily mounted
 * by <HeroDevice> (Motion & 3D lane) over a static poster. Speakable selectors: [data-speakable].
 */
export function HomeHero({ hero }: { hero: PageHero }) {
  return (
    <section
      data-section="hero"
      data-testid="hero"
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="container-site grid min-h-[calc(100svh-120px)] items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <h1
            id="hero-title"
            className="text-display"
            data-speakable
            data-animate="split-heading"
            data-split="words"
            data-split-trigger="load"
          >
            {hero.headline}
          </h1>
          {hero.subline ? (
            <p
              id="hero-subline"
              className="mt-6 max-w-prose text-body-lg text-text-secondary"
              data-speakable
            >
              {hero.subline}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            {hero.primaryCta ? (
              <MagneticButton>
                <ButtonLink cta={hero.primaryCta} size="lg" />
              </MagneticButton>
            ) : null}
            {hero.secondaryCta ? (
              <MagneticButton>
                <ButtonLink cta={hero.secondaryCta} size="lg" />
              </MagneticButton>
            ) : null}
          </div>
        </div>
        <div className="mx-auto w-full max-w-[480px]">
          <HeroDevice poster={POSTER} alt="Illustration of a smartphone with a repair checkmark" />
        </div>
      </div>
    </section>
  );
}

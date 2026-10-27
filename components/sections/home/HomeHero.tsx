import Image from "next/image";
import { Tomorrow } from "next/font/google";
import type { BusinessInfo, PageHero } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { hoursSummary } from "@/components/sections/global/HoursList";
import { cssVars } from "@/lib/utils/css-vars";
import { IMPACT, SHARDS } from "./heroRepairGeometry";
import { TrustBar } from "./TrustBar";

// The wordmark's own face: chamfered, slanted, electric. One weight, loaded only where the hero renders.
const wordmark = Tomorrow({ subsets: ["latin"], weight: "900", style: "italic", display: "swap" });

/** "Cracked screen? Dead battery? We fix it in 45 minutes." → the questions, then the answer. */
function headlineLines(headline: string): { asks: string[]; answer: string | null } {
  const parts = headline.match(/[^?!.]+[?!.]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [headline];
  if (parts.length < 2) return { asks: parts, answer: null };
  return { asks: parts.slice(0, -1), answer: parts[parts.length - 1] };
}

/**
 * Spec 2.1.1. Centre stage: the cracked phone stands in front of a giant solid-red SPEEDY, with the
 * headline, the 45-minute figure, the CTAs and a visit card in the four corners around it.
 * bindHeroRepair (lib/motion/bindings.ts) pins the section and flies every shard back into the impact
 * point while the repaired screen heals outward from it.
 * No-JS / reduced motion: static cracked scene, every link and line of copy visible.
 */
export function HomeHero({ hero, business }: { hero: PageHero; business: BusinessInfo }) {
  const { asks, answer } = headlineLines(hero.headline);
  const impact = { "--ix": `${IMPACT.x * 100}%`, "--iy": `${IMPACT.y * 100}%` };
  const hours = hoursSummary(business);
  const { street, suite, city, state } = business.address;

  return (
    <section
      className="hero-stage relative isolate overflow-hidden bg-bg"
      aria-labelledby="hero-title"
      data-hero-entrance
      data-hero-repair
    >
      <div
        className="container-site relative grid min-h-[calc(100svh-var(--nav-h)-var(--banner-h)-1px)] content-center gap-x-12 gap-y-8 py-10 [grid-template-areas:'copy'_'device'_'actions'_'stat'_'card'] lg:min-h-[calc(100svh-var(--nav-h-desktop)-var(--banner-h)-1px)] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:content-stretch lg:gap-y-6 lg:py-8 lg:[grid-template-areas:'copy_device_stat'_'._device_.'_'actions_device_card']"
      >
        <div className="hero-copy relative z-raised [grid-area:copy] lg:self-start">
          <h1
            id="hero-title"
            className="hero-headline font-heading font-black"
            data-speakable
            data-animate="split-heading"
            data-split="words"
            data-split-trigger="load"
          >
            {asks.map((line) => (
              <span key={line} className="hero-headline-ask block">
                {line}
              </span>
            ))}
            {answer ? <span className="hero-headline-answer mt-3 block">{answer}</span> : null}
          </h1>
          {hero.subline ? (
            <p id="hero-subline" data-hero-subline className="mt-4 max-w-[44ch] text-body text-text" data-speakable>
              {hero.subline}
            </p>
          ) : null}
        </div>

        <div data-hero-device className="hero-device relative mx-auto [grid-area:device] lg:self-center">
          <p aria-hidden className={`hero-word pointer-events-none absolute left-1/2 ${wordmark.className}`}>
            Speedy
          </p>
          <div data-phone-glow aria-hidden className="hero-phone-light pointer-events-none absolute inset-[-35%] opacity-40" />
          <div data-hero-phone className="hero-phone relative" style={cssVars(impact)}>
            <Image
              src="/images/hero/phone-cracked.webp"
              alt="Smartphone with a shattered screen, cracks spreading from an impact near the right edge"
              fill
              priority
              sizes="(min-width: 1024px) 350px, 50vw"
              className="object-contain"
            />
            <Image
              data-phone-fixed
              src="/images/hero/phone-fixed.webp"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 350px, 50vw"
              className="hero-phone-fixed object-contain"
            />
            <div data-phone-flash aria-hidden className="hero-phone-flash pointer-events-none absolute inset-0 opacity-0" />
          </div>
          <p aria-hidden className="hero-status absolute bottom-[14%] left-0 -translate-x-1/2 font-heading text-caption font-bold">
            <span data-status-broken className="hero-status-broken">Cracked glass</span>
            <span data-status-fixed className="hero-status-fixed">Fixed in 45 min</span>
          </p>
        </div>

        <p data-hero-fade className="relative z-raised [grid-area:stat] lg:self-start lg:text-right" aria-label="Most repairs done in 45 minutes">
          <span aria-hidden className="hero-stat-figure block font-heading font-black tabular-nums text-text">
            <span data-counter={45}>45</span>
            <span className="hero-stat-unit">min</span>
          </span>
          <span aria-hidden className="mt-2 block font-heading text-body-sm font-bold text-text-secondary">
            Most repairs, while you wait
          </span>
        </p>

        {/* One row where the column allows, wrapping to a stack where it doesn't. */}
        <div data-hero-ctas className="hero-ctas relative z-raised grid w-full gap-3 [grid-area:actions] sm:flex sm:flex-wrap lg:self-end">
          {hero.primaryCta ? (
            <MagneticButton>
              <ButtonLink cta={hero.primaryCta} size="lg" className="w-full px-7" />
            </MagneticButton>
          ) : null}
          {hero.secondaryCta ? (
            <MagneticButton>
              <ButtonLink cta={hero.secondaryCta} size="lg" className="w-full border-transparent bg-surface-3 px-7 hover:border-transparent hover:bg-border-strong active:bg-border-strong" />
            </MagneticButton>
          ) : null}
        </div>

        <aside
          data-hero-fade
          aria-labelledby="hero-visit-heading"
          className="relative z-raised w-full max-w-[24rem] [grid-area:card] lg:self-end lg:justify-self-end"
        >
          <h2 id="hero-visit-heading" className="font-sans text-body-sm font-semibold text-text-secondary">
            Walk in or book online
          </h2>
          {hours ? <p className="mt-1 font-heading text-body font-bold text-text">{hours}</p> : null}
          <p className="mb-3 mt-1 flex flex-wrap items-baseline justify-between gap-x-4 text-body-sm text-text-secondary">
            <span>
              {street} {suite}, {city}, {state}
            </span>
            <a href={business.externalLinks.maps} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-text underline-offset-4 hover:underline">
              Directions
            </a>
          </p>
          <TrustBar />
        </aside>
      </div>

      <div data-shard-layer aria-hidden className="pointer-events-none absolute inset-0 z-raised">
        {SHARDS.map((s, i) => (
          <div
            key={i}
            data-shard
            data-tx={s.tx}
            data-ty={s.ty}
            className={`hero-shard hero-shard-${s.depth}${s.mobile ? "" : " hidden md:block"}`}
            style={cssVars({ "--sx": s.x, "--sy": s.y, "--sw": String(s.w), "--sr": `${s.rot}deg`, "--sd": `${-i * 1.3}s` })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative cutouts (≤70KB each), never the LCP */}
            <img src={`/images/hero/shard-${s.img}.webp`} alt="" fetchPriority="low" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
    </section>
  );
}

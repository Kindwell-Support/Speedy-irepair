import Image from "next/image";
import Link from "next/link";
import { Tomorrow } from "next/font/google";
import type { PageHero } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { cssVars } from "@/lib/utils/css-vars";
import { IMPACT, SHARDS } from "./heroRepairGeometry";

// The wordmark's own face: chamfered, slanted, electric. One weight, loaded only where the hero renders.
const wordmark = Tomorrow({ subsets: ["latin"], weight: "900", style: "italic", display: "swap" });

/** The repairs listed down the right edge, each a jump to its service. */
const REPAIRS = [
  { label: "Screen", href: "/services#screen-repair" },
  { label: "Battery", href: "/services#battery-replacement" },
  { label: "Charging port", href: "/services#charger-port-repair" },
  { label: "Camera", href: "/services#camera-repair" },
  { label: "Water damage", href: "/services#water-damage-inspection" },
];

/** "Cracked screen? Dead battery? We fix it in 45 minutes." → the questions, then the answer. */
function headlineLines(headline: string): { asks: string[]; answer: string | null } {
  const parts = headline.match(/[^?!.]+[?!.]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [headline];
  if (parts.length < 2) return { asks: parts, answer: null };
  return { asks: parts.slice(0, -1), answer: parts[parts.length - 1] };
}

/**
 * Spec 2.1.1. One object on a quiet stage: the cracked phone, shot at three-quarters, stands in front of a giant
 * red SPEEDY. The headline holds the top-left, the CTAs the middle-left, the 45-minute line the bottom-left and
 * the repair list the right edge, centred on the stage. Ratings and open hours sit in HeroProof, just below.
 * Laid out on container-wide, the header's frame, so the left column and the repair list meet the nav's edges.
 * Height is one screen minus the header only (not the banner): the pin starts after the banner has scrolled
 * away, so the pinned stage fills the viewport with no strip below it.
 * bindHeroRepair (lib/motion/bindings.ts) pins the section and flies every shard back into the impact
 * point while the repaired screen heals outward from it.
 * No-JS / reduced motion: static cracked scene, every link and line of copy visible.
 */
export function HomeHero({ hero }: { hero: PageHero }) {
  const { asks, answer } = headlineLines(hero.headline);
  const impact = { "--ix": `${IMPACT.x * 100}%`, "--iy": `${IMPACT.y * 100}%` };

  return (
    <section
      className="hero-stage relative isolate overflow-hidden bg-bg"
      aria-labelledby="hero-title"
      data-hero-entrance
      data-hero-repair
    >
      <div
        className="container-wide relative grid min-h-[calc(100svh-var(--nav-h)-1px)] content-center gap-y-8 py-10 lg:min-h-[calc(100svh-var(--nav-h-desktop)-1px)] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:content-stretch lg:gap-x-8 lg:gap-y-6 lg:py-10"
      >
        <div className="hero-copy relative z-raised lg:col-[1/6] lg:row-[1] lg:self-start">
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
            {answer ? <span className="hero-headline-answer mt-4 block">{answer}</span> : null}
          </h1>
        </div>

        <div data-hero-device className="hero-device relative mx-auto lg:col-[4/10] lg:row-[1/4] lg:self-center">
          <p aria-hidden className={`hero-word pointer-events-none absolute left-1/2 ${wordmark.className}`}>
            Speedy
          </p>
          <div data-phone-glow aria-hidden className="hero-phone-light pointer-events-none absolute inset-[-35%] opacity-40" />
          <div aria-hidden className="hero-phone-shadow pointer-events-none absolute" />
          <div className="hero-phone-float relative">
            <div data-hero-phone className="hero-phone relative" style={cssVars(impact)}>
              <Image
                src="/images/hero/phone-tilt-cracked.webp"
                alt="Smartphone with a shattered screen, cracks spreading from an impact near the right edge"
                fill
                priority
                sizes="(min-width: 1024px) 320px, 50vw"
                className="object-contain"
              />
              <Image
                data-phone-fixed
                src="/images/hero/phone-tilt-fixed.webp"
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 320px, 50vw"
                className="hero-phone-fixed object-contain"
              />
              <div data-phone-flash aria-hidden className="hero-phone-flash pointer-events-none absolute inset-0 opacity-0" />
            </div>
          </div>
        </div>

        {/* Always a stack: one column as wide as the button, flush with the headline's left edge, with the link
            centred under it so the two labels share a centre line. */}
        <div data-hero-ctas className="hero-ctas relative z-raised flex flex-col items-stretch gap-5 sm:w-fit lg:col-[1/6] lg:row-[2] lg:self-center">
          {hero.primaryCta ? (
            <MagneticButton className="w-full">
              <ButtonLink cta={hero.primaryCta} size="lg" className="w-full px-7" />
            </MagneticButton>
          ) : null}
          {hero.secondaryCta ? (
            <ButtonLink cta={{ ...hero.secondaryCta, variant: "link" }} size="lg" className="self-center font-heading uppercase tracking-[0.06em] text-text" />
          ) : null}
        </div>

        <nav data-hero-fade aria-label="Repairs" className="hero-repairs relative z-raised hidden lg:col-[10/13] lg:row-[1/4] lg:block lg:self-center lg:justify-self-end">
          <ul className="grid justify-items-end gap-6 text-right">
            {REPAIRS.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="hero-repair font-heading text-body-sm font-bold uppercase tracking-[0.08em] whitespace-nowrap">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p data-hero-fade className="relative z-raised lg:col-[1/5] lg:row-[3] lg:self-end" aria-label="Most repairs done in 45 minutes, while you wait">
          <span aria-hidden className="block font-heading text-h4 font-black uppercase text-text">
            Fixed in <span data-counter={45}>45</span> min
          </span>
          <span aria-hidden className="mt-2 block max-w-[30ch] text-body-sm font-semibold uppercase tracking-[0.06em] text-text-secondary">
            Most repairs, while you wait
          </span>
        </p>
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

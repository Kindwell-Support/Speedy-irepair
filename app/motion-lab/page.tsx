import { HeroDevice } from "@/components/3d/HeroDevice";
import { Accordion } from "@/components/motion/Accordion";
import { BrandMarquee } from "@/components/motion/BrandMarquee";
import { HoverCard } from "@/components/motion/HoverCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { ValueProps } from "@/components/motion/ValueProps";
import { RiveIcon } from "@/components/rive/RiveIcon";
import { BRANDS, FAQS, SERVICES, STEPS, VALUE_PROPS } from "./_data";

const btn = "inline-flex h-control-lg items-center gap-2 rounded-md px-6 font-semibold";

export default function MotionLabHome() {
  return (
    <>
      {/* 1 HERO */}
      <section data-testid="hero" aria-labelledby="hero-h" className="border-b border-border-subtle">
        <div className="container-site grid items-center gap-12 py-16 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-label uppercase text-text-secondary">Akron, Ohio · Walk-ins welcome</p>
            <h1 id="hero-h" className="text-display" data-split="words" data-split-trigger="load">
              Cracked screen? Dead battery? We fix it in 45 minutes.
            </h1>
            <p className="text-body-lg text-text-secondary" data-animate="reveal" data-reveal-trigger="load" data-reveal-delay="0.35">
              Akron&apos;s trusted phone repair shop. Walk in or book online.
            </p>
            <div className="flex flex-wrap gap-4" data-animate="reveal" data-reveal="children" data-reveal-trigger="load" data-reveal-delay="0.45">
              <MagneticButton>
                <a className={`${btn} bg-primary text-text hover:bg-primary-hover`} href="#how">Schedule Repair</a>
              </MagneticButton>
              <MagneticButton>
                <a className={`${btn} border border-border-strong text-text`} href="#faq">Get Instant Quote</a>
              </MagneticButton>
            </div>
          </div>
          <HeroDevice className="mx-auto max-w-[480px]" />
        </div>
      </section>

      {/* 2 SERVICES */}
      <section id="services" aria-labelledby="svc-h" className="py-section">
        <div className="container-site flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <p className="text-label uppercase text-brand">
              <ScrambleText text="Services" />
            </p>
            <h2 id="svc-h" className="text-h2" data-split="lines">Everything your phone needs, under one roof.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
            {SERVICES.map((s) => (
              <div key={s.id}>
              <HoverCard href="#services" className="h-full rounded-lg border border-border bg-surface p-6">
                <article data-card={s.id} data-rive={s.rive} className="flex flex-col gap-4">
                  <span className="text-text">
                    <RiveIcon id={s.rive} size={40} />
                  </span>
                  <h3 className="text-h5">{s.title}</h3>
                  <p className="text-body-sm text-text-secondary">{s.desc}</p>
                </article>
              </HoverCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 HOW IT WORKS (pinned) */}
      <section id="how" aria-labelledby="how-h" data-pin="how" className="border-y border-border-subtle bg-bg-raised py-section">
        <div className="container-site flex min-h-[80vh] flex-col justify-center gap-12">
          <h2 id="how-h" className="text-h2">Four steps. Most repairs in 45 minutes.</h2>
          <div className="flex items-center gap-4 text-caption text-text-tertiary" aria-hidden>
            <span>01</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
              <div className="progress__fill h-full w-full bg-brand" />
            </div>
            <span>04</span>
          </div>
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} data-step={s.n} className="step flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 [&.is-active]:border-brand">
                <span className="text-h3 font-bold text-brand">{s.n}</span>
                <h3 className="text-h4">{s.title}</h3>
                <p className="text-body-sm text-text-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 BRANDS marquee */}
      <section aria-labelledby="brands-h" className="border-b border-border-subtle py-16">
        <h2 id="brands-h" className="mb-8 text-center text-label uppercase text-text-secondary">Brands we repair</h2>
        <BrandMarquee
          brands={BRANDS.map((b) => ({ name: b, logo: <span className="text-h4 font-bold">{b}</span> }))}
        />
      </section>

      {/* 5 WHY */}
      <section id="why" aria-labelledby="why-h" className="py-section">
        <div className="container-site flex flex-col gap-12">
          <h2 id="why-h" className="text-h2" data-split="words">Fast, warrantied and honest.</h2>
          <ValueProps items={VALUE_PROPS} className="grid gap-4 md:grid-cols-3" itemClassName="rounded-lg border border-border p-6" />
        </div>
      </section>

      {/* 6 PARALLAX band */}
      <section aria-label="Shop interior" className="relative h-[420px] overflow-hidden border-y border-border-subtle">
        <div data-parallax="10" className="absolute inset-[-12%_0] bg-[radial-gradient(60%_60%_at_50%_40%,var(--color-primary-glow),transparent_70%),repeating-linear-gradient(90deg,var(--color-border-subtle)_0_1px,transparent_1px_80px)]" />
        <p className="relative z-raised flex h-full items-center justify-center text-h3" data-animate="reveal">1650 W Market St, Akron</p>
      </section>

      {/* 8 FAQ (Framer engine) */}
      <section id="faq" aria-labelledby="faq-h" className="py-section">
        <div className="container-site flex max-w-prose flex-col gap-8">
          <h2 id="faq-h" className="text-h2" data-split="words">Questions, answered.</h2>
          <Accordion
            engine="framer"
            defaultOpen={[0]}
            items={FAQS.map((f) => ({ question: f.q, answer: <p className="pb-4 text-text-secondary">{f.a}</p> }))}
            itemClassName="border-b border-border"
            buttonClassName="flex w-full items-center justify-between gap-4 py-4 text-left text-h6"
          />
        </div>
      </section>
      <div className="h-[40vh]" />
    </>
  );
}

import Image from "next/image";
import type { HowItWorksStep, SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { SITE_IMAGES, type SiteImage } from "@/lib/site-images";
import { cn } from "@/lib/utils/cn";

/** Photo behind each step, by step id. */
const STEP_PHOTOS: Record<string, SiteImage> = {
  "home-1": SITE_IMAGES.devices,
  "home-2": SITE_IMAGES.storeCounter,
  "home-3": SITE_IMAGES.screenLift,
  "home-4": SITE_IMAGES.storeFront,
  "sell-1": SITE_IMAGES.devices,
  "sell-2": SITE_IMAGES.storeCounter,
};

/** Steps set in the shop: the real store photo wins over the older image held in the CMS. */
const SHOP_STEPS = ["home-2", "home-4", "sell-2"];

/** The extra that makes a step concrete: a repair timer scrubbed by scroll, or the warranty ticket. */
function StepExtra({ id }: { id: string }) {
  if (id === "home-3")
    return (
      <div className="flex items-baseline gap-3">
        <span data-step-timer className="font-heading text-h2 font-black tabular-nums leading-none">
          45:00
        </span>
        <span data-step-timer-label className="text-body-sm font-bold uppercase tracking-wide text-text-secondary">
          Repair timer
        </span>
      </div>
    );
  if (id === "home-4")
    return (
      <div className="flex w-fit items-stretch overflow-hidden rounded-md bg-surface-2">
        <span className="flex flex-col items-center justify-center bg-primary px-4 py-3 font-heading font-black leading-none">
          <span className="text-h3">90</span>
          <span className="mt-1 text-caption tracking-wide">DAYS</span>
        </span>
        <span className="flex flex-col justify-center gap-1 whitespace-nowrap px-4 py-3 leading-tight">
          <span className="text-body font-bold">Every repair covered</span>
          <span className="text-body-sm text-text-secondary">From the day you pick up</span>
        </span>
      </div>
    );
  return null;
}

/**
 * Spec 2.1.3 showpiece / PinnedSteps hook: data-pin="how" + [data-step] + [data-steps-progress].
 * Behaviour (pin on >=768px, stacked reveal on mobile, none under reduced motion) is bound by
 * lib/motion/bindings.ts. While pinned on desktop the active card widens and shows its photo and detail;
 * the others fold down to number and title (motion.css). The heading sits inside the pinned block so it stays
 * on screen. Markup stays a plain ordered list without JS, every card open; the progress rail only appears
 * once motion is running, so the static page never shows a bar that is already "full".
 */
export function HowItWorks({ copy, steps, id = "how-it-works" }: { copy: SectionCopy; steps: HowItWorksStep[]; id?: string }) {
  const headingId = `${id}-heading`;
  return (
    <Section id={id} labelledBy={headingId} tone="raised">
      <div data-pin="how">
        <div data-steps-pin>
          <header className="mb-8 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-x-8">
            <h2 id={headingId} className="text-h2 lg:col-span-7">
              {copy.heading}
            </h2>
            {copy.intro ? (
              <p className="max-w-[52ch] text-body-lg text-text-secondary lg:col-span-4 lg:col-start-9">
                <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
              </p>
            ) : null}
          </header>
          <div className="mb-6 hidden h-1 overflow-hidden rounded-full bg-surface-3 [html[data-motion=ok]_&]:block" aria-hidden>
            <div data-steps-progress className="h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
          <ol className={cn("grid gap-4 lg:flex", steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
            {steps.map((s, i) => {
              const photo = SHOP_STEPS.includes(s.id) ? STEP_PHOTOS[s.id] : (s.image ?? STEP_PHOTOS[s.id]);
              return (
                <li
                  key={s.id}
                  data-step
                  className="relative isolate flex min-h-[220px] flex-col justify-between gap-10 overflow-hidden rounded-md bg-bg p-6 lg:h-[clamp(320px,calc(100svh_-_400px),420px)] lg:min-h-0 lg:min-w-0 lg:flex-[1_1_0%] lg:p-8"
                >
                  {photo ? (
                    <div data-step-photo className="photo-shade absolute inset-0 -z-10" aria-hidden>
                      <Image src={photo.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <span data-step-number className="relative font-heading text-h1 font-black leading-none tabular-nums text-text-tertiary">
                      {i + 1}
                      <span data-step-number-fill aria-hidden className="absolute inset-0 text-brand">
                        {i + 1}
                      </span>
                    </span>
                    <span data-step-tick aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7.5l2.5 2.5L11 4.5" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-h4">{s.title}</h3>
                    <div data-step-reveal>
                      <div className="min-h-0 overflow-hidden">
                        <div data-step-copy className="max-w-[34ch]">
                          {/* The warranty ticket already says what step 4's body does, so it stands alone. */}
                          {s.body && s.id !== "home-4" ? (
                            <p className="mt-2 text-body text-text">
                              <PlaceholderMark show={s.isPlaceholder}>{s.body}</PlaceholderMark>
                            </p>
                          ) : null}
                          {s.id === "home-3" || s.id === "home-4" ? (
                            <div className={s.id === "home-4" ? "mt-4" : "mt-5"}>
                              <StepExtra id={s.id} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Section>
  );
}

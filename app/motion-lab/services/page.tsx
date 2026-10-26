import { RiveIcon } from "@/components/rive/RiveIcon";
import { HoverCard } from "@/components/motion/HoverCard";
import { RIVE_ICONS, SERVICES_ICON_ORDER } from "@/components/rive/manifest";

/** /services (spec 2.2): 14 sections S01–S14, each scrolls in (REQ-048). */
export default function MotionLabServices() {
  return (
    <>
      <section className="border-b border-border-subtle py-section">
        <div className="container-site flex flex-col gap-4">
          <h1 className="text-h1" data-split="words" data-split-trigger="load">Our services</h1>
          <p className="max-w-prose text-body-lg text-text-secondary" data-animate="reveal" data-reveal-trigger="load" data-reveal-delay="0.25">
            Repairs, devices, plans, bills and internet. Fourteen services, one counter.
          </p>
        </div>
      </section>
      {SERVICES_ICON_ORDER.map((id, i) => (
        <section key={id} id={id} aria-labelledby={`${id}-h`} className="border-b border-border-subtle py-20">
          <div className="container-site grid items-center gap-8 md:grid-cols-[1fr_2fr]" data-animate="reveal" data-reveal="children">
            <HoverCard className="grid aspect-square max-w-[240px] place-items-center rounded-xl border border-border bg-surface text-text">
              <RiveIcon id={id} size={96} />
            </HoverCard>
            <div className="flex flex-col gap-4">
              <p className="text-label uppercase text-brand">S{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${id}-h`} className="text-h2">{RIVE_ICONS[id].label}</h2>
              <p className="max-w-prose text-text-secondary">
                Placeholder service copy for the motion harness. Real copy comes from Sanity (lib/sanity/content.ts).
              </p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

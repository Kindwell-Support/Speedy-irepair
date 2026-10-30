import type { Metadata } from "next";
import { getSchedulePage, getSiteSettings } from "@/lib/sanity/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { telHref } from "@/lib/utils/format";
import { PageHero } from "@/components/ui/PageHero";
import { HoursList } from "@/components/sections/global/HoursList";
import { RepairIntake } from "@/components/repair-intake/RepairIntake";

export const metadata: Metadata = buildMetadata({
  path: "/repair",
  fallback: {
    metaTitle: "Book a Phone, Tablet or Laptop Repair in Akron, OH | Speedy iRepair",
    metaDescription:
      "Book your repair online in under a minute: pick your device and issue, choose a time, and we'll have it fixed while you wait at 1650 W Market St, Akron.",
  },
});

/**
 * /repair: the interactive intake. Device → brand → model → issue → contact → time → confirmation.
 * Business details and "what to bring" come from the CMS (the schedulePage document), so the confirmation
 * never disagrees with the footer.
 */
export default async function RepairPage() {
  const [settings, schedule] = await Promise.all([getSiteSettings(), getSchedulePage()]);
  const b = settings.business;
  return (
    <>
      <PageHero hero={{ eyebrow: "Book a repair", headline: "Get it fixed today", subline: "Tell us what's broken, pick a time, walk in. Most repairs take 45 minutes." }} />
      <section aria-label="Book a repair" className="py-16 md:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="rounded-md border border-border bg-surface p-6 md:p-10 lg:col-span-8">
            <RepairIntake
              shop={{ name: b.name, address: b.footerAddressLine, phone: b.phone }}
              whatToBring={{ heading: schedule.whatToBring.heading, intro: schedule.whatToBring.intro }}
            />
          </div>

          <aside aria-label="Visit the shop" className="flex flex-col gap-8 lg:col-span-3 lg:col-start-10">
            <div>
              <h2 className="font-sans text-h5 font-bold">Rather call?</h2>
              <a href={telHref(b.phone)} className="mt-2 inline-flex min-h-12 items-center font-heading text-h4 font-black tabular-nums hover:text-primary-text">
                {b.phone}
              </a>
            </div>
            <div className="border-t border-border pt-8">
              <h2 className="font-sans text-h5 font-bold">The shop</h2>
              <address className="mt-2 not-italic text-body text-text-secondary">{b.footerAddressLine}</address>
              <div className="mt-4">
                <HoursList business={b} compact />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

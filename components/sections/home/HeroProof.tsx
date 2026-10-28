import type { BusinessInfo } from "@/lib/sanity/types";
import { OpenStatus } from "@/components/sections/shared/OpenStatus";
import { TrustBar } from "./TrustBar";

/**
 * Directly under the hero: ratings, reviews and warranty on a brand-red panel half the hero's width (full
 * container width below lg), centred under the phone, with the live open/closed line beneath a hairline.
 */
export function HeroProof({ business }: { business: BusinessInfo }) {
  return (
    <section aria-label="Ratings, reviews and opening hours" className="bg-bg">
      <div className="container-wide">
        <div data-animate="reveal" className="mx-auto rounded-md bg-primary px-6 py-7 sm:px-8 lg:w-1/2">
          <TrustBar />
          <OpenStatus business={business} className="mt-6 justify-center border-t border-black/20 pt-5 text-center text-body-sm text-text" />
        </div>
      </div>
    </section>
  );
}

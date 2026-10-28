import type { Brand, SectionCopy } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";
import { BRAND_LOGOS } from "./brand-logos";

function BrandTile({ brand }: { brand: Brand }) {
  const logo = BRAND_LOGOS[brand.id];
  return (
    <li className="flex h-24 w-[13.5rem] shrink-0 items-center justify-center gap-3 rounded-md bg-surface px-6 text-text-secondary transition-colors duration-200 hover:bg-surface-3 hover:text-text md:h-28 md:w-[15.5rem]">
      {logo ? (
        <svg
          aria-hidden="true"
          viewBox={logo.viewBox}
          fill="currentColor"
          className={cn("shrink-0", logo.wordmark ? cn("w-auto", logo.size) : "h-8 w-8 md:h-9 md:w-9")}
        >
          <path d={logo.d} />
        </svg>
      ) : null}
      <span className={cn("font-heading text-h4 font-bold leading-none whitespace-nowrap", logo?.wordmark && "sr-only")}>{brand.name}</span>
    </li>
  );
}

/** One row of the marquee: the set twice, so translating the track by half loops without a seam. */
function MarqueeRow({ brands, reverse, label }: { brands: Brand[]; reverse?: boolean; label?: string }) {
  return (
    <div className="brand-marquee-track" data-reverse={reverse ? "" : undefined}>
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className="m-0 flex list-none gap-2 p-0 pr-2"
          aria-label={copy === 0 ? label : undefined}
          aria-hidden={copy === 0 && label ? undefined : true}
        >
          {brands.map((b) => (
            <BrandTile key={b.id} brand={b} />
          ))}
        </ul>
      ))}
    </div>
  );
}

/**
 * Spec 2.1.4. A compact band between the two heavy sections: the heading on the left, the makes' logos drifting
 * past on the right in two rows that run in opposite directions. Still under reduced motion.
 */
export function Brands({ copy, brands }: { copy: SectionCopy; brands: Brand[] }) {
  return (
    <section id="brands" aria-labelledby="brands-heading" className="py-14 md:py-20">
      <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <h2 id="brands-heading" className="text-h3 font-bold lg:col-span-3">
          {copy.heading}
        </h2>
        <div className="brand-marquee grid gap-2 lg:col-span-9">
          <MarqueeRow brands={brands} label={copy.heading} />
          <MarqueeRow brands={[...brands].reverse()} reverse />
        </div>
      </div>
    </section>
  );
}

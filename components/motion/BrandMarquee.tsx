"use client";
/**
 * A7 — Infinite brand marquee (React Bits <LogoLoop>) + A4 BrandLogo hover colorize.
 * Brands (spec 2.1.4): Apple, Samsung, LG, Google Pixel, Motorola, OnePlus.
 * Reduced motion: LogoLoop's own reduced-motion check holds speed at 0; we additionally
 * render a static, wrapped row (no loop clones) so nothing moves.
 */
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { BrandLogo } from "./BrandLogo";
import { useReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Below the fold: LogoLoop (~9 KB gz) is code-split out of first-load JS. Still server-rendered
 * (next/dynamic default ssr), so the brand names stay in the HTML for SEO and the SSR markup is
 * kept until the chunk hydrates.
 */
const LogoLoop = dynamic(() => import("./reactbits/LogoLoop"), {
  // Client-side navigations only (SSR/hydration keep the server markup): reserve the 32px row.
  loading: () => <div className="h-8" aria-hidden />,
});

export type Brand = { name: string; logo: ReactNode; href?: string };

type Props = { brands: Brand[]; speed?: number; logoHeight?: number; gap?: number; className?: string };

export function BrandMarquee({ brands, speed = 60, logoHeight = 32, gap = 64, className }: Props) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      // Same landmark as the loop (LogoLoop renders role="region" aria-label): the Frontend's
      // Brands section relies on it (landmark={false}, axe landmark-unique BUG-031).
      <div role="region" aria-label="Brands we repair" className={className} data-marquee="static">
        <ul className="m-0 flex list-none flex-wrap justify-center gap-x-12 gap-y-6 p-0">
          {brands.map((b) => (
            <li key={b.name}>
              <BrandLogo name={b.name} height={logoHeight}>{b.logo}</BrandLogo>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className={className} data-marquee="loop">
      <LogoLoop
        logos={brands.map((b) => ({ node: b.logo, title: b.name, ariaLabel: b.name, href: b.href }))}
        speed={speed}
        direction="left"
        logoHeight={logoHeight}
        gap={gap}
        pauseOnHover
        fadeOut
        fadeOutColor="#0a0a0a"
        intro={false}
        ariaLabel="Brands we repair"
        renderItem={(item) => (
          <BrandLogo name={"title" in item && item.title ? item.title : ""} height={logoHeight}>
            {"node" in item ? item.node : null}
          </BrandLogo>
        )}
      />
    </div>
  );
}

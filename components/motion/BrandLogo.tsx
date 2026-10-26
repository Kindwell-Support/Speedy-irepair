"use client";
/**
 * A4 — Brand logo grayscale -> color on hover (REQ-028).
 * Compositor-friendly: two stacked layers (grayscale + color) cross-fade by OPACITY
 * instead of animating `filter`. 0.2s. Reduced motion: instant swap.
 */
import { m } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";
import { cssVars } from "@/lib/utils/css-vars";

type Props = { name: string; children: ReactNode; className?: string; height?: number };

export function BrandLogo({ name, children, className, height = 32 }: Props) {
  const reduced = useReducedMotion();
  const t = { duration: reduced ? 0 : DUR.micro };
  return (
    <m.span
      role="img"
      aria-label={name}
      className={cn("relative inline-grid items-center [height:var(--logo-h)]", className)}
      initial="rest"
      animate="rest"
      whileHover="hover"
      data-brand-logo
      style={cssVars({ "--logo-h": `${height}px` })}
    >
      <m.span
        aria-hidden
        initial={false}
        variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
        transition={t}
        className="inline-flex h-full text-text-secondary grayscale [grid-area:1/1]"
      >
        {children}
      </m.span>
      <m.span
        aria-hidden
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={t}
        className="inline-flex h-full [grid-area:1/1]"
      >
        {children}
      </m.span>
    </m.span>
  );
}

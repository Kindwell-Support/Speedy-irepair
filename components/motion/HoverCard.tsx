"use client";
/**
 * A4 — Card hover state: 4px lift + red glow layer fade (transform/opacity only, 0.2s).
 * Marks itself as data-rive-host so a RiveIcon inside receives hover/click inputs.
 * Reduced motion: no lift (MotionConfig), glow still indicates focus/hover (opacity, instant).
 */
import { m } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Render as an <a> when href is given (whole card clickable). */
  href?: string;
  lift?: number;
  ariaLabel?: string;
};

export function HoverCard({ children, className, href, lift = 4, ariaLabel }: Props) {
  const reduced = useReducedMotion();
  const Comp = href ? m.a : m.div;
  return (
    <Comp
      href={href}
      aria-label={ariaLabel}
      className={cn("relative isolate block", className)}
      data-rive-host
      data-hover-card
      data-motion-el
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: { y: 0 }, hover: { y: reduced ? 0 : -lift } }}
      transition={{ duration: DUR.micro, ease: FM_EASE.outSoft }}
    >
      <m.span
        aria-hidden
        data-hover-glow
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: reduced ? 0 : DUR.micro }}
        className="pointer-events-none absolute inset-[-1px] -z-10 rounded-[inherit] shadow-[0_0_0_1px_var(--color-primary-glow),0_12px_40px_-12px_var(--color-primary-glow)]"
      />
      {children}
    </Comp>
  );
}

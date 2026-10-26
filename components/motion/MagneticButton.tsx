"use client";
/**
 * A7 — Magnetic CTA (React Bits <Magnet>). Snappy spring, max 10px pull.
 * Off for touch / coarse pointers and under reduced motion (renders children only).
 * Purpose: "what to look at" — the two hero CTAs.
 */
import { lazy, Suspense, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useFinePointer, useReducedMotion } from "@/lib/motion/reduced-motion";

/** Code-split: only fetched for fine-pointer, motion-OK visitors (SSR and touch render the plain wrapper). */
const Magnet = lazy(() => import("./reactbits/Magnet"));

type Props = { children: ReactNode; className?: string; strength?: number; padding?: number };

export function MagneticButton({ children, className, strength = 3, padding = 60 }: Props) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const plain = <span className={cn("inline-block", className)}>{children}</span>;
  if (reduced || !fine) return plain;
  return (
    <Suspense fallback={plain}>
      <Magnet
        wrapperClassName={className}
        padding={padding}
        magnetStrength={strength}
        maxOffset={10}
        spring={{ stiffness: 320, damping: 24, mass: 1 }}
      >
        {children}
      </Magnet>
    </Suspense>
  );
}

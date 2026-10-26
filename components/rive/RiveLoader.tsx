"use client";
/**
 * A6 — Loading indicator. Design rule (design/components.css): loading = skeleton shimmer,
 * never a spinner. Rive if /rive/loader.riv exists (state machine "loader"), else a
 * code-driven shimmer bar: a highlight sweeps across (transform only, 1.1s loop).
 * Reduced motion: static bar. role=status + visually-hidden label always present.
 */
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { RIVE_LOADER_SRC } from "./manifest";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { cn } from "@/lib/utils/cn";

const RiveCanvas = dynamic(() => import("./RiveCanvas"), { ssr: false });

type Props = { label?: string; className?: string; /** rive artboard size (px) */ size?: number };

export function RiveLoader({ label = "Loading", className, size = 24 }: Props) {
  const reduced = useReducedMotion();
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center", className)} data-rive-loader>
      <span className="sr-only">{label}</span>
      {RIVE_LOADER_SRC && !reduced ? (
        <RiveCanvas src={RIVE_LOADER_SRC} stateMachine="loader" size={size} />
      ) : (
        <ShimmerBar reduced={reduced} />
      )}
    </span>
  );
}

export function ShimmerBar({ reduced, className }: { reduced: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative block h-2 w-16 overflow-hidden rounded-full bg-surface-3", className)}>
      {!reduced && (
        <motion.span
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        />
      )}
    </span>
  );
}

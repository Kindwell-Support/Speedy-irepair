"use client";
/**
 * A6 — Button micro-interaction (form submit / CTA). State is controlled by the Frontend
 * (it owns submit logic): idle -> loading -> success | error.
 *  - press: scale 0.97 (0.2s)
 *  - loading: label stays (no width jump), skeleton shimmer sweeps across the button
 *    (Design rule: never a spinner), aria-busy
 *  - success / error: label cross-slides 6px (0.2s); success shows a check
 * Reduced motion: no scale, no shimmer sweep, instant swaps.
 * Styling comes from the caller's className (e.g. Design's `btn btn--primary`).
 */
import { AnimatePresence, m, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

export type ButtonState = "idle" | "loading" | "success" | "error";

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  state?: ButtonState;
  children: ReactNode;
  successLabel?: ReactNode;
  errorLabel?: ReactNode;
};

export function RiveButton({ state = "idle", children, successLabel = "Sent", errorLabel = "Try again", className, disabled, ...rest }: Props) {
  const reduced = useReducedMotion();
  const t = { duration: reduced ? 0 : DUR.micro, ease: FM_EASE.outSoft };
  const content =
    state === "success" ? (
      <>
        <Check />
        {successLabel}
      </>
    ) : state === "error" ? (
      errorLabel
    ) : (
      children
    );
  return (
    <m.button
      {...rest}
      className={cn("relative overflow-hidden", state === "loading" && "is-loading", className)}
      disabled={disabled || state === "loading"}
      aria-busy={state === "loading"}
      data-state={state}
      data-motion-el
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={t}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={state === "loading" ? "idle" : state}
          initial={{ opacity: 0, y: reduced ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -6 }}
          transition={t}
          className="inline-flex items-center gap-2"
        >
          {content}
        </m.span>
      </AnimatePresence>
      {state === "loading" && (
        <>
          <span className="sr-only" role="status">
            Submitting
          </span>
          {!reduced && (
            <m.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
            />
          )}
        </>
      )}
    </m.button>
  );
}

function Check() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

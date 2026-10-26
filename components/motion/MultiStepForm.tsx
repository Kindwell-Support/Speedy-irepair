"use client";
/**
 * A4 — Multi-step form SHELL for /instant-quote and /sell-your-device.
 * Animation + step state only. It does NOT own fields, validation, or submission:
 * the Frontend passes each step's content and decides when `next()` is allowed.
 * LEAD CAPTURE ONLY — no prices are rendered by this component (DECISIONS #5).
 *
 * Transitions (design/pages/instant-quote.responsive-and-motion.md "Step change"), direction-aware:
 *  - outgoing step slides 24px toward the travel direction and fades out (160ms, ease-in-out);
 *  - incoming step slides in from the opposite side (240ms, power3-out). Transform + opacity only.
 *  - progress bar = scaleX tween (0.3s), never width.
 * Focus moves to the new step's heading for screen readers / keyboard users.
 * Reduced motion: instant swap, progress bar jumps (no transform, no fade).
 * DOM hooks: [data-multistep][data-direction="forward|back"], step wrapper [data-step-id].
 */
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

export type FormStep = { id: string; title: string; content: ReactNode };

export function useMultiStep(total: number, initial = 0) {
  const [state, setState] = useState({ index: initial, direction: 1 as 1 | -1 });
  const goTo = useCallback(
    (i: number) =>
      setState((s) => ({ index: Math.max(0, Math.min(total - 1, i)), direction: i >= s.index ? 1 : -1 })),
    [total],
  );
  const next = useCallback(() => setState((s) => ({ index: Math.min(total - 1, s.index + 1), direction: 1 })), [total]);
  const back = useCallback(() => setState((s) => ({ index: Math.max(0, s.index - 1), direction: -1 })), []);
  return { ...state, total, next, back, goTo, isFirst: state.index === 0, isLast: state.index === total - 1 };
}

type Props = {
  steps: FormStep[];
  index: number;
  direction: 1 | -1;
  /** accessible name for the whole flow, e.g. "Instant repair quote" */
  label: string;
  className?: string;
  progressClassName?: string;
  /** rendered below the step (Back / Next / Submit buttons owned by the Frontend) */
  footer?: ReactNode;
  /** rendered between the progress bar and the step (stepper, selection summary; owned by the Frontend) */
  header?: ReactNode;
  /** data-testid on the progressbar (QA: "form-progress") */
  progressTestId?: string;
  /** classes for the step <h2> (visual size is the Frontend's call) */
  titleClassName?: string;
};

export function MultiStepForm({
  steps,
  index,
  direction,
  label,
  className,
  progressClassName,
  footer,
  header,
  progressTestId,
  titleClassName,
}: Props) {
  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const step = steps[index] ?? steps[0]!;
  const progress = (index + 1) / steps.length;

  useEffect(() => {
    if (mounted.current) headingRef.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [index]);

  const dx = reduced ? 0 : 24;
  return (
    <section
      aria-label={label}
      className={className}
      data-multistep
      data-direction={direction === 1 ? "forward" : "back"}
    >
      <div
        role="progressbar"
        data-testid={progressTestId}
        aria-label={`${label} progress`}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={index + 1}
        aria-valuetext={`Step ${index + 1} of ${steps.length}: ${step.title}`}
        className={cn("relative h-[3px] overflow-hidden rounded-full bg-surface-3", progressClassName)}
      >
        <m.span
          aria-hidden
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: reduced ? 0 : DUR.microLong, ease: FM_EASE.inOut }}
          className="absolute inset-0 origin-left bg-brand"
        />
      </div>
      {header}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <m.div
            key={step.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: reduced ? 1 : 0, x: d * dx }),
              center: {
                opacity: 1,
                x: 0,
                transition: { duration: reduced ? 0 : DUR.stepIn, ease: FM_EASE.out },
              },
              exit: (d: number) => ({
                opacity: reduced ? 1 : 0,
                x: d * -dx,
                transition: { duration: reduced ? 0 : DUR.stepOut, ease: FM_EASE.inOut },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            data-step-id={step.id}
          >
            <h2 ref={headingRef} tabIndex={-1} data-multistep-title className={cn("outline-none", titleClassName)}>
              {step.title}
            </h2>
            {step.content}
          </m.div>
        </AnimatePresence>
      </div>
      {footer}
    </section>
  );
}

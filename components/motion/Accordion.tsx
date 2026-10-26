"use client";
/**
 * Shared accessible accordion (A2 /faq = GSAP engine, A4 homepage = Framer engine).
 * ONE contract: button[aria-expanded][aria-controls] + region panel[id][aria-labelledby].
 * Answers stay in the DOM when collapsed (SEO / FAQPage parity); collapsed panels are `inert`.
 *
 * Note: an accordion must change layout height. This is the only height animation in the
 * motion layer; it is isolated with `contain: layout paint` on the panel and lasts 0.3s.
 * Content inside fades/slides with opacity+transform only. Reduced motion: instant.
 */
import { motion } from "framer-motion";
import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, EASE, FM_EASE } from "@/lib/motion/tokens";

export type AccordionItem = { id?: string; question: ReactNode; answer: ReactNode };

type Props = {
  items: AccordionItem[];
  engine?: "framer" | "gsap";
  /** allow several open at once (default false = one at a time) */
  multiple?: boolean;
  defaultOpen?: number[];
  className?: string;
  itemClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
  /** heading level wrapping each button (a11y) */
  headingLevel?: 2 | 3 | 4;
};

export function Accordion({
  items,
  engine = "framer",
  multiple = false,
  defaultOpen = [],
  className,
  itemClassName,
  buttonClassName,
  panelClassName,
  headingLevel = 3,
}: Props) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const toggle = useCallback(
    (i: number) =>
      setOpen((prev) => {
        const next = new Set(multiple ? prev : prev.has(i) ? [i] : []);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      }),
    [multiple],
  );
  const H = `h${headingLevel}` as "h3";

  return (
    <div className={className} data-accordion={engine}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btnId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={item.id ?? i} className={itemClassName} data-accordion-item data-open={isOpen || undefined}>
            <H className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className={buttonClassName}
                data-accordion-trigger
              >
                <span>{item.question}</span>
                <AccordionChevron open={isOpen} />
              </button>
            </H>
            {engine === "gsap" ? (
              <GsapPanel id={panelId} labelledBy={btnId} open={isOpen} className={panelClassName}>
                {item.answer}
              </GsapPanel>
            ) : (
              <FramerPanel id={panelId} labelledBy={btnId} open={isOpen} className={panelClassName}>
                {item.answer}
              </FramerPanel>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 16 16"
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: DUR.micro, ease: FM_EASE.outSoft }}
      className="flex-none"
    >
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}

type PanelProps = { id: string; labelledBy: string; open: boolean; className?: string; children: ReactNode };

function FramerPanel({ id, labelledBy, open, className, children }: PanelProps) {
  const reduced = useReducedMotion();
  const t = reduced ? { duration: 0 } : { duration: DUR.microLong, ease: FM_EASE.inOut };
  return (
    <motion.div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      inert={!open}
      data-accordion-panel
      initial={false}
      animate={{ height: open ? "auto" : 0 }}
      transition={t}
    >
      <motion.div
        className={className}
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6 }}
        transition={reduced ? { duration: 0 } : { duration: DUR.micro, ease: FM_EASE.outSoft, delay: open ? 0.06 : 0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function GsapPanel({ id, labelledBy, open, className, children }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const reduced = useReducedMotion();
  const [initialOpen] = useState(open); // SSR/first paint only; GSAP owns height afterwards
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();
    const inner = el.firstElementChild as HTMLElement | null;
    if (first.current || reduced) {
      first.current = false;
      gsap.set(el, { height: open ? "auto" : 0 });
      if (inner) gsap.set(inner, { autoAlpha: open ? 1 : 0, y: 0 });
      return;
    }
    const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
    if (open) {
      tl.to(el, { height: "auto", duration: DUR.microLong, ease: EASE.inOut });
      if (inner) tl.fromTo(inner, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: DUR.micro, ease: EASE.outSoft }, 0.06);
    } else {
      if (inner) tl.to(inner, { autoAlpha: 0, duration: 0.12, ease: EASE.outSoft }, 0);
      tl.to(el, { height: 0, duration: 0.25, ease: EASE.inOut }, 0);
    }
    return () => {
      tl.kill();
    };
  }, [open, reduced]);
  return (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      inert={!open}
      data-accordion-panel
      className={initialOpen ? "h-auto" : "h-0"}
    >
      <div className={className}>{children}</div>
    </div>
  );
}

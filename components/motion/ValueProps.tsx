"use client";
/**
 * A4 — Why Choose Us value props with Framer Motion layout animations (REQ-030).
 * Purpose: "what to look at" — a shared highlight (layoutId) glides to the prop
 * under the pointer/focus and that prop's detail line expands via `layout`.
 * Spec lists 6 props (REQ-029) — the component renders whatever it is given.
 * Reduced motion: highlight jumps, no layout tween (MotionConfig + duration 0).
 */
import { LayoutGroup, m } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

export type ValueProp = {
  id: string;
  title: string;
  detail?: string;
  icon?: ReactNode;
  /** Optional block above the title row (design `.why__num` stat). Additive (Frontend). */
  lead?: ReactNode;
};

type Props = { items: ValueProp[]; className?: string; itemClassName?: string };

export function ValueProps({ items, className, itemClassName }: Props) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const t = reduced ? { duration: 0 } : { duration: 0.3, ease: FM_EASE.inOut };
  return (
    <LayoutGroup id="value-props">
      <ul className={className} data-value-props data-speakable>
        {items.map((item, i) => {
          const isActive = active === i;
          return (
            <m.li
              key={item.id}
              layout
              transition={t}
              className={cn("relative isolate", itemClassName)}
              data-active={isActive || undefined}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
            >
              {isActive && (
                <m.span
                  layoutId="vp-highlight"
                  transition={t}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-primary-tint shadow-[inset_0_0_0_1px_var(--color-primary-glow)]"
                />
              )}
              {item.lead}
              <m.div layout="position" transition={t} className="flex items-center gap-3">
                {item.icon}
                <strong>{item.title}</strong>
              </m.div>
              {item.detail && (
                <m.p
                  layout="position"
                  transition={t}
                  // No opacity dim (axe color-contrast): inactive copy keeps the Frontend's
                  // text-secondary colour (7.85:1); the active item brightens via motion.css.
                  className="mb-0 mt-[6px]"
                >
                  {item.detail}
                </m.p>
              )}
            </m.li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}

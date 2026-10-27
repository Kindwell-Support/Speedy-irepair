"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/reduced-motion";

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS = {
  hidden: { y: -8, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

export function AnimatedMobileNav({
  open,
  onClose,
  panelId,
  items,
  cta,
}: {
  open: boolean;
  onClose: () => void;
  panelId: string;
  items: ReactNode[];
  cta: ReactNode;
}) {
  const reduced = useReducedMotion();
  const dur = reduced ? 0 : DUR.reveal;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[-1] bg-overlay"
            variants={BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: dur * 0.6 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="panel"
            id={panelId}
            data-lenis-prevent
            className="absolute inset-x-0 top-full z-nav border-b border-border bg-bg-raised"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: dur, ease: FM_EASE.outSoft }}
          >
            <nav aria-label="Mobile" className="container-site py-6">
              <motion.ul
                className="flex flex-col gap-1"
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: reduced ? 0 : 0.04 }}
              >
                {items.map((item, i) => (
                  <motion.li key={i} variants={ITEM_VARIANTS} transition={{ duration: dur * 0.7, ease: FM_EASE.outSoft }}>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={ITEM_VARIANTS} transition={{ duration: dur * 0.7, ease: FM_EASE.outSoft }}>
                {cta}
              </motion.div>
            </nav>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

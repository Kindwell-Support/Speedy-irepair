"use client";
/**
 * A4 — Route transitions: AnimatePresence keyed on pathname (App Router).
 * FrozenRouter keeps the OUTGOING page's router context while it exits, so the
 * old page doesn't flash the new content. Short: exit 0.12s fade, enter 0.25s fade+8px.
 * Also binds data-animate hooks for each page (useDataAnimate) once it mounts.
 * Reduced motion: no transform; MotionConfig + explicit 0-duration.
 */
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { useDataAnimate } from "./useDataAnimate";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // Freeze the context captured on first render of this page instance.
  const [frozen] = useState(context);
  if (!frozen) return <>{children}</>;
  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}

function PageFrame({ children, pathname }: { children: ReactNode; pathname: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useDataAnimate(ref, pathname);
  return (
    <div ref={ref} data-page={pathname}>
      {children}
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0 : DUR.page, ease: FM_EASE.out } }}
        exit={{ opacity: reduced ? 1 : 0, transition: { duration: reduced ? 0 : 0.12, ease: FM_EASE.inOut } }}
      >
        <FrozenRouter>
          <PageFrame pathname={pathname}>{children}</PageFrame>
        </FrozenRouter>
      </m.div>
    </AnimatePresence>
  );
}

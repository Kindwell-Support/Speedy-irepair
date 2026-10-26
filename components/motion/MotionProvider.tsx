"use client";
/**
 * Root motion provider: LazyMotion(domMax, async) + MotionConfig(reducedMotion="user") + Lenis.
 * Place in app/layout.tsx around header/main/footer. The cursor follower is
 * lazy-loaded here (desktop fine pointer only, never under reduced motion).
 *
 * Bundle rule: inside the motion layer use `m.*` (never `motion.*`) so framer's ~25 KB gz
 * feature set stays out of first-load JS (see docs/motion/PERF.md).
 */
import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { LenisProvider } from "./LenisProvider";
import { CursorFollower } from "./CursorFollower";

const loadFeatures = () => import("./framer-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">
        <LenisProvider>
          {children}
          <CursorFollower />
        </LenisProvider>
      </MotionConfig>
    </LazyMotion>
  );
}

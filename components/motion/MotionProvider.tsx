"use client";
/**
 * Root motion provider: MotionConfig(reducedMotion="user") + Lenis.
 * Place in app/layout.tsx around header/main/footer. The cursor follower is
 * lazy-loaded here (desktop fine pointer only, never under reduced motion).
 */
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { LenisProvider } from "./LenisProvider";
import { CursorFollower } from "./CursorFollower";
import { CursorGlow } from "./CursorGlow";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LenisProvider>
        {children}
        <CursorGlow />
        <CursorFollower />
      </LenisProvider>
    </MotionConfig>
  );
}

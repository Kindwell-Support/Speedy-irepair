"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Root motion wiring (keeps the Motion lane's three pieces, see docs/MOTION_CONTRACT.md):
 *  - /studio: no Lenis, no cursor, no transitions (Sanity Studio owns its own scrolling).
 *  - /motion-lab (QA harness, not a site page): MotionProvider + PageTransition here.
 *  - site routes: MotionProvider here; PageTransition sits in app/(site)/layout.tsx around <main>
 *    content only, so header/footer don't fade on navigation.
 */
export function MotionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/studio")) return <>{children}</>;
  if (pathname.startsWith("/motion-lab"))
    return (
      <MotionProvider>
        <PageTransition>{children}</PageTransition>
      </MotionProvider>
    );
  return <MotionProvider>{children}</MotionProvider>;
}

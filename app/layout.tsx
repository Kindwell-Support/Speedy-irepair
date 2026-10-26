/**
 * Root layout — MOTION WIRING ONLY (Motion & 3D Engineer, M1/M9). Created because app/ was empty;
 * the Frontend Engineer owns this file and should extend it (fonts, header/footer, JSON-LD, etc.).
 * Keep these three pieces when editing:
 *   1. <MotionBootScript/> in <head>      -> sets html[data-motion] before first paint (no FOUC, M9)
 *   2. <MotionProvider> around the page   -> MotionConfig(reducedMotion="user") + Lenis + cursor follower
 *   3. <PageTransition> around {children} -> route transitions + data-animate binding per page
 * See docs/motion/HOOKS.md.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { MotionBootScript } from "@/lib/motion/boot-script";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { isProductionSite, publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: "Speedy iRepair | Phone Repair in Akron, OH",
  robots: isProductionSite ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <MotionBootScript />
      </head>
      <body className="bg-bg text-text-primary">
        <MotionProvider>
          <PageTransition>{children}</PageTransition>
        </MotionProvider>
      </body>
    </html>
  );
}

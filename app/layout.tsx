/**
 * Root layout (Technical Architect scaffold; Frontend owns from here).
 * Motion wiring kept from the Motion & 3D lane:
 *   1. <MotionBootScript/> in <head>  -> sets html[data-motion] before first paint (no FOUC)
 *   2. MotionProvider (via <MotionShell>, skipped on /studio)
 *   3. PageTransition (app/(site)/layout.tsx around page content; /motion-lab via MotionShell)
 * Staging noindex layer 2 of 3 lives in lib/seo/metadata.ts (per page) + here as the default.
 */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Orbitron, Rajdhani } from "next/font/google";
import "@/styles/globals.css";
import { MotionBootScript } from "@/lib/motion/boot-script";
import { MotionShell } from "@/components/layout/MotionShell";
import { isIndexable } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "800", "900"], display: "swap", variable: "--font-orbitron" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-rajdhani" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Speedy iRepair | Phone Repair in Akron, OH", template: "%s | Speedy iRepair" },
  robots: isIndexable() ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        <MotionBootScript />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        <MotionShell>{children}</MotionShell>
      </body>
    </html>
  );
}

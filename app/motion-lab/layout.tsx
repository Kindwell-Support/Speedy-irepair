/**
 * Motion lab — QA/perf harness for the motion layer (Motion & 3D Engineer). NOT a site page:
 * noindex, 404 on the production site. Mirrors the Design markup (design/pages/home.html) so the
 * Playwright perf + reduced-motion runs measure the real hooks before Frontend pages exist.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isProductionSite } from "@/lib/env";

export const metadata: Metadata = { title: "Motion lab", robots: { index: false, follow: false } };

const LINKS = [
  ["/motion-lab", "Home"],
  ["/motion-lab/services", "Services"],
  ["/motion-lab/shop", "Shop"],
  ["/motion-lab/quote", "Quote"],
  ["/motion-lab/faq", "FAQ"],
  ["/motion-lab/drawer", "Drawer"],
] as const;

export default function LabLayout({ children }: { children: ReactNode }) {
  if (isProductionSite) notFound();
  return (
    <>
      <header className="sticky top-0 z-nav border-b border-border-subtle bg-overlay backdrop-blur">
        <nav aria-label="Motion lab" className="container-site flex h-nav items-center gap-6 text-body-sm">
          <strong className="text-text">Speedy iRepair · motion lab</strong>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="text-text-secondary hover:text-text">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main">{children}</main>
    </>
  );
}

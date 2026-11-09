import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/sanity/content";
import { telHref } from "@/lib/utils/format";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { hoursSummary } from "@/components/sections/global/HoursList";
import { AttributionCapture } from "@/components/repair-intake/AttributionCapture";
import { ChatWidgetScript } from "@/components/layout/ChatWidgetScript";

/**
 * Ad landing pages: no menu, banner or full footer to leak the visit. The logo still goes home, and the call
 * button and a short footer (address, hours, legal links) keep the page trustworthy.
 */
export default async function LandingLayout({ children }: { children: ReactNode }) {
  const { business: b, copyright } = await getSiteSettings();
  const hours = hoursSummary(b);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header absolute inset-x-0 top-0 z-nav">
        <div className="container-wide flex h-nav items-center lg:h-nav-desktop">
          <div className="site-header-bar mx-auto flex h-14 w-full items-center justify-between gap-4 rounded-full pl-5 pr-2 md:pl-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="flex h-10 shrink-0 items-center" aria-label={`${b.name}, home`}>
                <Image src={b.logo.src} alt={b.logo.alt} width={b.logo.width} height={b.logo.height} className="h-5 w-auto md:h-6" sizes="200px" />
              </Link>
              {b.spectrumAuthorizedRetailer ? (
                <p className="text-tag hidden border-l border-border-strong pl-4 text-text-secondary sm:block">Spectrum Authorized Retailer</p>
              ) : null}
            </div>
            <a href={telHref(b.phone)} className={buttonClasses("primary", "sm", "px-5")}>
              <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
              <span className="tabular-nums">
                <span className="sm:hidden">Call</span>
                <span className="hidden sm:inline">{b.phone}</span>
              </span>
            </a>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <footer className="bg-bg-raised py-10 pb-28 md:pb-10">
        <div className="container-site flex flex-col gap-6 text-body-sm text-text-tertiary md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="font-bold text-text-secondary">{b.name}</p>
            <address className="not-italic">{b.footerAddressLine}</address>
            {hours ? <p>{hours}</p> : null}
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            <nav aria-label="Legal" className="flex gap-6">
              <Link href="/policies/privacy" className="inline-flex min-h-11 items-center hover:text-text">
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="inline-flex min-h-11 items-center hover:text-text">
                Terms &amp; Conditions
              </Link>
            </nav>
            <p>{copyright}</p>
          </div>
        </div>
      </footer>
      <AttributionCapture />
      <ChatWidgetScript />
    </>
  );
}

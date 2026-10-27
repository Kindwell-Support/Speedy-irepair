import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { telHref } from "@/lib/utils/format";
import { MobileNav } from "./MobileNav";
import { PrimaryNav } from "./PrimaryNav";

/** Global header: logo, centred primary nav (from xl), Schedule Repair CTA. Phones get tap-to-call instead of the CTA. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const { business, navigation } = settings;
  return (
    <header className="sticky top-0 z-nav border-b border-border bg-bg">
      <div className="container-site flex h-nav items-center justify-between gap-4 lg:h-nav-desktop xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex h-10 shrink-0 items-center justify-self-start" aria-label={`${business.name}, home`}>
          <Image src={business.logo.src} alt={business.logo.alt} width={business.logo.width} height={business.logo.height} className="h-5 w-auto md:h-6" sizes="200px" />
        </Link>
        <PrimaryNav items={navigation.primary} />
        <div className="flex items-center gap-2 justify-self-end md:gap-3">
          <a href={telHref(business.phone)} className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text transition-colors duration-fast hover:border-text md:hidden">
            <span className="sr-only">Call {business.phone}</span>
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
          </a>
          <ButtonLink cta={navigation.headerCta} size="sm" className="hidden md:inline-flex" />
          <MobileNav items={navigation.primary} cta={navigation.headerCta} />
        </div>
      </div>
    </header>
  );
}

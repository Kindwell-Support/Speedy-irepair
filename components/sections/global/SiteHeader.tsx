import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { MobileNav } from "./MobileNav";

/** Global header: logo, primary nav (text scramble on hover, spec §2 global), Schedule Repair CTA. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const { business, navigation } = settings;
  return (
    <header className="sticky top-0 z-nav border-b border-border-subtle bg-overlay backdrop-blur-md">
      <div className="container-site flex h-nav items-center justify-between gap-6 lg:h-nav-desktop">
        <Link href="/" className="shrink-0" aria-label={`${business.name}, home`}>
          <Image
            src={business.logo.src}
            alt={business.logo.alt}
            width={business.logo.width}
            height={business.logo.height}
            className="h-5 w-auto md:h-6"
            sizes="200px"
          />
        </Link>
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-6">
            {navigation.primary.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-body-sm text-text-secondary transition-colors duration-fast hover:text-text">
                  <ScrambleText text={item.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink cta={navigation.headerCta} className="hidden sm:inline-flex" />
          <MobileNav items={navigation.primary} cta={navigation.headerCta} />
        </div>
      </div>
    </header>
  );
}

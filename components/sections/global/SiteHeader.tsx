import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { MobileNav } from "./MobileNav";
import { telHref } from "@/lib/utils/format";

const linkClass =
  "inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:bg-text/5 hover:text-text";

/** Global header: logo, primary nav (text scramble on hover, spec §2 global), Schedule Repair CTA. */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const { business, navigation } = settings;
  /** D3: the header follows the design (7 links + Services dropdown); the logo is the Home link. */
  const links = navigation.primary.filter((l) => l.href !== "/");
  return (
    <header className="sticky top-0 z-nav border-b border-border-subtle bg-overlay backdrop-blur-md">
      <div className="container-site flex h-nav items-center justify-between gap-6 lg:h-nav-desktop">
        <Link
          href="/"
          data-testid="logo"
          className="shrink-0"
          aria-label={`${business.name}, home`}
        >
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
          <ul className="flex items-center gap-1">
            {links.map((item) => (
              <li key={item.href} className="group relative">
                <Link href={item.href} className={linkClass}>
                  <ScrambleText text={item.label} />
                </Link>
                {item.children?.length ? (
                  <div className="invisible absolute left-0 top-full z-nav pt-2 opacity-0 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul
                      aria-label={item.label}
                      className="grid min-w-[240px] gap-1 rounded-lg border border-border bg-bg-raised p-2 shadow-2"
                    >
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-md px-4 py-2 text-body-sm text-text-secondary hover:bg-surface hover:text-text"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          {/* Design .nav__phone: shown from 1440 up, where the full nav + phone + CTA fit (QA BUG-011). */}
          <a
            href={telHref(business.phone)}
            data-testid="header-phone"
            className="hidden h-10 items-center whitespace-nowrap px-2 text-body-sm font-semibold tabular-nums text-text hover:text-primary-text 2xl:inline-flex"
          >
            {business.phone}
          </a>
          <ButtonLink cta={navigation.headerCta} className="hidden md:inline-flex" />
          <MobileNav items={links} cta={navigation.headerCta} />
        </div>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { CtaLink, SiteSettings } from "@/lib/sanity/types";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "./HoursList";

const PAYMENT_LABELS = { paypal: "PayPal", venmo: "Venmo", visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover" } as const;

function FooterLink({ link }: { link: CtaLink }) {
  const cls = "text-body-sm text-text-secondary transition-colors duration-fast hover:text-text";
  if (link.external)
    return (
      <a href={link.href} className={cls} target="_blank" rel="noopener noreferrer">
        {link.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

/** Spec 2.1.11 global footer (REQ-039..043). All values from siteSettings. */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { business: b, navigation } = settings;
  const logo = b.logoInverse ?? b.logo;
  return (
    <footer className="border-t border-border-subtle bg-bg-raised pb-10 pt-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-site grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-4">
          <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-6 w-auto" sizes="200px" />
          <address className="space-y-1 text-body-sm not-italic text-text-secondary">
            <p>{b.footerAddressLine}</p>
            <p>
              <a href={telHref(b.phone)} className="hover:text-text">
                {b.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${b.email}`} className="hover:text-text">
                {b.email}
              </a>
            </p>
          </address>
          <ul className="flex flex-wrap gap-4" aria-label="Social media">
            {b.socials.map((s) => (
              <li key={s.platform}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-body-sm text-text-secondary hover:text-text">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Quick links">
          <h3 className="mb-4 text-label uppercase text-text-tertiary">Quick links</h3>
          <ul className="space-y-3">
            {navigation.footerQuickLinks.map((l) => (
              <li key={l.href}>
                <FooterLink link={l} />
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Legal and more">
          <h3 className="mb-4 text-label uppercase text-text-tertiary">More</h3>
          <ul className="space-y-3">
            {navigation.footerLegalLinks.map((l) => (
              <li key={l.href}>
                <FooterLink link={l} />
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="mb-4 text-label uppercase text-text-tertiary">Hours</h3>
          <HoursList business={b} compact />
        </div>
      </div>
      <div className="container-site mt-12 flex flex-col gap-4 border-t border-border-subtle pt-8 md:flex-row md:items-center md:justify-between">
        <p className="text-caption text-text-tertiary">{settings.copyright}</p>
        <div>
          <p className="sr-only">Accepted payments:</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payments">
            {b.paymentsAccepted.map((p) => (
              <li key={p} className="rounded-xs border border-border px-2 py-1 text-caption text-text-secondary">
                {PAYMENT_LABELS[p]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

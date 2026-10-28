import Image from "next/image";
import Link from "next/link";
import type { CtaLink, SiteSettings } from "@/lib/sanity/types";
import { telHref } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HoursList, hoursSummary } from "./HoursList";

const PAYMENT_LABELS = { paypal: "PayPal", venmo: "Venmo", visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover" } as const;

/* Every footer link is a 44px row: the footer is mostly used on phones, to call or find the hours. */
const LINK = "inline-flex min-h-11 items-center text-body text-text-secondary transition-colors duration-fast hover:text-text";
const COL_HEADING = "mb-2 font-sans text-body font-bold text-text";

function FooterLink({ link }: { link: CtaLink }) {
  if (link.external)
    return (
      <a href={link.href} className={LINK} target="_blank" rel="noopener noreferrer">
        {link.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  return (
    <Link href={link.href} className={LINK}>
      {link.label}
    </Link>
  );
}

/**
 * Spec 2.1.11 global footer (REQ-039..043). All values from siteSettings. Rows are separated by space, not
 * rules. The page closes on the brand's own wordmark, greyed out to a faint ghost across the container.
 */
export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { business: b, navigation } = settings;
  const logo = b.logoInverse ?? b.logo;
  const hours = hoursSummary(b);
  const closedDays = b.hours.filter((h) => h.closed).map((h) => h.day);
  return (
    <footer className="bg-bg-raised pb-10 pt-16 md:pt-20" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-site">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-5">
            <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="h-8 w-auto" sizes="240px" />
            <a href={telHref(b.phone)} className="flex min-h-11 items-center font-heading text-h3 font-black tabular-nums hover:text-primary-text">
              {b.phone}
            </a>
          </div>
          <ButtonLink cta={navigation.headerCta} size="lg" className="self-start md:self-auto" />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-16 xl:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h3 className={COL_HEADING}>Visit</h3>
            <address className="not-italic">
              <p className="py-2 text-body text-text-secondary">{b.footerAddressLine}</p>
              <a href={`mailto:${b.email}`} className={LINK}>
                {b.email}
              </a>
            </address>
            <ul className="mt-2 flex flex-wrap gap-x-6" aria-label="Social media">
              {b.socials.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Quick links">
            <h3 className={COL_HEADING}>Quick links</h3>
            <ul>
              {navigation.footerQuickLinks.map((l) => (
                <li key={l.href}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal and more">
            <h3 className={COL_HEADING}>More</h3>
            <ul>
              {navigation.footerLegalLinks.map((l) => (
                <li key={l.href}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="col-span-2 md:col-span-1">
            <h3 className={COL_HEADING}>Hours</h3>
            {hours ? (
              <p className="py-2 text-body text-text-secondary">
                {hours}
                {closedDays.length ? <span className="block">{closedDays.join(", ")} closed</span> : null}
              </p>
            ) : (
              <div className="max-w-sm pt-2">
                <HoursList business={b} compact />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container-site mt-16 flex flex-col gap-3 text-body-sm text-text-tertiary md:flex-row md:items-center md:justify-between">
        <p>{settings.copyright}</p>
        <p>We accept {b.paymentsAccepted.map((p) => PAYMENT_LABELS[p]).join(", ")}.</p>
      </div>
      <div className="container-site mt-12 md:mt-16" aria-hidden>
        <div className="footer-logo text-white/[0.06]" />
      </div>
    </footer>
  );
}

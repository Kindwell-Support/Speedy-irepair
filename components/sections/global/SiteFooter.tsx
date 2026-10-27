import Image from "next/image";
import type { CtaLink, FooterCopy, SiteSettings } from "@/lib/sanity/types";
import { telHref } from "@/lib/utils/format";
import { HoursList } from "./HoursList";
import { FooterLink } from "./FooterLink";
import { SocialIcon } from "./SocialIcon";

const WORDMARK = { src: "/brand/logo-wordmark.svg", width: 3380, height: 328 } as const;
const headCls = "mb-4 text-label font-semibold uppercase text-text-tertiary";

function LinkColumn({ label, links }: { label: string; links: CtaLink[] }) {
  return (
    <nav aria-label={label}>
      <h3 className={headCls}>{label}</h3>
      <ul className="grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <FooterLink link={l} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Spec 2.1.11 / design .footer: 4fr 2fr 3fr 3fr grid, social icon buttons, pay chips, oversized wordmark, bottom row. */
export function SiteFooter({ settings, copy }: { settings: SiteSettings; copy: FooterCopy }) {
  const { business: b, navigation } = settings;
  const logo = b.logoInverse ?? b.logo;
  return (
    <footer
      data-section="footer"
      className="border-t border-border-subtle bg-bg pb-8 pt-24"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-site">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[4fr_2fr_3fr_3fr]">
          <div>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="mb-12 h-5 w-auto"
              sizes="206px"
            />
            <address className="grid gap-2 text-body-sm not-italic text-text-secondary">
              <span>{b.footerAddressLine}</span>
              <a href={telHref(b.phone)} className="tabular-nums hover:text-text">
                {b.phone}
              </a>
              <a href={`mailto:${b.email}`} className="hover:text-text">
                {b.email}
              </a>
            </address>
            <ul className="mt-6 flex gap-2" aria-label={copy.socialLabel}>
              {b.socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (opens in a new tab)`}
                    className="grid size-10 place-items-center rounded-full border border-border text-text-secondary transition-colors duration-instant hover:border-border-strong hover:bg-surface-2 hover:text-text focus-visible:shadow-focus"
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <h3 className={headCls}>{copy.hoursLabel}</h3>
              <HoursList business={b} compact />
            </div>
          </div>
          <LinkColumn label={copy.quickLinksLabel} links={navigation.footerQuickLinks} />
          <LinkColumn label={copy.legalLabel} links={navigation.footerLegalLinks} />
          <div>
            <h3 className={headCls}>{copy.paymentsLabel}</h3>
            <ul
              className="flex flex-wrap gap-2"
              aria-label={copy.paymentsLabel}
              data-testid="payment-methods"
            >
              {b.paymentsAccepted.map((p) => (
                <li
                  key={p}
                  className="inline-flex h-7 items-center rounded-xs border border-border px-[10px] text-[11px] font-semibold tracking-[0.02em] text-text-secondary"
                >
                  {copy.paymentLabels[p]}
                </li>
              ))}
            </ul>
            {b.spectrumAuthorizedRetailer ? (
              <p className="mt-8 text-caption text-text-tertiary">{copy.spectrumLabel}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-24" aria-hidden="true" data-testid="footer-wordmark">
          <Image
            src={WORDMARK.src}
            alt=""
            width={WORDMARK.width}
            height={WORDMARK.height}
            className="h-auto w-full opacity-95"
            sizes="100vw"
            unoptimized
          />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6 text-caption text-text-tertiary">
          <span>{settings.copyright}</span>
          <span>{copy.locality}</span>
        </div>
      </div>
    </footer>
  );
}

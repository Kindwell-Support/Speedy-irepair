import Link from "next/link";
import type { CtaLink } from "@/lib/sanity/types";
import { A11Y } from "@/components/ui/a11yStrings";

export function FooterLink({ link }: { link: CtaLink }) {
  const cls = "text-body-sm text-text-secondary transition-colors duration-instant hover:text-text";
  if (link.external)
    return (
      <a href={link.href} className={cls} target="_blank" rel="noopener noreferrer">
        {link.label}
        <span className="sr-only">{A11Y.opensInNewTab}</span>
      </a>
    );
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

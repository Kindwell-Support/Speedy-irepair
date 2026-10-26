import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { CtaLink } from "@/lib/sanity/types";

type Variant = NonNullable<CtaLink["variant"]>;
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-fast ease-out focus-visible:shadow-focus disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-text hover:bg-primary-hover active:bg-primary-active",
  secondary: "border border-border-strong bg-transparent text-text hover:bg-surface-2",
  link: "text-primary-text underline-offset-4 hover:underline",
};
const sizes: Record<Size, string> = {
  md: "h-control-md px-5 text-body-sm",
  lg: "h-control-lg px-7 text-body",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], variant === "link" ? "h-auto px-0" : sizes[size], className);
}

/** Renders a CMS CtaLink. External links open in a new tab with rel=noopener. */
export function ButtonLink({
  cta,
  size = "md",
  className,
  children,
}: {
  cta: CtaLink;
  size?: Size;
  className?: string;
  children?: ReactNode;
}) {
  const cls = buttonClasses(cta.variant ?? "primary", size, className);
  const label = children ?? cta.label;
  const isExternal = cta.external || /^https?:\/\//.test(cta.href);
  if (isExternal || cta.href.startsWith("tel:") || cta.href.startsWith("mailto:")) {
    return (
      <a
        href={cta.href}
        className={cls}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
        {isExternal ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={cls}>
      {label}
    </Link>
  );
}

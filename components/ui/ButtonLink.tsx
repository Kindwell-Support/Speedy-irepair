import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { CtaLink } from "@/lib/sanity/types";

type Variant = NonNullable<CtaLink["variant"]>;
type Size = "sm" | "md" | "lg";

/* Rajdhani 700, uppercase, modest tracking: buttons are read and pressed, so they use the reading face. */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans font-bold uppercase tracking-[0.06em] transition-[background-color,border-color,color,box-shadow] duration-fast ease-out focus-visible:shadow-focus disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-text shadow-glow-sm hover:bg-primary-hover active:bg-primary-active",
  secondary: "border border-border-strong bg-bg text-text hover:border-text hover:bg-surface active:bg-surface-2",
  link: "text-primary-text underline underline-offset-4 decoration-1 hover:decoration-2",
};
const sizes: Record<Size, string> = {
  sm: "h-control-sm px-5 text-body-sm",
  md: "h-control-md px-6 text-body",
  lg: "h-control-lg px-8 text-body-lg",
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

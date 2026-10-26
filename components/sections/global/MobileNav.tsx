"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { CtaLink } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Disclosure-pattern mobile menu (<1280px). Closes on route change and Escape. */
export function MobileNav({ items, cta }: { items: CtaLink[]; cta: CtaLink }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const id = useId();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-control-md w-12 items-center justify-center rounded-full border border-border text-text"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M2 5h16M2 10h16M2 15h16" />}
        </svg>
      </button>
      <div
        id={id}
        hidden={!open}
        data-lenis-prevent
        className="absolute inset-x-0 top-full border-b border-border bg-bg-raised"
      >
        <nav aria-label="Mobile" className="container-site py-6">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-md px-3 py-3 text-body-lg text-text hover:bg-surface">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink cta={cta} size="lg" className="mt-4 w-full" />
        </nav>
      </div>
    </div>
  );
}

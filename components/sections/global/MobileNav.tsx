"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { CtaLink, NavLink } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Disclosure-pattern mobile menu (<1280px). Closes on route change and Escape. */
export function MobileNav({ items, cta }: { items: NavLink[]; cta: CtaLink }) {
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
        data-testid="nav-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-control-md w-12 items-center justify-center rounded-full border border-border text-text"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg
          aria-hidden
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M2 5h16M2 10h16M2 15h16" />}
        </svg>
      </button>
      <div
        id={id}
        data-testid="mobile-nav"
        hidden={!open}
        data-lenis-prevent
        className="absolute inset-x-0 top-full border-b border-border bg-bg-raised"
      >
        <nav aria-label="Mobile" className="container-site py-6">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-3 text-body-lg text-text hover:bg-surface"
                >
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <ul
                    aria-label={item.label}
                    className="mb-2 ml-3 grid gap-1 border-l border-border-subtle pl-3"
                  >
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-md px-3 py-2 text-body text-text-secondary hover:bg-surface hover:text-text"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <ButtonLink cta={cta} size="lg" className="mt-4 w-full" />
        </nav>
      </div>
    </div>
  );
}

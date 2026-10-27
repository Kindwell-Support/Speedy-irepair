"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { CtaLink } from "@/lib/sanity/types";
import { ScrambleText } from "@/components/motion/ScrambleText";

/** The first four links stay in the bar; the rest sit under "More" so the bar reads at a glance. */
const IN_BAR = 4;

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

// Full-height tabs: a red rule grows along the header's bottom edge on hover and stays on the current page.
const tab =
  "relative inline-flex h-nav-desktop items-center gap-2 whitespace-nowrap px-3 text-body font-bold text-text-secondary transition-colors duration-fast hover:text-text 2xl:px-4 " +
  "after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-fast after:ease-out hover:after:scale-x-100 2xl:after:inset-x-4 " +
  "aria-[current=page]:text-text aria-[current=page]:after:scale-x-100 data-[active=true]:text-text data-[active=true]:after:scale-x-100";

/** Desktop primary navigation (≥1280px). Labels scramble on hover (spec §2 global). */
export function PrimaryNav({ items }: { items: CtaLink[] }) {
  const pathname = usePathname();
  const inBar = items.slice(0, IN_BAR);
  const more = items.slice(IN_BAR);

  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center">
        {inBar.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={tab} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
              <ScrambleText text={item.label} />
            </Link>
          </li>
        ))}
        {more.length ? <MoreMenu items={more} pathname={pathname} /> : null}
      </ul>
    </nav>
  );
}

/** Disclosure menu for the remaining links. Closes on route change, Escape, outside click and focus leaving it. */
function MoreMenu({ items, pathname }: { items: CtaLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const active = items.some((item) => isCurrent(pathname, item.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <li
      ref={root}
      className="relative"
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        data-active={active}
        onClick={() => setOpen((v) => !v)}
        className={tab}
      >
        More
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-fast ${open ? "rotate-180" : ""}`}>
          <path d="M2 4.5l4 4 4-4" />
        </svg>
      </button>
      <ul id={id} hidden={!open} className="absolute right-0 top-full w-56 border border-border-strong bg-surface py-2 shadow-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="block whitespace-nowrap border-l-2 border-transparent px-5 py-3 text-body font-bold text-text-secondary transition-colors duration-fast hover:border-primary hover:bg-surface-2 hover:text-text aria-[current=page]:border-primary aria-[current=page]:text-text"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

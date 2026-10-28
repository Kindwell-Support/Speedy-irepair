"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CtaLink } from "@/lib/sanity/types";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { cn } from "@/lib/utils/cn";
import { cssVars } from "@/lib/utils/css-vars";

/** The first four links stay in the bar; the rest sit under "More" so the bar reads at a glance. */
const IN_BAR = 4;

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

// Pill tabs: a shared highlight slides under whichever tab is hovered and rests on the current page.
// The current page also carries a small red dot.
const tab =
  "relative z-raised inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-body font-bold text-text-secondary transition-colors duration-fast hover:text-text 2xl:px-5 " +
  "aria-[current=page]:text-text data-[active=true]:text-text";

const dot = "size-1.5 shrink-0 rounded-full bg-primary";

/** Desktop primary navigation (≥1280px). Labels scramble on hover (spec §2 global). */
export function PrimaryNav({ items }: { items: CtaLink[] }) {
  const pathname = usePathname();
  const inBar = items.slice(0, IN_BAR);
  const more = items.slice(IN_BAR);
  const list = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number; on: boolean; moved: boolean }>({ x: 0, w: 0, on: false, moved: false });

  const moveTo = useCallback((el: Element | null | undefined) => {
    const ul = list.current;
    if (!ul || !el) return setPill((p) => ({ ...p, on: false }));
    const a = ul.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    setPill((p) => ({ x: b.left - a.left, w: b.width, on: true, moved: p.on }));
  }, []);

  // Rest the highlight on the current page's tab (or "More" when the page lives in it); hidden otherwise.
  const rest = useCallback(() => moveTo(list.current?.querySelector('[aria-current="page"], [data-active="true"]')), [moveTo]);

  useLayoutEffect(() => {
    rest();
  }, [pathname, rest]);
  useEffect(() => {
    window.addEventListener("resize", rest);
    return () => window.removeEventListener("resize", rest);
  }, [rest]);

  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul
        ref={list}
        className="relative flex items-center"
        onPointerOver={(e) => moveTo((e.target as Element).closest("[data-tab]"))}
        onPointerLeave={rest}
      >
        <li
          aria-hidden="true"
          role="presentation"
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 h-10 w-[var(--pill-w)] -translate-y-1/2 translate-x-[var(--pill-x)] rounded-full bg-white/[0.08]",
            pill.on ? "opacity-100" : "opacity-0",
            pill.moved
              ? "transition-[transform,width,opacity] duration-[380ms,380ms,200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "transition-opacity duration-200 ease-out",
          )}
          style={cssVars({ "--pill-x": `${pill.x}px`, "--pill-w": `${pill.w}px` })}
        />
        {inBar.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} data-tab className={tab} aria-current={current ? "page" : undefined}>
                {current ? <span aria-hidden className={dot} /> : null}
                <ScrambleText text={item.label} />
              </Link>
            </li>
          );
        })}
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
        data-tab
        onClick={() => setOpen((v) => !v)}
        className={tab}
      >
        {active ? <span aria-hidden className={dot} /> : null}
        More
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-fast ${open ? "rotate-180" : ""}`}>
          <path d="M2 4.5l4 4 4-4" />
        </svg>
      </button>
      <ul id={id} hidden={!open} className="absolute right-0 top-full mt-3 w-60 rounded-2xl bg-surface-2 p-2 shadow-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-body font-bold text-text-secondary transition-colors duration-fast hover:bg-surface-3 hover:text-text aria-[current=page]:text-text"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

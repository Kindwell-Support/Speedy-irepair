"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Sticky header wrapper. Sets data-scrolled once the page leaves the top, so the bar can tighten into an island. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let scrolled = false;
    const update = () => {
      const next = window.scrollY > 24;
      if (next === scrolled) return;
      scrolled = next;
      el.toggleAttribute("data-scrolled", next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header ref={ref} className="site-header sticky top-0 z-nav">
      {children}
    </header>
  );
}

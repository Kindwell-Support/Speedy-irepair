"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Sticky header wrapper. Sets data-scrolled once the page leaves the top, so the bar can tighten into an island.
 * On a page with the home hero the bar stays full width until the hero is over: its bottom (the GSAP pin-spacer's
 * while the repair scrub is pinned, so the whole animation counts) has passed under the header.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let scrolled = false;
    const update = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero-repair]");
      const next = hero
        ? (hero.closest<HTMLElement>(".pin-spacer") ?? hero).getBoundingClientRect().bottom <= el.offsetHeight
        : window.scrollY > 24;
      if (next === scrolled) return;
      scrolled = next;
      el.toggleAttribute("data-scrolled", next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <header ref={ref} className="site-header sticky top-0 z-nav">
      {children}
    </header>
  );
}

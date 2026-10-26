"use client";
/**
 * A1 / M1 — Lenis smooth scroll, initialised first (mount this at the top of the
 * root layout, outside PageTransition). Driven from gsap.ticker (see lib/motion/lenis-gsap.ts).
 * Disabled entirely under prefers-reduced-motion (native scroll; useLenis() returns null).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import type { LenisOptions } from "lenis";
import { createLenisGsap } from "@/lib/motion/lenis-gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance (null under reduced motion or before mount). Never override its loop. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/** Scroll helper that works with or without Lenis. */
export function scrollToTarget(lenis: Lenis | null, target: number | string | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, offset: typeof target === "number" ? 0 : -80 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "auto" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

type Props = {
  children: ReactNode;
  /** Lenis lerp (0–1). Higher = snappier. Default 0.14. */
  lerp?: number;
  /** Optional fixed duration (s) instead of lerp. */
  duration?: number;
  options?: Partial<LenisOptions>;
};

export function LenisProvider({ children, lerp, duration, options }: Props) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (reduced || document.documentElement.dataset.motion !== "ok") return;
    const handle = createLenisGsap({
      ...(lerp !== undefined ? { lerp } : {}),
      ...(duration !== undefined ? { duration, lerp: undefined } : {}),
      ...options,
    });
    setLenis(handle.lenis);
    // QA hook (qa/tests/e2e/motion.spec.ts): exposed everywhere except the production site.
    const w = window as Window & { __QA__?: Record<string, unknown> };
    if (process.env.NEXT_PUBLIC_SITE_ENV !== "production") w.__QA__ = { ...w.__QA__, lenis: handle.lenis, gsap, ScrollTrigger };
    return () => {
      if (w.__QA__) delete w.__QA__.lenis;
      handle.destroy();
      setLenis(null);
    };
    // options object identity is intentionally ignored (init once)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, lerp, duration]);

  // Route change: jump to top (or to the #hash target) immediately, then re-measure triggers.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) scrollToTarget(lenis, hash, true);
    else scrollToTarget(lenis, 0, true);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

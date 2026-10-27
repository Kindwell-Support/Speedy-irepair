"use client";
import { useLayoutEffect, type RefObject } from "react";
import { loadMotionEngine } from "@/lib/motion/engine";

/**
 * Binds all data-animate hooks inside `ref` (reveal, stagger, parallax,
 * split-heading, steps, countup) and the toc scroll-spy. Re-binds when `key` changes (e.g. pathname).
 * The bindings + GSAP load asynchronously (lib/motion/engine.ts); unmount before load = no-op.
 */
export function useDataAnimate(ref: RefObject<HTMLElement | null>, key?: unknown) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    // Scroll-spy (a[data-toc-link]) is state, not motion: bound under reduced motion too. It ships
    // inside the already-async engine chunk (no extra chunk/request, first load unchanged).
    let spyCleanup: (() => void) | undefined;
    void loadMotionEngine().then(({ bindAnimations, bindScrollSpy }) => {
      if (cancelled) return;
      cleanup = bindAnimations(el);
      spyCleanup = bindScrollSpy(el);
    });
    return () => {
      cancelled = true;
      cleanup?.();
      spyCleanup?.();
    };
  }, [ref, key]);
}

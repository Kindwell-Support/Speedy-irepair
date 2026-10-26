"use client";
import { useLayoutEffect, type RefObject } from "react";
import { loadMotionEngine } from "@/lib/motion/engine";

/**
 * Binds all data-animate hooks inside `ref` (reveal, stagger, parallax,
 * split-heading, steps). Re-binds when `key` changes (e.g. pathname).
 * The bindings + GSAP load asynchronously (lib/motion/engine.ts); unmount before load = no-op.
 */
export function useDataAnimate(ref: RefObject<HTMLElement | null>, key?: unknown) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void loadMotionEngine().then(({ bindAnimations }) => {
      if (!cancelled) cleanup = bindAnimations(el);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [ref, key]);
}

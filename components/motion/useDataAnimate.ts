"use client";
import { useLayoutEffect, type RefObject } from "react";
import { bindAnimations } from "@/lib/motion/bindings";

/**
 * Binds all data-animate hooks inside `ref` (reveal, stagger, parallax,
 * split-heading, steps). Re-binds when `key` changes (e.g. pathname).
 */
export function useDataAnimate(ref: RefObject<HTMLElement | null>, key?: unknown) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    return bindAnimations(el);
  }, [ref, key]);
}

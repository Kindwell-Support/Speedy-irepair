"use client";
import { useSyncExternalStore } from "react";
import { MQ } from "./tokens";

/**
 * Single source of truth for reduced motion (M9 / A8 / REQ-140).
 * Honors: OS `prefers-reduced-motion: reduce` AND the html[data-motion="reduce"]
 * flag set by the pre-hydration script (also used for `?motion=reduce` QA override).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const flag = document.documentElement.dataset.motion;
  if (flag === "reduce" || flag === "fallback") return true;
  return window.matchMedia?.(MQ.reduce).matches ?? false;
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MQ.reduce);
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  mq.addEventListener("change", cb);
  return () => {
    mq.removeEventListener("change", cb);
    obs.disconnect();
  };
}

/** React hook. SSR snapshot = false (server HTML is always the full-content state). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

/** Low-power / data-saver heuristics used to skip the 3D hero and other heavy extras. */
export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return true;
  if (window.matchMedia?.("(prefers-reduced-data: reduce)").matches) return true;
  if ((nav.hardwareConcurrency ?? 8) <= 2) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  return false;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    isFinePointer,
    () => false,
  );
}

"use client";
/**
 * Lenis + GSAP ScrollTrigger init config (A1 / M1 deliverable c).
 *
 * - Lenis runs on the native window scroller, so ScrollTrigger reads real scroll
 *   positions; no scrollerProxy is required (scrollerProxy is only needed for a
 *   custom wrapper/content scroller — see `wrapper` option note below).
 * - autoRaf OFF: Lenis is driven by gsap.ticker so Lenis, ScrollTrigger and all
 *   tweens share ONE rAF loop and stay in lockstep (no 1-frame lag on pins).
 * - lenis.on('scroll', ScrollTrigger.update) keeps triggers in sync.
 * - gsap.ticker.lagSmoothing(0) so a long frame never makes scroll "jump back".
 * - Never created under prefers-reduced-motion (native scrolling instead).
 */
import Lenis, { type LenisOptions } from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "./gsap";

export const LENIS_DEFAULTS: LenisOptions = {
  // Snappy: higher lerp = less "float". 0.1 is Lenis default; 0.14 feels tighter.
  lerp: 0.14,
  smoothWheel: true,
  // Touch keeps native momentum (better on iOS/Android, avoids input latency).
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  autoRaf: false,
  // Lenis handles in-page #anchor clicks (offset for the fixed header).
  anchors: { offset: -80, duration: 0.8 },
  // Elements with data-lenis-prevent (modals, iframes, Square/Jotform embeds) scroll natively.
};

export type LenisGsapHandle = {
  lenis: Lenis;
  destroy: () => void;
};

export function createLenisGsap(options: Partial<LenisOptions> = {}): LenisGsapHandle {
  registerGsap();
  const lenis = new Lenis({ ...LENIS_DEFAULTS, ...options, autoRaf: false });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy() {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
      lenis.off("scroll", onScroll);
      lenis.destroy();
    },
  };
}

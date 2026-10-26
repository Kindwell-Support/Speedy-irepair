"use client";
/**
 * Async loader for the GSAP/Lenis motion engine (Architect perf rule: add nothing to first load).
 * - First call starts the download (MotionProvider calls it once at hydration, so the chunk is
 *   in flight while React finishes); every later call returns the same promise.
 * - `motionEngine()` returns the module synchronously once loaded (null before) for
 *   fire-and-forget callers such as route-change ScrollTrigger.refresh().
 * - Until it resolves, CSS before-states hold content; boot-script.tsx flips html[data-motion] to
 *   "fallback" (content visible, no motion) if nothing is bound within 2.5 s.
 */
import type * as EngineImpl from "./engine-impl";

export type MotionEngine = typeof EngineImpl;

let promise: Promise<MotionEngine> | null = null;
let engine: MotionEngine | null = null;

export function loadMotionEngine(): Promise<MotionEngine> {
  if (!promise) {
    promise = import("./engine-impl").then((mod) => {
      mod.registerGsap();
      engine = mod;
      return mod;
    });
  }
  return promise;
}

export function motionEngine(): MotionEngine | null {
  return engine;
}

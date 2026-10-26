"use client";
import { isLowPowerDevice, prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type ThreeDecision = { ok: boolean; reason?: string; mobile: boolean; force: boolean };

/** Decide whether to mount the WebGL hero. Poster-only on any doubt (graceful degrade). */
export function decide3D(): ThreeDecision {
  const force = /[?&]force3d=1/.test(window.location.search); // QA/perf override
  const mobile = !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.innerWidth < 768;
  if (/[?&]no3d=1/.test(window.location.search)) return { ok: false, reason: "disabled", mobile, force };
  if (prefersReducedMotion()) return { ok: false, reason: "reduced-motion", mobile, force };
  if (!force && isLowPowerDevice()) return { ok: false, reason: "low-power", mobile, force };
  try {
    const c = document.createElement("canvas");
    // failIfMajorPerformanceCaveat => software rasterisers (SwiftShader etc.) report no GL.
    const gl =
      c.getContext("webgl2", { failIfMajorPerformanceCaveat: !force }) ??
      c.getContext("webgl", { failIfMajorPerformanceCaveat: !force });
    if (!gl) return { ok: false, reason: "no-webgl", mobile, force };
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return { ok: false, reason: "no-webgl", mobile, force };
  }
  return { ok: true, mobile, force };
}

"use client";
import { isLowPowerDevice, prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type ThreeDecision = { ok: boolean; reason?: string; mobile: boolean; force: boolean };

/** Decide whether to mount the WebGL hero. Poster-only on any doubt (graceful degrade). */
export function decide3D(): ThreeDecision {
  const force = /[?&]force3d=1/.test(window.location.search); // QA/perf override
  const mobile = !window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.innerWidth < 768;
  if (/[?&]no3d=1/.test(window.location.search)) return { ok: false, reason: "disabled", mobile, force };
  if (prefersReducedMotion()) return { ok: false, reason: "reduced-motion", mobile, force };
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData || window.matchMedia("(prefers-reduced-data: reduce)").matches)
    return { ok: false, reason: "save-data", mobile, force }; // never overridden by ?force3d
  if (!force && isLowPowerDevice()) return { ok: false, reason: "low-power", mobile, force };
  try {
    const c = document.createElement("canvas");
    // failIfMajorPerformanceCaveat => software rasterisers (SwiftShader etc.) report no GL.
    const gl =
      c.getContext("webgl2", { failIfMajorPerformanceCaveat: !force }) ??
      c.getContext("webgl", { failIfMajorPerformanceCaveat: !force });
    if (!gl) return { ok: false, reason: "no-webgl", mobile, force };
    // Some software rasterisers slip past the caveat flag (headless Chrome, blocklisted GPUs):
    // their shader compile for the transmission pass is a 1-3 s main-thread task, so poster only.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    if (!force && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return { ok: false, reason: "software-gl", mobile, force };
    }
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return { ok: false, reason: "no-webgl", mobile, force };
  }
  return { ok: true, mobile, force };
}

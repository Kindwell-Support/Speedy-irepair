/**
 * Motion-owned equivalent of qa/scripts/anim-profile.ts (same INIT, same scroll drivers:
 * desktop 1440x900 mouse.wheel(0,120)/50ms, mobile Pixel 7 + 4x CPU throttle scrollBy(18)/rAF),
 * but repeatable (N runs), path-selectable (e.g. "/?no3d=1") and with an optional CPU profile
 * summary (top self-time functions during the scroll window) to attribute long tasks.
 * Writes nothing into qa/. Usage:
 *   node scripts/motion-anim-profile.mjs <base> [path=/] [runs=3] [--cpu] [--out file.json]
 */
import fs from "node:fs";
import { chromium, devices } from "@playwright/test";

const [base, pth = "/", runsArg = "3", ...rest] = process.argv.slice(2);
const RUNS = Number(runsArg);
const CPU = rest.includes("--cpu");
const OUT = rest.includes("--out") ? rest[rest.indexOf("--out") + 1] : null;
const SECONDS = Number(process.env.QA_ANIM_SECONDS || 6);
const INIT = `(() => {
  window.__qa = { frames: [], longtasks: [], recording: false };
  const loop = (t) => { if (window.__qa.recording) window.__qa.frames.push(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__qa.longtasks.push({ start: e.startTime, dur: e.duration }))).observe({ type: 'longtask', buffered: true }); } catch {}
})();`;

async function scroll(page, mobile) {
  await page.evaluate(() => { const q = window.__qa; q.frames = []; q.longtasks = []; q.recording = true; q.t0 = performance.now(); });
  const start = Date.now();
  const vh = page.viewportSize().height;
  if (!mobile) {
    await page.mouse.move(200, vh / 2);
    while (Date.now() - start < SECONDS * 1000) { await page.mouse.wheel(0, 120); await page.waitForTimeout(50); }
  } else {
    await page.evaluate(async (ms) => {
      const end = performance.now() + ms;
      await new Promise((res) => { const step = () => { window.scrollBy(0, 18); if (performance.now() < end) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
    }, SECONDS * 1000);
  }
  return page.evaluate(() => {
    const q = window.__qa; q.recording = false;
    const f = q.frames; const d = f.slice(1).map((t, i) => t - f[i]); const dur = f.length > 1 ? f[f.length - 1] - f[0] : 1;
    const w = []; for (let s = f[0]; s < f[f.length - 1] - 500; s += 250) w.push(f.filter((t) => t >= s && t < s + 500).length * 2);
    const lt = q.longtasks;
    return { avgFps: Math.round((d.length / dur) * 10000) / 10, minWindowFps: w.length ? Math.min(...w) : 0,
      droppedPct: Math.round((d.filter((x) => x > 1000 / 30).length / Math.max(1, d.length)) * 1000) / 10,
      longTasks: lt.length, longTaskMs: Math.round(lt.reduce((s, x) => s + Math.max(0, x.dur - 50), 0)),
      maxLongTask: Math.round(Math.max(0, ...lt.map((x) => x.dur))),
      tasks: lt.map((x) => [Math.round(x.start - q.t0), Math.round(x.dur)]), scrolledPx: Math.round(scrollY),
      motion: document.documentElement.dataset.motion, lenis: document.documentElement.classList.contains("lenis") };
  });
}

function summarise(profile) {
  const self = new Map(); const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const dt = profile.timeDeltas; profile.samples.forEach((id, i) => {
    const n = byId.get(id); const cf = n.callFrame;
    const key = `${cf.functionName || "(anon)"} ${cf.url.split("/").pop()}:${cf.lineNumber}`;
    self.set(key, (self.get(key) || 0) + (dt[i] || 0) / 1000);
  });
  return [...self.entries()].filter(([k]) => !/^\((idle|program|garbage collector)\)/.test(k) || true).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${v.toFixed(0)}ms ${k}`);
}

const browser = await chromium.launch();
const results = [];
try {
  for (const mode of ["desktop-1440", "mobile-pixel7"]) {
    const mobile = mode.startsWith("mobile");
    for (let r = 0; r < RUNS; r++) {
      const ctx = await browser.newContext(mobile ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage(); await page.addInitScript(INIT);
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.QA_CPU_THROTTLE || (mobile ? 4 : 1)) });
      await page.goto(base + pth, { waitUntil: "load", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      if (CPU) { await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 200 }); await cdp.send("Profiler.start"); }
      const p = await scroll(page, mobile);
      if (CPU) { const { profile } = await cdp.send("Profiler.stop"); p.top = summarise(profile); }
      results.push({ path: pth, mode, run: r, ...p });
      console.log(`${mode} #${r}: avg ${p.avgFps} worst ${p.minWindowFps} dropped ${p.droppedPct}% LT ${p.longTasks} (${p.longTaskMs}ms, max ${p.maxLongTask}) tasks=${JSON.stringify(p.tasks)} scrolled ${p.scrolledPx} motion=${p.motion} lenis=${p.lenis}`);
      if (p.top) console.log("  " + p.top.join("\n  "));
      await ctx.close();
    }
  }
} finally { await browser.close(); }
if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

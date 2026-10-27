#!/usr/bin/env node
/**
 * Motion & 3D perf harness (deliverable d). Requires `next build && next start -p 3100`.
 *   node scripts/motion-perf.mjs [baseUrl] > docs/motion/perf-results.json
 * Per route x viewport: LCP (+element), CLS (load + full scroll), long tasks / TBT,
 * INP proxy (max Event Timing duration over scripted hover/click), JS transferred
 * (first load = before `load`; total = after scroll + idle), 3D/Rive requests before
 * DOMContentLoaded (REQ-149 regex) and whether the 3D chunk was fetched at all.
 * Also computes a static per-route gzip budget from .next/app-build-manifest.json.
 * CAVEAT: headless Chromium = SwiftShader software GL; capabilities.ts rejects it
 * (failIfMajorPerformanceCaveat) so the hero stays on the poster unless ?force3d=1.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const base = process.argv[2] ?? "http://localhost:3100";
const ROOT = process.env.WEB_ROOT ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
// [route, app-build-manifest keys (layouts + page)]
const SITE = ["/layout", "/(site)/layout"];
const ROUTE_KEYS = {
  "/": [...SITE, "/(site)/page"],
  "/services": [...SITE, "/(site)/services/page"],
  "/faq": [...SITE, "/(site)/faq/page"],
  "/shop": [...SITE, "/(site)/shop/page"],
  "/instant-quote": [...SITE, "/(site)/instant-quote/page"],
  "/sell-your-device": [...SITE, "/(site)/sell-your-device/page"],
  "/policies/privacy": [...SITE, "/(site)/policies/[slug]/page"],
  "/schedule-repair": [...SITE, "/(site)/schedule-repair/page"],
  "/home-internet": [...SITE, "/(site)/home-internet/page"],
  "/motion-lab": ["/layout", "/motion-lab/layout", "/motion-lab/page"],
};
const ROUTES = Object.keys(ROUTE_KEYS);
const VIEWPORTS = [
  [375, 812], [768, 1024], [1280, 800], [1440, 900], [1920, 1080],
];
const HEAVY = /(three|@react-three|r3f|spline|\.glb|\.gltf|\.splinecode|draco|rive\.wasm)/i;

const chunkDir = path.join(ROOT, ".next/static/chunks");
const allChunks = fs.readdirSync(chunkDir, { recursive: true }).map(String).filter((f) => f.endsWith(".js"));
const has = (f, needle) => fs.readFileSync(path.join(chunkDir, f), "utf8").includes(needle);
const THREE_CHUNKS = new Set(allChunks.filter((f) => has(f, "WebGLRenderer")).map((f) => path.basename(f)));
const RIVE_CHUNKS = new Set(allChunks.filter((f) => has(f, "RuntimeLoader")).map((f) => path.basename(f)));
const gz = (rel) => zlib.gzipSync(fs.readFileSync(path.join(ROOT, ".next", rel)), { level: 9 }).length;
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, ".next/app-build-manifest.json"), "utf8")).pages;
const staticBudget = {};
for (const r of ROUTES) {
  const files = new Set(ROUTE_KEYS[r].flatMap((k) => manifest[k] ?? []));
  const js = [...files].filter((f) => f.endsWith(".js"));
  staticBudget[r] = {
    firstLoadJsGzKB: +(js.reduce((a, f) => a + gz(f), 0) / 1024).toFixed(1),
    threeInFirstLoad: js.some((f) => THREE_CHUNKS.has(path.basename(f))),
    riveInFirstLoad: js.some((f) => RIVE_CHUNKS.has(path.basename(f))),
  };
}
const lazyGzKB = (set) => +([...set].reduce((a, f) => a + gz(path.join("static/chunks", allChunks.find((c) => path.basename(c) === f))), 0) / 1024).toFixed(1);

const INIT = () => {
  const w = window;
  w.__perf = { lcp: 0, lcpEl: "", cls: 0, long: [], inp: 0 };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      w.__perf.lcp = e.startTime;
      const el = e.element;
      w.__perf.lcpEl = el ? `${el.tagName.toLowerCase()}${el.dataset?.testid ? `[data-testid=${el.dataset.testid}]` : ""}${el.id ? "#" + el.id : ""}` : "";
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) w.__perf.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__perf.long.push(e.duration); }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) w.__perf.inp = Math.max(w.__perf.inp, e.duration); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
};

async function run(browser, route, [w, h], query = "") {
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.addInitScript(INIT);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  const reqs = new Map();
  let phase = "pre-dcl";
  cdp.on("Network.requestWillBeSent", (e) => reqs.set(e.requestId, { url: e.request.url, type: e.type, phase, bytes: 0 }));
  cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
  page.on("domcontentloaded", () => { phase = "pre-load"; });
  page.on("load", () => { phase = "post-load"; });
  await page.goto(base + route + query, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const firstJs = [...reqs.values()].filter((r) => r.type === "Script" && r.phase !== "post-load");
  const firstKB = +(firstJs.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(1);
  // interactions (INP proxy)
  const card = page.locator("[data-rive-host], [data-rive]").first();
  if (await card.count()) { await card.scrollIntoViewIfNeeded().catch(() => {}); await card.hover().catch(() => {}); }
  const trig = page.locator("[data-faq] summary, [data-accordion] button").first();
  if (await trig.count()) { await trig.scrollIntoViewIfNeeded().catch(() => {}); await trig.click().catch(() => {}); await page.waitForTimeout(400); }
  const next = page.getByRole("button", { name: /next|continue/i }).first();
  if (await next.count()) await next.click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += h * 0.8) { await page.mouse.wheel(0, h * 0.8); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  const p = await page.evaluate(() => window.__perf);
  const all = [...reqs.values()];
  const js = all.filter((r) => r.type === "Script");
  const base3 = (r) => path.basename(new URL(r.url).pathname);
  const res = {
    route: route + query, viewport: `${w}x${h}`,
    lcpMs: Math.round(p.lcp), lcpEl: p.lcpEl, cls: +p.cls.toFixed(4),
    longTasks: p.long.length, tbtMs: Math.round(p.long.reduce((a, d) => a + Math.max(0, d - 50), 0)), maxLongTaskMs: Math.round(Math.max(0, ...p.long)),
    inpProxyMs: Math.round(p.inp),
    firstLoadJsKB: firstKB, totalJsKB: +(js.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(1),
    heavyBeforeDCL: all.filter((r) => r.phase === "pre-dcl" && HEAVY.test(r.url)).map((r) => r.url),
    threeChunkFirstLoad: firstJs.some((r) => THREE_CHUNKS.has(base3(r))),
    threeChunkFetched: js.some((r) => THREE_CHUNKS.has(base3(r))),
    riveWasmFetched: all.some((r) => /rive\.wasm/.test(r.url)),
    hero3d: await page.locator("[data-3d]").first().getAttribute("data-3d", { timeout: 500 }).catch(() => null),
  };
  await ctx.close();
  return res;
}

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const rows = [];
for (const r of ROUTES) for (const vp of VIEWPORTS) { rows.push(await run(browser, r, vp)); process.stderr.write("."); }
for (const vp of [[375, 812], [1440, 900]]) rows.push(await run(browser, "/", vp, "?force3d=1"));
await browser.close();
console.log(JSON.stringify({ base, date: new Date().toISOString(), threeChunks: [...THREE_CHUNKS], threeLazyGzKB: lazyGzKB(THREE_CHUNKS), riveChunks: [...RIVE_CHUNKS], riveLazyGzKB: lazyGzKB(RIVE_CHUNKS), staticBudget, rows }, null, 2));

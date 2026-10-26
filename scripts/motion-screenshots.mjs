#!/usr/bin/env node
/**
 * Deliverable e: normal vs prefers-reduced-motion screenshots of the motion showpieces on the
 * real homepage (+ /faq GSAP accordion) at 375 and 1440. Output: docs/reduced-motion/.
 *   node scripts/motion-screenshots.mjs [baseUrl]
 * Each shot = viewport after scrolling the section to the top and letting reveals settle
 * (pinned sections can't be element-screenshotted). "how" is captured mid-pin (step 2 active).
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3100";
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../docs/reduced-motion");
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = [
  ["hero", "/", "[data-testid=hero]"],
  ["services-grid", "/", "#services"],
  ["how-it-works", "/", "#how-it-works"],
  ["marquee", "/", "#brands"],
  ["accordion-home", "/", "#faq"],
  ["accordion-faq-gsap", "/faq", "[data-accordion]"],
];

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const log = [];
for (const mode of ["normal", "reduced"]) {
  for (const w of [375, 1440]) {
    const h = w < 768 ? 812 : 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: mode === "reduced" ? "reduce" : "no-preference", deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const [name, route, sel] of SHOTS) {
      await page.goto(base + route, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      const el = page.locator(sel).first();
      if (!(await el.count())) { log.push(`${mode} ${w} ${name}: MISSING ${sel}`); continue; }
      const geo = await el.evaluate((n) => {
        const sp = n.closest(".pin-spacer") ?? n.querySelector(".pin-spacer");
        const pinEl = sp?.firstElementChild;
        return {
          top: (sp ?? n).getBoundingClientRect().top + window.scrollY,
          dist: sp && pinEl ? sp.getBoundingClientRect().height - pinEl.getBoundingClientRect().height : 0,
          startOffset: window.innerWidth < 768 ? 64 : window.innerHeight * 0.3,
        };
      });
      let y = Math.max(0, geo.top - 72);
      // Into the pin (~step 2): 40 % of the pinned distance. No pin under reduced motion.
      if (name === "how-it-works" && geo.dist > 0) y = geo.top - geo.startOffset + geo.dist * 0.4;
      // Jump to just before the target, then ease the last stretch: an instant jump carries a huge
      // velocity and ScrollTrigger's snap would project it to the pin's end.
      await page.evaluate(async (yy) => {
        const l = window.__QA__?.lenis;
        if (!l) return window.scrollTo(0, yy);
        l.scrollTo(Math.max(0, yy - 240), { immediate: true, force: true });
        await new Promise((r) => setTimeout(r, 300));
        l.scrollTo(yy, { duration: 0.9, force: true });
      }, y);
      await page.waitForTimeout(1800);
      if (name.startsWith("accordion")) {
        const btn = el.locator("button[aria-expanded]").first();
        if (await btn.count()) { await btn.click(); await page.waitForTimeout(700); }
      }
      const file = `${name}-${w}-${mode}.png`;
      await page.screenshot({ path: path.join(OUT, file) });
      const info = await page.evaluate(() => ({ motion: document.documentElement.dataset.motion, lenis: document.documentElement.classList.contains("lenis"), infinite: document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === "running").length }));
      log.push(`${file} data-motion=${info.motion} lenis=${info.lenis} runningInfiniteCSSAnims=${info.infinite}`);
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, "INDEX.txt"), log.join("\n") + "\n");
console.log(log.join("\n"));

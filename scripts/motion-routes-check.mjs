// Per-route Motion hook wiring + reduced-motion + CLS check (Frontend-ready routes).
// Usage: node scripts/motion-routes-check.mjs <base> <out.json>
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3123";
const outFile = process.argv[3] ?? "/tmp/motion-routes.json";
const ROUTES = process.env.ROUTES?.split(",") ?? ["/", "/instant-quote", "/sell-your-device", "/services", "/policies/privacy", "/policies/terms", "/policies/shipping-return", "/shop", "/faq", "/schedule-repair", "/home-internet", "/about", "/financing", "/shop/__first__"];
const WIDTHS = process.env.WIDTHS?.split(",").map(Number) ?? [375, 768, 1280, 1440];
const HOOKS = {
  split: '[data-animate="split-heading"], [data-split]',
  stagger: '[data-animate="stagger"], [data-stagger]',
  staggerGroup: "[data-stagger-group]",
  reveal: '[data-animate="reveal"]',
  scrollTrigger: "[data-scroll-trigger]",
  steps: '[data-pin="how"], [data-animate="steps"]',
  faq: "[data-faq]",
  tocSpy: '[data-animate="toc-spy"]',
  tocLink: "a[data-toc-link]",
  shimmer: '[data-animate="shimmer"]',
  countup: '[data-animate="countup"]',
  multiStep: "[data-direction], [data-testid='form-progress']",
  valueProps: "[data-testid='value-props'], [data-value-props]",
};

const browser = await chromium.launch();
const results = [];
for (const reduced of [false, true]) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    for (let route of ROUTES) {
      const page = await ctx.newPage();
      await page.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      if (route === "/shop/__first__") {
        // first PDP link on /shop (product slugs come from the CMS/fixtures)
        await page.goto(base + "/shop", { waitUntil: "load" });
        route = (await page.$$eval('a[href^="/shop/"]', (as) => as.map((a) => a.getAttribute("href")).find((h) => h.split("/").length === 3 && !h.includes("?")))) ?? "/shop";
      }
      const resp = await page.goto(base + route, { waitUntil: "load" });
      await page.waitForTimeout(reduced ? 600 : 1200);
      const r = { route, w, reduced, status: resp?.status() };
      r.motion = await page.evaluate(() => document.documentElement.dataset.motion);
      r.ready = await page.evaluate(() => document.documentElement.hasAttribute("data-motion-ready"));
      r.counts = await page.evaluate((H) => Object.fromEntries(Object.entries(H).map(([k, s]) => [k, document.querySelectorAll(s).length]).filter(([, n]) => n)), HOOKS);
      // Bound = engine marked hook containers (data-animated) — only when motion is OK.
      r.bound = await page.evaluate(() => {
        const sel = '[data-animate="split-heading"], [data-split], [data-animate="stagger"], [data-stagger], [data-stagger-group], [data-animate="reveal"], [data-scroll-trigger]';
        const all = [...document.querySelectorAll(sel)];
        return { total: all.length, animated: all.filter((e) => e.hasAttribute("data-animated")).length };
      });
      // Scroll the page smoothly to the bottom (triggers every ScrollTrigger) then check visibility.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.6;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, document.documentElement.scrollHeight);
        await new Promise((r) => setTimeout(r, 900));
      });
      r.hiddenAfterScroll = await page.evaluate(() => {
        const sel = '[data-animate="reveal"], [data-scroll-trigger], [data-animate="stagger"] > *, [data-stagger] > *, [data-stagger-group] > *, [data-animate="split-heading"], [data-step]';
        return [...document.querySelectorAll(sel)].filter((e) => {
          const cs = getComputedStyle(e);
          return e.getClientRects().length && (parseFloat(cs.opacity) < 0.99 || cs.visibility === "hidden");
        }).length;
      });
      // Toc spy: scroll to the 3rd target, check aria-current + indicator.
      if (r.counts.tocLink) {
        r.toc = await page.evaluate(async () => {
          const ids = [...new Set([...document.querySelectorAll("a[data-toc-link]")].map((a) => a.dataset.tocLink))];
          const id = ids[Math.min(2, ids.length - 1)];
          const t = document.getElementById(id);
          window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 120);
          await new Promise((r) => setTimeout(r, 700));
          const cur = [...document.querySelectorAll('a[aria-current="true"][data-toc-link]')].map((a) => a.dataset.tocLink);
          const bar = document.querySelector("[data-toc-indicator][data-visible]");
          const link = document.querySelector(`[data-animate="toc-spy"] a[data-toc-link="${id}"]`);
          let barAligned = null;
          if (bar && link) barAligned = Math.abs(bar.getBoundingClientRect().top - link.getBoundingClientRect().top) < 2;
          return { expected: id, current: [...new Set(cur)], currentCount: cur.length, barVisible: !!bar, barAligned, barTransition: bar ? getComputedStyle(bar).transitionDuration : null };
        });
      }
      // Shimmer: computed pseudo animation on the first (or an injected) skeleton block.
      r.shimmer = await page.evaluate(() => {
        let el = document.querySelector('[data-animate="shimmer"]');
        let injected = false;
        if (!el) {
          el = document.createElement("div");
          el.setAttribute("data-animate", "shimmer");
          el.style.cssText = "width:40px;height:10px";
          document.body.appendChild(el);
          injected = true;
        }
        const a = getComputedStyle(el, "::after").animationName;
        if (injected) el.remove();
        return { animation: a, injected };
      });
      r.cls = await page.evaluate(() => Math.round(window.__cls * 10000) / 10000);
      r.inlineOpacityZero = reduced
        ? await page.evaluate(() => [...document.querySelectorAll("[style]")].filter((e) => /opacity:\s*0[;\s]|visibility:\s*hidden/.test(e.getAttribute("style")) && e.getClientRects().length && !e.closest("[aria-hidden='true'],[data-drawer]")).length)
        : undefined;
      results.push(r);
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
for (const r of results)
  console.log(
    `${r.reduced ? "RM " : "   "}${String(r.w).padStart(4)} ${r.route.padEnd(26)} ${r.status} motion=${r.motion} bound=${r.bound.animated}/${r.bound.total} hidden=${r.hiddenAfterScroll} cls=${r.cls} shimmer=${r.shimmer.animation}${r.toc ? ` toc=${r.toc.expected}:${r.toc.current.join("|")} bar=${r.toc.barVisible}/${r.toc.barAligned}/${r.toc.barTransition}` : ""}${r.inlineOpacityZero !== undefined ? ` inline0=${r.inlineOpacityZero}` : ""} ${JSON.stringify(r.counts)}`,
  );

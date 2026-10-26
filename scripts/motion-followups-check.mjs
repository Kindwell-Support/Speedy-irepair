#!/usr/bin/env node
/**
 * Motion follow-up checks (2026-10-27). Run against a `next start` server:
 *   node scripts/motion-followups-check.mjs <baseUrl> [label]
 * Writes docs/motion/followups-<label>.json and How It Works screenshots to docs/motion/screens/.
 * Checks: How It Works mode per width (pin >=1280 / stack below / reduced static), the window.__QA__
 * presence, QA data-section / data-testid hooks, MultiStepForm step transition, LogoLoop (no inline
 * style, moving, reduced pause), Drawer a11y, CountUp.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3123";
const label = process.argv[3] ?? "run";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SHOTS = path.join(ROOT, "docs/motion/screens");
fs.mkdirSync(SHOTS, { recursive: true });
const out = { base, label, at: new Date().toISOString() };
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });

async function ctxPage(w, h, reduced = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? "reduce" : "no-preference" });
  return [ctx, await ctx.newPage()];
}
const smoothTo = (page, y) =>
  page.evaluate(async (y) => {
    const l = window.__QA__?.lenis;
    if (l) { l.scrollTo(y - 240, { immediate: true }); await new Promise((r) => setTimeout(r, 120)); l.scrollTo(y, { duration: 0.9 }); }
    else window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 1400));
  }, y);

/* 1. How It Works per width */
out.howItWorks = [];
for (const [w, reduced] of [[375, false], [768, false], [1024, false], [1279, false], [1280, false], [1440, false], [768, true], [1440, true]]) {
  const h = w < 768 ? 812 : 900;
  const [ctx, page] = await ctxPage(w, h, reduced);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(1800);
  const sec = page.locator('[data-testid="how-it-works"]').first();
  const top = await sec.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
  await smoothTo(page, Math.max(0, top - 80));
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="how-it-works"]');
    const pin = s?.querySelector('[data-pin="how"]');
    const steps = Array.from(s?.querySelectorAll("[data-step]") ?? []);
    return {
      mode: s?.getAttribute("data-steps-mode") ?? null,
      pinnedSection: s?.getAttribute("data-pinned") ?? null,
      pinnedInner: pin?.getAttribute("data-pinned") ?? null,
      pinSpacers: document.querySelectorAll(".pin-spacer").length,
      qaReq026: document.querySelectorAll('.pin-spacer, [data-testid="how-it-works"][data-pinned="true"]').length > 0,
      stepOpacity: steps.map((e) => +getComputedStyle(e).opacity),
      stepsInView: steps.filter((e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).length,
    };
  });
  const file = `how-it-works-${w}${reduced ? "-reduced" : ""}-${label}.png`;
  await page.screenshot({ path: path.join(SHOTS, file) });
  out.howItWorks.push({ w, reduced, ...info, screenshot: `docs/motion/screens/${file}` });
  if (!reduced && w === 1440) {
    // pinned: progress through the pin, check active step + bar
    const prog = await page.evaluate(async () => {
      const st = window.__QA__?.ScrollTrigger?.getAll().find((t) => t.pin);
      if (!st) return null; // production build: no __QA__
      const res = [];
      // smooth (not immediate) scrolls: an instant jump carries huge velocity and snap projects it to the end
      for (const f of [0, 1 / 3, 2 / 3, 1]) {
        window.__QA__.lenis.scrollTo(st.start + (st.end - st.start) * f, { duration: 0.8 });
        await new Promise((r) => setTimeout(r, 1500));
        const bar = document.querySelector("[data-steps-progress]");
        res.push({ f, active: Array.from(document.querySelectorAll("[data-step]")).findIndex((e) => e.hasAttribute("data-active")), bar: bar ? getComputedStyle(bar).transform : null });
      }
      return { pinDistanceVh: +((st.end - st.start) / innerHeight).toFixed(2), res };
    });
    out.howItWorksPinProgress = prog;
    await page.evaluate(async () => {
      const st = window.__QA__?.ScrollTrigger?.getAll().find((t) => t.pin);
      if (!st) return;
      window.__QA__.lenis.scrollTo(st.start + (st.end - st.start) / 3, { duration: 0.8 });
      await new Promise((r) => setTimeout(r, 1500));
    });
    await page.screenshot({ path: path.join(SHOTS, `how-it-works-1440-step2-${label}.png`) });
  }
  await ctx.close();
}

/* 2. __QA__ + hooks */
{
  const [ctx, page] = await ctxPage(1440, 900);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  out.qaGlobal = await page.evaluate(() => ({
    present: typeof window.__QA__ === "object" && window.__QA__ !== null,
    keys: window.__QA__ ? Object.keys(window.__QA__) : [],
    htmlLenis: document.documentElement.classList.contains("lenis"),
  }));
  const SECTIONS = ["banner", "hero", "services", "how-it-works", "brands", "why-choose-us", "testimonials", "promotions", "faq", "location", "newsletter", "footer"];
  const HOME_IDS = ["announcement-banner", "logo", "nav-toggle", "hero", "hero-poster", "service-card", "how-it-works", "brands-marquee", "testimonials", "testimonial", "testimonial-placeholder", "star-rating", "promotions", "map-embed", "newsletter-form"];
  out.homeHooks = await page.evaluate(([S, I]) => ({
    sections: Object.fromEntries(S.map((s) => [s, document.querySelectorAll(`[data-section="${s}"]`).length])),
    testids: Object.fromEntries(I.map((s) => [s, document.querySelectorAll(`[data-testid="${s}"]`).length])),
    heroPosterInHero: !!document.querySelector('[data-testid="hero"] [data-testid="hero-poster"]'),
    skipLink: !!document.querySelector('a[href="#main"]'),
    main: !!document.querySelector("#main"),
    faqButtons: Array.from(document.querySelectorAll('[data-section="faq"] button')).map((b) => [b.hasAttribute("aria-expanded"), b.hasAttribute("aria-controls")]).slice(0, 3),
    cursorFollower: document.querySelectorAll("[data-cursor-follower], .cursor-follower").length,
  }), [SECTIONS, HOME_IDS]);
  // LogoLoop
  out.logoLoop = await page.evaluate(async () => {
    const root = document.querySelector(".logoloop");
    if (!root) return { found: false };
    const track = root.firstElementChild;
    root.scrollIntoView();
    await new Promise((r) => setTimeout(r, 600));
    const t1 = getComputedStyle(track).transform;
    await new Promise((r) => setTimeout(r, 700));
    const t2 = getComputedStyle(track).transform;
    const cs = getComputedStyle(root);
    return { found: true, styleAttr: root.getAttribute("style"), mask: (cs.maskImage || cs.webkitMaskImage || "").slice(0, 40), gap: cs.getPropertyValue("--logoloop-gap"), moving: t1 !== t2 };
  });
  for (const r of ["/instant-quote", "/sell-your-device", "/home-internet", "/shop"]) {
    await page.goto(base + r, { waitUntil: "load" });
    await page.waitForTimeout(800);
    out[`hooks${r}`] = await page.evaluate(() =>
      Object.fromEntries(["quote-form", "trade-in-form", "form-progress", "form-option", "field-error", "form-success", "product-card", "contact-form", "map-embed", "service-section"].map((s) => [s, document.querySelectorAll(`[data-testid="${s}"]`).length]).filter(([, n]) => n)),
    );
  }
  await ctx.close();
}
/* reduced LogoLoop */
{
  const [ctx, page] = await ctxPage(1440, 900, true);
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  out.logoLoopReduced = await page.evaluate(() => ({ loop: !!document.querySelector(".logoloop"), staticRow: !!document.querySelector('[data-marquee="static"]') }));
  await ctx.close();
}

/* 3. MultiStepForm */
for (const reduced of [false, true]) {
  const [ctx, page] = await ctxPage(1440, 900, reduced);
  await page.goto(base + "/instant-quote", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const opt = page.locator('[data-testid="form-option"]').first();
  let res = { optionFound: !!(await opt.count()) };
  if (res.optionFound) {
    await opt.click();
    const before = await page.evaluate(() => document.querySelector("[data-step-id]")?.getAttribute("data-step-id"));
    const next = page.getByRole("button", { name: /next|continue/i }).first();
    if (await next.count()) {
      const samples = page.evaluate(async () => {
        const s = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 600) {
          const els = Array.from(document.querySelectorAll("[data-step-id]"));
          s.push({ t: Math.round(performance.now() - t0), n: els.map((e) => `${e.getAttribute("data-step-id")}:${getComputedStyle(e).transform}:${(+getComputedStyle(e).opacity).toFixed(2)}`) });
          await new Promise((r) => requestAnimationFrame(r));
        }
        const bar = document.querySelector('[data-testid="form-progress"] span');
        return { s: s.filter((_, i) => i % 4 === 0), dir: document.querySelector("[data-multistep]")?.getAttribute("data-direction"), bar: bar ? getComputedStyle(bar).transform : null };
      });
      await next.click();
      const r = await samples;
      res = { ...res, before, after: await page.evaluate(() => document.querySelector("[data-step-id]")?.getAttribute("data-step-id")), ...r };
    }
  }
  out[`multiStep${reduced ? "Reduced" : ""}`] = res;
  await ctx.close();
}

/* 4. Drawer + CountUp (motion-lab) */
{
  const [ctx, page] = await ctxPage(1440, 900);
  const resp = await page.goto(base + "/motion-lab/drawer", { waitUntil: "load" });
  out.drawer = { status: resp?.status() };
  if (resp?.ok()) {
    await page.waitForTimeout(1200);
    const opener = page.getByRole("button", { name: "Add to cart" });
    await opener.click();
    await page.waitForTimeout(400);
    out.drawer.open = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return {
        ariaModal: d?.getAttribute("aria-modal"),
        name: d?.getAttribute("aria-labelledby") ? document.getElementById(d.getAttribute("aria-labelledby"))?.textContent : d?.getAttribute("aria-label"),
        focusInside: !!d?.contains(document.activeElement),
        focused: document.activeElement?.textContent?.trim(),
        inertOthers: Array.from(document.body.children).filter((e) => !e.hasAttribute("data-drawer") && e.tagName !== "SCRIPT").every((e) => e.inert),
        htmlLock: document.documentElement.hasAttribute("data-drawer-open"),
        panelTransform: d ? getComputedStyle(d).transform : null,
      };
    });
    for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
    out.drawer.trapAfter5Tabs = await page.evaluate(() => !!document.querySelector('[role="dialog"]')?.contains(document.activeElement));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(450);
    out.drawer.afterEscape = await page.evaluate(() => ({
      dialog: !!document.querySelector('[role="dialog"]'),
      focusReturned: document.activeElement?.textContent?.trim(),
      inertCleared: Array.from(document.body.children).every((e) => !e.inert),
    }));
    const html = await (await fetch(base + "/motion-lab/drawer")).text();
    out.countUp = { ssrFinal: html.includes(">40<") };
  }
  await ctx.close();
}
{
  // CountUp below the fold (short viewport), then scrolled into view
  const [ctx, page] = await ctxPage(1440, 320);
  const resp = await page.goto(base + "/motion-lab/drawer", { waitUntil: "load" });
  if (resp?.ok()) {
    await page.waitForTimeout(1200);
    out.countUp.samples = await page.evaluate(async () => {
      const el = document.querySelector("[data-countup]");
      const pre = `${el.querySelector("[aria-hidden] span")?.textContent}:${el.getAttribute("data-countup-state")}`;
      el.scrollIntoView({ block: "center" });
      const s = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 1000) {
        s.push(`${Math.round(performance.now() - t0)}:${el.querySelector("[aria-hidden] span")?.textContent}:${el.getAttribute("data-countup-state")}`);
        await new Promise((r) => setTimeout(r, 80));
      }
      return { pre, s, sr: el.querySelector(".sr-only")?.textContent };
    });
  }
  await ctx.close();
}
{
  const [ctx, page] = await ctxPage(1440, 900, true);
  const resp = await page.goto(base + "/motion-lab/drawer", { waitUntil: "load" });
  if (resp?.ok()) {
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.waitForTimeout(40);
    out.drawerReduced = await page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); return { transform: d && getComputedStyle(d).transform, opacity: d && getComputedStyle(d).opacity }; });
    out.countUpReduced = await page.evaluate(() => { const el = document.querySelector("[data-countup]"); el.scrollIntoView(); return el.querySelector("[aria-hidden] span")?.textContent; });
  }
  await ctx.close();
}

await browser.close();
const file = path.join(ROOT, `docs/motion/followups-${label}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

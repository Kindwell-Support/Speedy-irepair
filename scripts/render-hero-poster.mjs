#!/usr/bin/env node
/**
 * Renders the hero LCP poster from the SAME procedural PhoneScene used live, so poster and
 * 3D match pixel-for-pixel at the hand-off cross-fade.
 *   1. pnpm build && pnpm start -p 3100   (or any running server)
 *   2. node scripts/render-hero-poster.mjs [baseUrl]
 * Writes public/hero/phone-poster.png (960x1200, transparent). Convert to webp/avif with
 * scripts/encode-hero-poster.py (Pillow) or squoosh.
 */
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3100";
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/hero/phone-poster.png");

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 1300 }, deviceScaleFactor: 1 });
await page.goto(`${base}/motion-lab/poster?force3d=1`, { waitUntil: "networkidle" });
await page.waitForSelector("[data-poster-ready]", { timeout: 60_000 });
await page.addStyleTag({ content: "html,body,main,body *{background:transparent!important} nav,header{display:none!important}" });
await page.waitForTimeout(1500);
// Clip screenshot instead of element.screenshot: the live canvas never reports "stable" on SwiftShader.
const box = await page.locator("[data-poster-ready]").boundingBox();
if (!box) throw new Error("poster stage not found");
await page.screenshot({ path: out, omitBackground: true, clip: box, timeout: 120_000 });
await browser.close();
console.log("wrote", out);

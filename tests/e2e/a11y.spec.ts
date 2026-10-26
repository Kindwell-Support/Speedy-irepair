import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Architect a11y gate: axe (WCAG 2.1 A/AA) on every static route, all 5 viewports.
 * Third-party iframes are excluded (they load behind click-to-load facades anyway).
 * Spec target: Lighthouse Accessibility > 95; this is the blocking check in CI.
 */
const PATHS = [
  "/",
  "/services",
  "/shop",
  "/sell-your-device",
  "/instant-quote",
  "/schedule-repair",
  "/faq",
  "/about",
  "/financing",
  "/home-internet",
  "/policies/shipping-return",
  "/policies/privacy",
  "/policies/terms",
];

for (const path of PATHS) {
  test(`axe: ${path} has no serious/critical violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // deterministic: content visible, no tweens
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude("iframe").analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}

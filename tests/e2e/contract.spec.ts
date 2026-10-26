import { expect, test } from "@playwright/test";
import { LLMS_TXT_DEFAULT } from "../../lib/seo/llms-defaults";

/** Architect contract checks: llms.txt byte-exact vs PROJECT_SPEC §5.3 (fixture/Sanity seed), root files, JSON-LD present. */
test.describe("root files", () => {
  test("/llms.txt matches the spec seed exactly", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    expect(await res.text()).toBe(LLMS_TXT_DEFAULT);
  });

  test("/llms-full.txt starts with llms.txt and is longer", async ({ request }) => {
    const [short, full] = await Promise.all([request.get("/llms.txt"), request.get("/llms-full.txt")]);
    const s = await short.text();
    const f = await full.text();
    expect(f.startsWith(s.trimEnd())).toBe(true);
    expect(f.length).toBeGreaterThan(s.length);
  });

  test("/sitemap.xml is valid XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("<urlset");
  });
});

for (const path of ["/", "/services", "/faq", "/shop"]) {
  test(`JSON-LD present on ${path}`, async ({ page }) => {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) expect(() => JSON.parse(b)).not.toThrow();
  });
}

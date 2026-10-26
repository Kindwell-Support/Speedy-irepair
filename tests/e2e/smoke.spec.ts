import { expect, test } from "@playwright/test";

/**
 * DevOps smoke suite. REQ-001: all 14 routes in PROJECT_SPEC §2.0 return 200.
 * R04 (/shop/[product]) uses the first product link found on /shop (works with the
 * fixture adapter and with Shopify), or E2E_PRODUCT_SLUG if set.
 */
const PRODUCT_PLACEHOLDER = "__first_product__";

const ROUTES: Array<[id: string, path: string]> = [
  ["R01", "/"],
  ["R02", "/services"],
  ["R03", "/shop"],
  ["R04", `/shop/${PRODUCT_PLACEHOLDER}`],
  ["R05", "/sell-your-device"],
  ["R06", "/instant-quote"],
  ["R07", "/schedule-repair"],
  ["R08", "/faq"],
  ["R09", "/about"],
  ["R10", "/financing"],
  ["R11", "/home-internet"],
  ["R12", "/policies/shipping-return"],
  ["R13", "/policies/privacy"],
  ["R14", "/policies/terms"],
];

test("route map covers all 14 spec routes", () => {
  expect(ROUTES).toHaveLength(14);
});

for (const [id, path] of ROUTES) {
  test(`${id} ${path} returns 200 and has one H1`, async ({ page }) => {
    let url = path;
    if (path.includes(PRODUCT_PLACEHOLDER)) {
      let slug = process.env.E2E_PRODUCT_SLUG;
      if (!slug) {
        await page.goto("/shop");
        const href = await page.locator('a[href^="/shop/"]').first().getAttribute("href");
        expect(href, "no product link found on /shop").toBeTruthy();
        slug = href!.replace(/^\/shop\//, "").split(/[?#]/)[0];
      }
      url = `/shop/${slug}`;
    }
    const res = await page.goto(url);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

/** Staging-noindex rule (spec §5). Skip only when deliberately testing production. */
test.describe("non-production is noindex", () => {
  test.skip(process.env.EXPECT_INDEXABLE === "1", "production check");

  test("X-Robots-Tag header contains noindex, nofollow", async ({ request }) => {
    const res = await request.get("/");
    const tag = res.headers()["x-robots-tag"] ?? "";
    expect(tag).toContain("noindex");
    expect(tag).toContain("nofollow");
  });

  test("robots.txt disallows all", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/^Disallow: \/\s*$/m);
    expect(body).not.toMatch(/^Allow:/m);
  });

  test("meta robots is noindex", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });
});

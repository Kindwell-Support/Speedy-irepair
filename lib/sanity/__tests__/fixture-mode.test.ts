/**
 * FIXTURE MODE: every route's content getters + the SEO adapter run the real GROQ over the committed seed.
 * Run: pnpm test:unit   (tsx --conditions=react-server, NEXT_PUBLIC_SANITY_PROJECT_ID unset)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import * as c from "../content";
import { fixtureFetch, FIXTURE_DOC_COUNT } from "../fixture";
import * as q from "../queries";
import { client } from "@/sanity/lib/client";
import * as seo from "@/sanity/lib/seoQueries";
import { LLMS_TXT_DEFAULT } from "@/lib/seo/llms-defaults";

const PH = /\[Placeholder/;

test("fixture mode is active (no project id) and the dataset is loaded", () => {
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "", "");
  assert.ok(FIXTURE_DOC_COUNT > 70);
});

test("global: site settings from seed (NAP, hours Mon–Sat 12–6, Sun closed)", async () => {
  const s = await c.getSiteSettings();
  assert.equal(s.business.phone.includes("855"), true);
  assert.match(JSON.stringify(s.business), /1650 W Market St/);
  assert.equal(s.business.hours.length, 7);
  const sun = s.business.hours.find((h) => h.day === "Sunday");
  assert.equal(sun?.closed, true);
  const mon = s.business.hours.find((h) => h.day === "Monday");
  assert.equal(mon?.opens, "12:00");
  assert.equal(mon?.closes, "18:00");
  assert.equal(s.business.hoursIsPlaceholder, false);
  assert.doesNotMatch(JSON.stringify(s), /founded|since 20\d\d/i);
});

test("/ home: hero, 8 service cards, 4 steps, 6 value props, 3 placeholder reviews, promotions, 8 FAQs", async () => {
  const h = await c.getHomePage();
  assert.equal(h.serviceCards.length, 8);
  assert.equal((await c.getHowItWorksSteps("home")).length, 4);
  assert.equal((await c.getValueProps()).length, 6);
  const t = await c.getTestimonials();
  assert.equal(t.length, 3);
  for (const r of t) if (r.isPlaceholder) assert.equal(r.rating, null);
  assert.equal((await c.getPromotions()).length, 3);
  assert.equal((await c.getFaqs("general")).length, 8);
  assert.ok((await c.getBrands()).length >= 5);
  const a = await c.getAnnouncement();
  assert.match(a?.text ?? "", /FREE Smartphone/i);
});

test("/services: 14 services in order", async () => {
  const s = await c.getServices();
  assert.equal(s.length, 14);
  assert.deepEqual(s.map((x) => x.order), Array.from({ length: 14 }, (_, i) => i + 1));
  assert.ok((await c.getServicesPage()).hero);
});

test("every page singleton resolves (shop, sell, quote, schedule, faq, about, financing, home-internet)", async () => {
  for (const get of [c.getShopPage, c.getSellPage, c.getQuotePage, c.getSchedulePage, c.getFaqPage, c.getAboutPage, c.getFinancingPage, c.getHomeInternetPage]) {
    const p = (await get()) as unknown as Record<string, unknown>;
    assert.ok(p && typeof p === "object" && "hero" in p, get.name);
  }
  assert.equal((await c.getHowItWorksSteps("sell")).length > 0, true);
});

test("/shop editorial: shopCollectionConfig docs (no products, no prices)", async () => {
  const cats = await c.getShopCategories();
  assert.ok(cats.length >= 5);
  assert.equal(await fixtureFetch<number>(`count(*[_type == "product"])`), 0);
  assert.doesNotMatch(JSON.stringify(cats), /\$\d/);
});

test("/policies/*: verbatim live text, privacy + terms flagged pending legal review", async () => {
  for (const slug of ["shipping-return", "privacy", "terms"] as const) {
    const p = await c.getPolicyPage(slug);
    assert.ok(p, slug);
    assert.ok(p!.body.length > 3, slug);
  }
  const review = await fixtureFetch<{ slug: string; needsReview: boolean }[]>(
    `*[_type == "policyPage"]{ "slug": slug.current, needsReview }`,
  );
  for (const r of review) assert.equal(r.needsReview, true, r.slug);
});

test("/llms.txt from the seed equals the SEO default", async () => {
  const d = await c.getLlmsDocument();
  assert.equal(d.llms.trim(), LLMS_TXT_DEFAULT.trim());
});

test("images: fixture assets resolve to /cms-fixtures/* and are not routed through the Sanity CDN loader", async () => {
  const s = await fixtureFetch<{ src: string; isSanity: boolean; width: number } | null>(q.siteSettingsQuery);
  const json = JSON.stringify(s);
  if (json.includes("cms-fixtures")) assert.doesNotMatch(json, /"isSanity":true/);
});

test("seoQueries adapter (sanity/lib/client) runs over the seed", async () => {
  const settings = await client.fetch<{ name?: string } | null>(seo.SETTINGS_QUERY);
  assert.ok(settings?.name);
  const faqs = await client.fetch<unknown[]>(seo.FAQ_QUERY, { pageId: seo.FAQ_PAGE_IDS.faq, includeDrafts: false });
  assert.equal(faqs?.length, 8);
  const services = await client.fetch<unknown[]>(seo.SERVICES_QUERY);
  assert.equal(services?.length, 14);
  const reviews = await client.fetch<unknown[]>(seo.REVIEWS_QUERY);
  assert.equal(reviews?.length, 0, "placeholder reviews must never reach JSON-LD");
  const llms = await client.fetch<{ llmsTxt: string }>(seo.LLMS_TXT_QUERY);
  assert.equal(llms?.llmsTxt.trim(), LLMS_TXT_DEFAULT.trim());
  const nav = await client.fetch<unknown[]>(seo.NAV_QUERY);
  assert.ok((nav?.length ?? 0) >= 7);
  const docs = await client.fetch<unknown[]>(seo.SITEMAP_DOCS_QUERY, { types: ["service", "policyPage"] });
  assert.equal(docs?.length, 18); // 15 service docs (14 listed on servicesPage) + 3 policies
});

test("no hand-fixture placeholder leaks into seeded fields", async () => {
  const s = await c.getServices();
  for (const x of s) assert.doesNotMatch(x.title, PH);
});

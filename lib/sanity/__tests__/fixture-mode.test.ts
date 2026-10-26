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
import * as fx from "../fixtures";
import { tradeInSchema } from "@/lib/forms/schemas";
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
  assert.equal(nav?.length, 8); // 7 header links + Schedule Repair CTA
  const docs = await client.fetch<unknown[]>(seo.SITEMAP_DOCS_QUERY, { types: ["service", "policyPage"] });
  assert.equal(docs?.length, 18); // 15 service docs (14 listed on servicesPage) + 3 policies
});

test("v1.3 fields: nav (7 + Services dropdown), eyebrows, page intro, valueProp stats, contact heading", async () => {
  const s = await c.getSiteSettings();
  assert.equal(s.navigation.primary.length, 7);
  assert.deepEqual(s.navigation.primary.map((l) => l.label), ["Services", "Shop", "Sell Your Device", "Home Internet", "Financing", "FAQ", "About"]);
  assert.equal(s.navigation.primary[0].children?.length, 14);
  assert.equal(s.navigation.headerCta.label, "Schedule Repair");
  const h = await c.getHomePage();
  assert.equal(h.hero.eyebrow, "Akron, Ohio · Walk-ins welcome");
  assert.equal(h.whySection.eyebrow, "Why choose us");
  assert.equal(h.contactSection.heading, "Send us a message.");
  assert.equal(h.newsletter.eyebrow, "Newsletter");
  const vp = await c.getValueProps();
  assert.deepEqual(vp.filter((v) => v.stat).map((v) => v.stat), [{ value: "45", label: "min" }, { value: "90", label: "day" }]);
  const quote = await c.getQuotePage();
  assert.match(quote.intro ?? "", /^Request a smartphone repair quote/);
  assert.match((await c.getSchedulePage()).intro ?? "", /^Book a smartphone repair appointment/);
  assert.equal((await c.getSellPage()).formSection.eyebrow, "Trade-in form"); // v1.5: "· Lead capture" was a design annotation
  assert.equal((await c.getFinancingPage()).faqSection.eyebrow, "Financing FAQ");
  assert.equal((await c.getHomeInternetPage()).signUpSection?.heading, "Sign up for Home Internet.");
  assert.equal((await c.getAboutPage()).contactSection.eyebrow, "Contact");
  assert.equal((await c.getPolicyPage("privacy")).eyebrow, "Policies");
  const promos = await c.getPromotions();
  assert.deepEqual(promos.map((p) => p.cta.label), ["Sign up now", "See the plan", "Apply with Acima"]);
});

test("no hand-fixture placeholder leaks into seeded fields", async () => {
  const s = await c.getServices();
  for (const x of s) assert.doesNotMatch(x.title, PH);
});

/** Raw GROQ result vs Frontend fixture: drop null/undefined/false-external so only real content differences fail. */
const norm = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(norm);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k, x]) => x !== null && x !== undefined && !(k === "external" && x === false))
        .map(([k, x]) => [k, norm(x)]),
    );
  return v;
};

test("v1.4: chrome copy comes from the seed (raw GROQ == Frontend fixture shapes), not back-fill", async () => {
  for (const [kind, pageId, fixture] of [
    ["quote", "instantQuotePage", fx.quoteFlow],
    ["tradein", "sellYourDevicePage", fx.tradeInFlow],
  ] as const) {
    const raw = await fixtureFetch<{ flow: Record<string, unknown> }>(q.leadFlowQuery, { pageId, kind });
    const { modelLists, ...rawFlow } = raw.flow;
    assert.deepEqual(modelLists, [], `${kind}: fixtures hold no model lists, so none are seeded`);
    const { models: _m, ...flow } = fixture.flow;
    assert.deepEqual(norm({ ...raw, flow: rawFlow }), norm({ ...fixture, flow }), `leadFlow ${kind}`);
  }
  for (const kind of ["square", "jotform", "map"] as const)
    assert.deepEqual(norm(await fixtureFetch(q.embedCopyQuery, { kind })), norm(fx.embedCopy[kind]), `embed ${kind}`);
  assert.deepEqual(norm(await fixtureFetch(q.footerCopyQuery, {})), norm(fx.footerCopy));
  const pc = await fixtureFetch<{ labels: object; sublines: object }>(q.policyChromeQuery, {});
  assert.deepEqual(norm({ ...pc.labels, sublines: pc.sublines }), norm(fx.policyChrome));
  assert.deepEqual(norm(await fixtureFetch(q.heroChipsQuery, {})), norm(fx.heroChips));
  assert.deepEqual(norm(await fixtureFetch(q.servicesChromeQuery, {})), norm(fx.servicesChrome));
  const shop = await fixtureFetch<{ sortOptions: { newest?: string } }>(q.shopChromeQuery, {});
  assert.equal(shop.sortOptions.newest, "Newest");
  assert.deepEqual(norm(shop), norm({ ...fx.shopChrome, sortOptions: { ...fx.shopChrome.sortOptions, newest: "Newest" } }));
});

test("v1.4: trade-in conditions (PM), option keys = form enums, policy dates, shop hero CTAs, design H1s", async () => {
  const t = await c.getLeadFlow("tradein");
  assert.deepEqual(t.flow.options.condition?.map((o) => o.label), ["Like new", "Good", "Cracked or damaged", "Does not power on"]);
  assert.deepEqual(t.flow.options.condition?.map((o) => o.key), [...tradeInSchema.shape.condition.options]);
  const qf = await c.getLeadFlow("quote");
  assert.equal(qf.flow.success.ctas[1].external, false); // tel: is not an external (new-tab) link
  for (const slug of ["privacy", "terms", "shipping-return"] as const) {
    const p = await c.getPolicyPage(slug);
    assert.equal(p.lastUpdated, "2026-10-27");
    assert.equal(p.needsReview, true);
    assert.match(p.reviewNote ?? "", /import date/);
    assert.equal(p.subline, fx.policyChrome.sublines[slug]);
  }
  const shop = await c.getShopPage();
  assert.deepEqual([shop.hero.primaryCta?.label, shop.hero.primaryCta?.href], ["Browse products", "/shop#products"]);
  assert.deepEqual([shop.hero.secondaryCta?.label, shop.hero.secondaryCta?.href, shop.hero.secondaryCta?.external], [
    "Finance with Acima",
    "https://ecom.acimacredit.com/views/phone-auth/ecom-merchant-813293c2-9f1e-4987-8b83-6691e6baf75e?redirect=application",
    true,
  ]);
  const quote = await c.getQuotePage();
  assert.equal(quote.hero.headline, "Get a repair quote in four steps.");
  assert.equal(quote.hero.subline, "Tell us your device, model and issue. We will contact you with your quote.");
  assert.equal((await c.getHomePage()).hero.headline, "Cracked screen? Dead battery? We fix it in 45 minutes."); // spec-verbatim
  assert.equal((await c.getSellPage()).hero.headline, "Get top dollar for your old device."); // spec-verbatim
  const vp = await c.getValueProps();
  assert.equal(vp.filter((v) => v.stat).length, 2);
});

test("v1.5: about/financing blocks, PDP + cart drawer, a11y strings, model lists, address token, no annotation eyebrows", async () => {
  // Raw GROQ (no back-fill) carries the design copy.
  const fin = await fixtureFetch<{ whatIsSection: { highlights: string[]; visualLabel: string }; whatYouCanFinanceSection: { items: string[]; itemBodyList: { title: string; description: string }[] }; ctaSection: { heading: string; intro: string; ctas: { label: string; href: string }[] } }>(
    q.pageSingletonQuery, { type: "financingPage" });
  assert.deepEqual(fin.whatIsSection.highlights, fx.financingPage.whatIsSection.highlights);
  assert.equal(fin.whatIsSection.visualLabel, "Acima");
  assert.deepEqual(fin.whatYouCanFinanceSection.items, ["Smartphones", "Accessories", "And more"]);
  assert.equal(fin.ctaSection.heading, "Ready to apply?");
  assert.deepEqual(fin.ctaSection.ctas.map((x) => x.label), ["Apply Now", "Visit the store"]);
  const f = await c.getFinancingPage();
  assert.deepEqual(f.whatYouCanFinanceSection.itemBodies, fx.financingPage.whatYouCanFinanceSection.itemBodies);
  assert.equal(f.ctaSection?.intro, "Lease-to-own with Acima. No credit needed.");
  assert.equal("itemBodyList" in f.whatYouCanFinanceSection, false);

  const about = await fixtureFetch<{ valuesSection: { items: { title: string; body: string }[] }; ctaSection: { heading: string; intro: string; ctas: { label: string }[] } }>(
    q.pageSingletonQuery, { type: "aboutPage" });
  assert.deepEqual(about.valuesSection.items, fx.aboutPage.valuesSection.items);
  assert.deepEqual([about.ctaSection.heading, about.ctaSection.intro], ["Need a repair?", "Book a time, or come by the shop."]);
  assert.deepEqual(about.ctaSection.ctas.map((x) => x.label), fx.aboutPage.ctaSection.ctas.map((x) => x.label));

  assert.deepEqual(norm(await fixtureFetch(q.pdpChromeQuery, {})), norm(fx.pdpChrome));
  assert.deepEqual(await c.getPdpChrome(), fx.pdpChrome);
  assert.deepEqual(await fixtureFetch(q.a11yCopyQuery, {}), { loading: "Loading", opensInNewTab: "(opens in a new tab)" });
  assert.deepEqual(await c.getA11yCopy(), { loading: "Loading", opensInNewTab: " (opens in a new tab)" });

  // Model lists: editable in quoteConfig, none invented (fixtures hold none) → flow.models = {}.
  assert.deepEqual((await c.getLeadFlow("quote")).flow.models, {});
  assert.deepEqual((await c.getLeadFlow("tradein")).flow.models, {});

  // Suite comes from siteSettings.address.unit via {streetAddress}.
  const sell = await c.getHowItWorksSteps("sell");
  const unit = (await c.getSiteSettings()).business.address.suite;
  assert.equal(sell[1].body, `Drop it off at 1650 W Market St ${unit}, Akron, or ask us about mailing it in.`);
  assert.equal(JSON.stringify(sell).includes("{streetAddress}"), false);

  assert.equal((await c.getQuotePage()).hero.eyebrow, "Instant quote");
  assert.equal(JSON.stringify(await c.getSellPage()).includes("Lead capture"), false);
});

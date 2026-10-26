/**
 * Form mutation helper + QA dry-run (qa/README.md: `x-qa-dry-run: 1` => validate + succeed, no storage, no webhook).
 * Run: pnpm test:unit
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const dir = mkdtempSync(join(tmpdir(), "speedy-forms-"));
const sink = join(dir, "subs.jsonl");
process.env.FORM_FIXTURE_FILE = sink;
process.env.FORM_WEBHOOK_URL = "https://webhook.invalid/hook";
process.env.FORM_WEBHOOK_SECRET = "test-secret";

const calls: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  calls.push(String(input));
  return new Response("{}", { status: 200 });
}) as typeof fetch;

const m = await import("../mutations");
const { deliverSubmission } = await import("@/lib/forms/submit");
const { POST } = await import("@/app/api/forms/[type]/route");
const { NextRequest } = await import("next/server");

const contact = { name: "QA Bot", email: "qa@example.com", message: "Hello there, this is QA.", pagePath: "/", company_website: "", startedAt: Date.now() - 10_000 };
const post = (type: string, body: unknown, headers: Record<string, string> = {}) =>
  POST(new NextRequest(`http://localhost/api/forms/${type}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) }), {
    params: Promise.resolve({ type }),
  });

test("isQaDryRun: only the exact header value 1", () => {
  assert.equal(m.isQaDryRun(new Headers({ "x-qa-dry-run": "1" })), true);
  assert.equal(m.isQaDryRun(new Headers({ "X-QA-Dry-Run": " 1 " })), true);
  assert.equal(m.isQaDryRun(new Headers({ "x-qa-dry-run": "true" })), false);
  assert.equal(m.isQaDryRun(new Headers()), false);
});

test("buildFormSubmissionDoc: contract v1.2 shape (type, private id, payload only for leads)", () => {
  const d = m.buildFormSubmissionDoc("tradein", { name: "A", email: "a@b.co", deviceType: "Phone", brand: "Apple", model: "iPhone 12", condition: "Good", details: "x" }, { submittedAt: "2026-10-27T00:00:00Z", webhookDelivered: false });
  assert.match(d._id, /^submissions\.[0-9a-f-]{36}$/);
  assert.equal(d.type, "tradeIn");
  assert.equal(d.message, "x");
  assert.equal(d.payload?.brand, "Apple");
  assert.equal(m.buildFormSubmissionDoc("newsletter", { email: "a@b.co" }, { submittedAt: "", webhookDelivered: false }).payload, undefined);
});

test("storeFormSubmission: dry run never writes", async () => {
  const d = m.buildFormSubmissionDoc("contact", contact, { submittedAt: "", webhookDelivered: false });
  assert.equal(await m.storeFormSubmission(d, { dryRun: true }), "dry-run");
  assert.equal(existsSync(sink), false);
});

test("deliverSubmission dryRun: no webhook call, nothing stored", async () => {
  calls.length = 0;
  const r = await deliverSubmission("contact", contact, { notificationEmail: "info@speedyirepair.com", dryRun: true });
  assert.deepEqual(r, { stored: false, notified: false, configured: true, dryRun: true });
  assert.equal(calls.length, 0);
  assert.equal(existsSync(sink), false);
});

test("route + x-qa-dry-run: 1 => 200 ok/dryRun, still validates (422), no webhook, no storage", async () => {
  calls.length = 0;
  const ok = await post("contact", contact, { "x-qa-dry-run": "1" });
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true, stored: false, notified: false, staging: true, dryRun: true });
  const bad = await post("contact", { ...contact, email: "not-an-email" }, { "x-qa-dry-run": "1" });
  assert.equal(bad.status, 422);
  // fill-time skipped for dry runs off production, so validation still runs on an instant submit
  const fast = await post("quote", { ...contact, startedAt: Date.now() }, { "x-qa-dry-run": "1" });
  assert.equal(fast.status, 422);
  assert.equal(calls.length, 0);
  assert.equal(existsSync(sink), false);
});

test("route without the header (fixture mode): webhook called once + JSONL line written", async () => {
  calls.length = 0;
  const res = await post("contact", contact);
  assert.equal(res.status, 200);
  const body = (await res.json()) as { ok: boolean; notified: boolean; stored: boolean };
  assert.equal(body.ok, true);
  assert.equal(body.notified, true);
  assert.equal(body.stored, false);
  assert.deepEqual(calls, ["https://webhook.invalid/hook"]);
  const lines = readFileSync(sink, "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  const doc = JSON.parse(lines[0]) as { _type: string; type: string; webhookDelivered: boolean };
  assert.equal(doc._type, "formSubmission");
  assert.equal(doc.type, "contact");
  assert.equal(doc.webhookDelivered, true);
});

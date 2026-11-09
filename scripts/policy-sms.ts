/**
 * One-off (A2P 10DLC): copy the privacy policy and terms text in code (with their SMS sections) onto the published
 * Sanity documents. Published Sanity documents win over the fixtures, so the live pages need this.
 *
 *   npx sanity exec scripts/policy-sms.ts --with-user-token              (dry run: prints what changes)
 *   npx sanity exec scripts/policy-sms.ts --with-user-token -- --apply   (writes it)
 *
 * Only `body` and `sourceNote` are replaced. Stops if any existing paragraph was edited in the Studio since it was
 * seeded, so Studio edits are never overwritten silently.
 */
import { getCliClient } from "sanity/cli";
import * as fx from "../lib/sanity/fixtures";
import type { PolicySlug } from "../lib/sanity/types";

const client = getCliClient({ apiVersion: "2025-10-01" });
const apply = process.argv.includes("--apply");

/**
 * Existing paragraphs each change rewrites on purpose. Privacy: the "[[INSERT AGE]]" placeholder, the Shopify sentence,
 * the SMS opt-in (now the chat widget), the form and advertising carve-outs, and the contact block (template leftovers
 * removed, one mailing address matching the site, legal name). Terms: nothing rewritten, the SMS terms are appended.
 */
const DOCS: { slug: PolicySlug; rewritten: Set<string> }[] = [
  {
    slug: "privacy",
    rewritten: new Set(["pri35", "pri16", "sms1", "priForms", "pri13", "pri19", "pri38", "pri39", "pri40", "pri41", "pri42"]),
  },
  { slug: "terms", rewritten: new Set() },
];

type Block = { _key: string; children?: { text?: string }[]; markDefs?: { _key?: string; href?: string }[] };
const text = (b: Block) => (b.children ?? []).map((c) => c.text ?? "").join("");
/** Text plus link targets, so a changed href counts as a change (Sanity reorders object keys, so no JSON.stringify). */
const sig = (b: Block) => `${text(b)}|${(b.markDefs ?? []).map((m) => `${m._key}=${m.href ?? ""}`).join(",")}`;

async function sync(slug: PolicySlug, rewritten: Set<string>) {
  const id = `policy-${slug}`;
  const live = await client.fetch<{ body: Block[]; _rev: string } | null>(`*[_id == $id][0]{ body, _rev }`, { id });
  if (!live) throw new Error(`${id} not found`);
  const draft = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: `drafts.${id}` });
  if (draft) console.warn(`Note: an unpublished Studio draft (${draft}) exists; it is left alone.`);

  const page = fx.policyPages[slug];
  const next = page.body as Block[];
  const nextByKey = new Map(next.map((b) => [b._key, sig(b)]));
  const studioEdits = live.body.filter((b) => !rewritten.has(b._key) && nextByKey.get(b._key) !== sig(b));
  if (studioEdits.length) {
    throw new Error(`${id}: paragraphs ${studioEdits.map((b) => b._key).join(", ")} differ from the code; merge by hand.`);
  }

  const liveByKey = new Map(live.body.map((b) => [b._key, sig(b)]));
  const changes = next.filter((b) => liveByKey.get(b._key) !== sig(b));
  if (!changes.length) {
    console.log(`${id}: already up to date.\n`);
    return;
  }
  console.log(`${id}: new or changed paragraphs:\n` + changes.map((b) => `  + [${b._key}] ${text(b)}`).join("\n") + "\n");
  if (!apply) return;

  await client.patch(id).ifRevisionId(live._rev).set({ body: next, sourceNote: page.sourceNote }).commit();
  console.log(`Updated ${id}.\n`);
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`${apply ? "Applying" : "Dry run"}: ${projectId}/${dataset}\n`);
  for (const { slug, rewritten } of DOCS) await sync(slug, rewritten);
  if (!apply) console.log("Dry run only. Re-run with `-- --apply` to write.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

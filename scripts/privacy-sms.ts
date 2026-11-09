/**
 * One-off (A2P 10DLC): copy the privacy policy text in code (with the SMS / text messaging section) onto the
 * published Sanity document. Published Sanity documents win over the fixtures, so the live page needs this.
 *
 *   npx sanity exec scripts/privacy-sms.ts --with-user-token              (dry run: prints what changes)
 *   npx sanity exec scripts/privacy-sms.ts --with-user-token -- --apply   (writes it)
 *
 * Only `body` and `sourceNote` on policy-privacy are replaced. Stops if any existing paragraph was edited in
 * the Studio since it was seeded, so Studio edits are never overwritten silently.
 */
import { getCliClient } from "sanity/cli";
import * as fx from "../lib/sanity/fixtures";

const client = getCliClient({ apiVersion: "2025-10-01" });
const apply = process.argv.includes("--apply");
const ID = "policy-privacy";
/**
 * Existing paragraphs this change rewrites on purpose: the "[[INSERT AGE]]" placeholder, the Shopify sentence, the SMS
 * opt-in (now the chat widget), the form and advertising carve-outs, and the contact block (template leftovers
 * removed, one mailing address matching the site).
 */
const REWRITTEN = new Set(["pri35", "pri16", "sms1", "priForms", "pri13", "pri19", "pri38", "pri39", "pri40", "pri41", "pri42"]);

type Block = { _key: string; children?: { text?: string }[] };
const text = (b: Block) => (b.children ?? []).map((c) => c.text ?? "").join("");

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`${apply ? "Applying" : "Dry run"}: ${projectId}/${dataset}\n`);

  const live = await client.fetch<{ body: Block[]; _rev: string } | null>(`*[_id == $id][0]{ body, _rev }`, { id: ID });
  if (!live) throw new Error(`${ID} not found`);
  const draft = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: `drafts.${ID}` });
  if (draft) console.warn(`Note: an unpublished Studio draft (${draft}) exists; it is left alone.\n`);

  const next = fx.policyPages.privacy.body as Block[];
  const nextByKey = new Map(next.map((b) => [b._key, text(b)]));
  const studioEdits = live.body.filter((b) => !REWRITTEN.has(b._key) && nextByKey.get(b._key) !== text(b));
  if (studioEdits.length) {
    throw new Error(`Paragraphs ${studioEdits.map((b) => b._key).join(", ")} differ from the code; merge by hand.`);
  }

  const liveByKey = new Map(live.body.map((b) => [b._key, text(b)]));
  const changes = next.filter((b) => liveByKey.get(b._key) !== text(b));
  if (!changes.length) {
    console.log("Already up to date.");
    return;
  }
  console.log("New or changed paragraphs:\n" + changes.map((b) => `  + [${b._key}] ${text(b)}`).join("\n") + "\n");

  if (!apply) {
    console.log("Dry run only. Re-run with `-- --apply` to write.");
    return;
  }
  await client
    .patch(ID)
    .ifRevisionId(live._rev)
    .set({ body: next, sourceNote: fx.policyPages.privacy.sourceNote })
    .commit();
  console.log(`Updated ${ID}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

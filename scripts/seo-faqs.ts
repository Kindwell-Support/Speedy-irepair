/**
 * One-off (SEO/AEO): add the drafted topic + service-page FAQs and link existing FAQs to their service pages.
 *
 *   npx sanity exec scripts/seo-faqs.ts --with-user-token              (dry run: prints every change)
 *   npx sanity exec scripts/seo-faqs.ts --with-user-token -- --apply   (writes them)
 *
 * What it changes (additive; nothing is deleted, no existing question/category is edited):
 * - creates the new FAQs from the fixtures (categories repairs/visiting/selling/shop/plans only, so the
 *   live /faq and /services lists, which read "general"/"services", are unchanged until the new code ships)
 * - sets "Show on service pages" (services refs) on existing FAQs, from the fixtures' serviceSlugs
 * - faq-net-2: swaps "Fill out the sign-up form online" for the address check, if the answer still says it
 */
import { getCliClient } from "sanity/cli";
import * as fx from "../lib/sanity/fixtures";

const client = getCliClient({ apiVersion: "2025-10-01" });
const apply = process.argv.includes("--apply");
const NEW_IDS = /^faq-(rep|visit|sell|shop|plan)-/;

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`${apply ? "Applying" : "Dry run"}: ${projectId}/${dataset}\n`);

  const [existing, services] = await Promise.all([
    client.fetch<{ _id: string; answer?: string; services?: unknown[] }[]>(`*[_type == "faq"]{ _id, answer, services }`),
    client.fetch<{ _id: string; slug: string }[]>(`*[_type == "service"]{ _id, "slug": slug.current }`),
  ]);
  const byId = new Map(existing.map((d) => [d._id, d]));
  const serviceId = new Map(services.map((s) => [s.slug, s._id]));
  const refs = (slugs: string[] = []) =>
    slugs.flatMap((slug, i) => {
      const id = serviceId.get(slug);
      if (!id) console.warn(`  ! no service doc for slug "${slug}"`);
      return id ? [{ _type: "reference", _ref: id, _key: `svc${i}` }] : [];
    });

  const tx = client.transaction();
  for (const f of fx.faqs) {
    const doc = byId.get(f.id);
    if (!doc) {
      if (!NEW_IDS.test(f.id)) {
        console.log(`${f.id}: not in Sanity (removed in the Studio?), left alone\n`);
        continue;
      }
      const create = {
        _id: f.id,
        _type: "faq",
        question: f.question,
        answer: f.answer,
        categories: f.categories,
        order: f.order,
        sourceNote: f.sourceNote,
        services: refs(f.serviceSlugs ?? []),
      };
      console.log(`create ${f.id}\n${JSON.stringify(create, null, 2)}\n`);
      tx.createIfNotExists(create);
      continue;
    }
    const set: Record<string, unknown> = {};
    if (f.serviceSlugs?.length && !doc.services?.length) set.services = refs(f.serviceSlugs);
    if (f.id === "faq-net-2" && doc.answer?.includes("Fill out the sign-up form online")) set.answer = f.answer;
    if (!Object.keys(set).length) continue;
    console.log(`patch ${f.id}\n${JSON.stringify(set, null, 2)}\n`);
    tx.patch(f.id, (p) => p.set(set));
  }

  if (!apply) return console.log("Nothing written. Re-run with `-- --apply` to write these changes.");
  await tx.commit({ visibility: "async" });
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

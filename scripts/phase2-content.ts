/**
 * One-off (Phase 2): move the live Sanity content onto the repair-first homepage and the new home internet
 * landing page. The code's fixtures already carry these values, but published Sanity documents win over them.
 *
 *   npx sanity exec scripts/phase2-content.ts --with-user-token              (dry run: prints every change)
 *   npx sanity exec scripts/phase2-content.ts --with-user-token -- --apply   (writes them)
 *
 * What it changes:
 * - homePage hero CTAs: "Fix My Device" → /repair, "Get Home Internet" → /home-internet
 * - siteSettings nav: Shop Phones, Sell Your Device, Financing, Reviews in the bar (the rest under "More"),
 *   header button "Fix My Device"
 * - announcement, promotions, services: Jotform links → /home-internet
 * - homeInternetPage: the landing page's new fields (offer, steps, who it's for, why us, form copy, disclaimer);
 *   the hero headline and photo are kept (so is jotformUrl, until the new page is deployed)
 */
import { getCliClient } from "sanity/cli";
import * as fx from "../lib/sanity/fixtures";

const client = getCliClient({ apiVersion: "2025-10-01" });
const apply = process.argv.includes("--apply");

type Cta = { label: string; href: string; external?: boolean; variant?: string };
const JOTFORM = /jotform\.com/;
const INTERNET_CTA = { label: "Check my address", href: "/home-internet", external: false };

let keySeq = 0;
/** Array items need a `_key` (and `_type` for named object types such as cta). */
const keyed = <T extends object>(items: T[], type?: string) =>
  items.map((item) => ({ ...(type ? { _type: type } : {}), ...item, _key: `p2${(keySeq++).toString(36)}` }));

const cta = (c: Cta) => ({ _type: "cta", external: false, ...c });

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`${apply ? "Applying" : "Dry run"}: ${projectId}/${dataset}\n`);
  const tx = client.transaction();
  const change = (id: string, set: Record<string, unknown>, unset: string[] = []) => {
    console.log(`${id}\n${JSON.stringify({ set, ...(unset.length ? { unset } : {}) }, null, 2)}\n`);
    tx.patch(id, (p) => (unset.length ? p.set(set).unset(unset) : p.set(set)));
  };

  // Homepage hero
  const { hero } = fx.homePage;
  change("homePage", { "hero.primaryCta": cta(hero.primaryCta!), "hero.secondaryCta": cta(hero.secondaryCta!) });

  // Nav + header button (siteSettings stores navigation as one object)
  const nav = fx.siteSettings.navigation;
  change("siteSettings", {
    "navigation.primary": keyed(nav.primary.map(cta)),
    "navigation.headerCta": cta(nav.headerCta),
  });

  // Jotform links → the landing page
  const announcements = await client.fetch<{ _id: string; href?: string }[]>(`*[_type == "announcement"]{ _id, href }`);
  for (const a of announcements) if (a.href && JOTFORM.test(a.href)) change(a._id, { href: "/home-internet", external: false });

  const promos = await client.fetch<{ _id: string; cta?: Cta }[]>(`*[_type == "promotion"]{ _id, cta }`);
  for (const p of promos) if (p.cta && JOTFORM.test(p.cta.href)) change(p._id, { cta: INTERNET_CTA });

  const services = await client.fetch<{ _id: string; ctas?: (Cta & { _key: string })[] }[]>(`*[_type == "service"]{ _id, ctas }`);
  for (const s of services) {
    const kept = (s.ctas ?? []).filter((c) => !JOTFORM.test(c.href));
    if (kept.length !== (s.ctas ?? []).length) change(s._id, { ctas: kept });
  }

  // Home internet landing page
  const page = fx.homeInternetPage;
  change(
    "homeInternetPage",
    {
      "hero.eyebrow": page.hero.eyebrow,
      "hero.subline": page.hero.subline,
      ghostWord: page.ghostWord,
      offer: page.offer,
      whatYouGetSection: page.whatYouGetSection,
      howToSignUpSection: { ...page.howToSignUpSection, steps: keyed(page.howToSignUpSection.steps) },
      whoItsForSection: page.whoItsForSection,
      whySection: { ...page.whySection, items: keyed(page.whySection.items) },
      formSection: page.formSection,
      confirmationMessage: page.confirmationMessage,
      disclaimer: page.disclaimer,
    },
    // jotformUrl stays until the new landing page is deployed: the old live page still links to it.
  );

  if (!apply) return console.log("Nothing written. Re-run with `-- --apply` to write these changes.");
  await tx.commit({ visibility: "async" });
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

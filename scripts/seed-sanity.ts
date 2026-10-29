/**
 * One-off: copy the built-in site content (lib/sanity/fixtures) into Sanity so the Studio opens with
 * everything the live site shows, including the current photos (so "swap" is a visible edit).
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=<id> npx sanity exec scripts/seed-sanity.ts --with-user-token
 *   ...add `-- --force` to overwrite documents that already exist (DESTROYS Studio edits).
 *
 * Without --force, existing documents are left alone, so re-running never clobbers the shop's edits.
 * llms.txt is not seeded: empty = the spec text maintained in code.
 */
import { createReadStream } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import * as fx from "../lib/sanity/fixtures";
import { SITE_IMAGES, type SiteImage } from "../lib/site-images";

type Doc = { _id: string; _type: string; [k: string]: unknown };

const client = getCliClient({ apiVersion: "2025-10-01" });
const force = process.argv.includes("--force");

/* ---------- images ---------- */
type SiteImageKey = keyof typeof SITE_IMAGES;
const uploads = new Map<SiteImageKey, string>();

async function image(key: SiteImageKey) {
  const img: SiteImage = SITE_IMAGES[key];
  let id = uploads.get(key);
  if (!id) {
    const file = path.join(process.cwd(), "public", img.src);
    const asset = await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) });
    id = asset._id;
    uploads.set(key, id);
    console.log(`  uploaded ${img.src}`);
  }
  return { _type: "imageWithAlt", asset: { _type: "reference", _ref: id }, alt: img.alt };
}

/* ---------- shaping ---------- */
/** Arrays whose members are named object types need `_type` on each item. */
const ARRAY_ITEM_TYPE: Record<string, string> = {
  primary: "cta",
  footerQuickLinks: "cta",
  footerLegalLinks: "cta",
  ctas: "cta",
  hours: "openingHours",
  serviceCards: "serviceCard",
};

let keySeq = 0;
/** Drop nulls and static (non-Sanity) image objects; give array items a `_key` (and `_type` where needed). */
function clean(value: unknown, field = ""): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const v = clean(item);
        if (v && typeof v === "object" && !Array.isArray(v)) {
          const o = v as Record<string, unknown>;
          return {
            ...(ARRAY_ITEM_TYPE[field] && !o._type ? { _type: ARRAY_ITEM_TYPE[field] } : {}),
            ...o,
            _key: (o._key as string) ?? `k${(keySeq++).toString(36)}`,
          };
        }
        return v;
      })
      .filter((v) => v !== undefined);
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if ("isSanity" in o && o.isSanity === false) return undefined; // /public asset, not uploadable as-is
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      const c = clean(v, k);
      if (c !== undefined && c !== null) out[k] = c;
    }
    return out;
  }
  return value === null ? undefined : value;
}

/** Fixture `{ id, ... }` -> document with that id. */
const asDoc = (type: string, { id, ...rest }: { id: string } & object, extra: object = {}): Doc =>
  ({ ...(clean({ ...rest, ...extra }) as object), _id: id, _type: type }) as Doc;

const slug = (current: string) => ({ _type: "slug", current });

/* ---------- photo defaults (mirror the components' built-in maps) ---------- */
const SERVICE_PHOTO: Record<string, SiteImageKey> = {
  "screen-repair": "screenLift",
  "battery-replacement": "battery",
  "charger-port-repair": "port",
  "water-damage-inspection": "microsolder",
  "certified-pre-owned-devices": "devices",
  "replacement-parts": "boardMacro",
};
const STEP_PHOTO: Record<string, SiteImageKey> = {
  "home-1": "devices",
  "home-2": "counter",
  "home-3": "screenLift",
  "sell-1": "devices",
  "sell-2": "counter",
};
const CARD_PHOTO: Record<string, SiteImageKey> = { c1: "screenLift", c2: "devices", c3: "counter" };
/** Page hero photo (PageHero `photo=`) and body photo (`page.photo ?? SITE_IMAGES.x`). */
const PAGE_PHOTOS: Record<string, { poster?: SiteImageKey; photo?: SiteImageKey }> = {
  servicesPage: { poster: "bench" },
  shopPage: { poster: "devices" },
  sellPage: { poster: "devices", photo: "port" },
  quotePage: { photo: "screenLift" },
  schedulePage: { poster: "battery", photo: "bench" },
  financingPage: { poster: "boardMacro" },
  homeInternetPage: { poster: "devices", photo: "boardMacro" },
};

async function build(): Promise<Doc[]> {
  const docs: Doc[] = [];

  // Site settings: the schema is flat; the fixture nests business fields.
  const { business, navigation, copyright, defaultSeo } = fx.siteSettings;
  docs.push({
    ...(clean({ ...business, navigation, copyright, seo: defaultSeo }) as object),
    _id: "siteSettings",
    _type: "siteSettings",
  });

  if (fx.announcement) docs.push(asDoc("announcement", fx.announcement));
  for (const p of fx.promotions) docs.push(asDoc("promotion", p));
  for (const f of fx.faqs) docs.push(asDoc("faq", f));
  for (const v of fx.valueProps) docs.push(asDoc("valueProp", v));
  for (const b of fx.brands) docs.push(asDoc("brand", b));
  for (const t of fx.testimonials) docs.push(asDoc("testimonial", t));
  for (const m of fx.teamMembers) docs.push(asDoc("teamMember", m));
  for (const s of fx.howItWorksSteps) {
    const key = STEP_PHOTO[s.id];
    docs.push(asDoc("howItWorksStep", s, key ? { image: await image(key) } : {}));
  }
  for (const s of fx.services) {
    const key = SERVICE_PHOTO[s.slug];
    docs.push(asDoc("service", s, { slug: slug(s.slug), ...(key ? { image: await image(key) } : {}) }));
  }
  for (const [s, p] of Object.entries(fx.policyPages)) {
    docs.push({ ...(clean({ ...p, slug: slug(s) }) as object), _id: `policy-${s}`, _type: "policyPage" });
  }

  const pages: Record<string, object> = {
    homePage: fx.homePage,
    servicesPage: fx.servicesPage,
    shopPage: fx.shopPage,
    sellPage: fx.sellPage,
    quotePage: fx.quotePage,
    schedulePage: fx.schedulePage,
    faqPage: fx.faqPage,
    aboutPage: fx.aboutPage,
    financingPage: fx.financingPage,
    homeInternetPage: fx.homeInternetPage,
    blogPage: fx.blogPage,
  };
  for (const [type, page] of Object.entries(pages)) {
    const p = page as { hero: object };
    const photos = PAGE_PHOTOS[type] ?? {};
    const extra: Record<string, unknown> = {
      hero: { ...p.hero, ...(photos.poster ? { poster: await image(photos.poster) } : {}) },
      ...(photos.photo ? { photo: await image(photos.photo) } : {}),
    };
    if (type === "homePage") {
      extra.serviceCards = await Promise.all(
        fx.serviceCards.map(async ({ id, ...c }) => ({
          ...c,
          _key: id,
          ...(CARD_PHOTO[id] ? { image: await image(CARD_PHOTO[id]) } : {}),
        })),
      );
    }
    docs.push({ ...(clean({ ...page, ...extra }) as object), _id: type, _type: type });
  }
  return docs;
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Seeding ${projectId}/${dataset}${force ? " (force: overwriting existing docs)" : ""}`);
  const docs = await build();
  const tx = client.transaction();
  for (const d of docs) {
    if (force) tx.createOrReplace(d);
    else tx.createIfNotExists(d);
  }
  await tx.commit({ visibility: "async" });
  console.log(`Done: ${docs.length} documents, ${uploads.size} photos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

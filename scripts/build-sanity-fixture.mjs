// FIXTURE MODE dataset builder (SCHEMA_CONTRACT v1.2 §5.4). Run by `pnpm sync:cms`, or alone: `pnpm fixture:build`.
// Input:  sanity/seed/seed.ndjson + sanity/seed/assets/* (vendored from cms/, exactly what `sanity dataset import` loads).
// Output (committed): lib/sanity/fixtures/dataset.json and public/cms-fixtures/*.
// Each `_sanityAsset` image becomes a real `asset._ref` plus a `sanity.imageAsset` doc (url, metadata.dimensions),
// so `asset->url` / `asset->metadata` in lib/sanity/queries.ts resolve unchanged under groq-js.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const seedFile = resolve(root, "sanity/seed/seed.ndjson");
const assetDir = resolve(root, "sanity/seed/assets");
const outFile = resolve(root, "lib/sanity/fixtures/dataset.json");
const pubDir = resolve(root, "public/cms-fixtures");
const SYSTEM_TS = "2026-10-27T00:00:00Z"; // fixed so the committed file is deterministic

function dimensions(buf, ext) {
  if (ext === "png") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (ext === "jpg" || ext === "jpeg") {
    let i = 2;
    while (i < buf.length) {
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  throw new Error(`cannot read image dimensions (${ext})`);
}

const assets = new Map();
function toAsset(spec) {
  const file = basename(spec.replace(/^image@/, ""));
  if (!assets.has(file)) {
    const path = resolve(assetDir, file);
    if (!existsSync(path)) throw new Error(`seed asset missing: ${path} (run pnpm sync:cms)`);
    const buf = readFileSync(path);
    const ext = extname(file).slice(1).toLowerCase();
    const { width, height } = dimensions(buf, ext);
    const sha = createHash("sha1").update(buf).digest("hex");
    const id = `image-${sha}-${width}x${height}-${ext === "jpeg" ? "jpg" : ext}`;
    assets.set(file, {
      _id: id,
      _type: "sanity.imageAsset",
      _createdAt: SYSTEM_TS,
      _updatedAt: SYSTEM_TS,
      originalFilename: file,
      url: `/cms-fixtures/${file}`,
      extension: ext,
      metadata: { dimensions: { width, height, aspectRatio: width / height } },
    });
  }
  return assets.get(file)._id;
}

function rewrite(v) {
  if (Array.isArray(v)) return v.map(rewrite);
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === "_sanityAsset") out.asset = { _type: "reference", _ref: toAsset(val) };
      else out[k] = rewrite(val);
    }
    return out;
  }
  return v;
}

const docs = readFileSync(seedFile, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => ({ _createdAt: SYSTEM_TS, _updatedAt: SYSTEM_TS, ...rewrite(JSON.parse(l)) }));
const dataset = [...docs, ...assets.values()];

rmSync(pubDir, { recursive: true, force: true });
mkdirSync(pubDir, { recursive: true });
for (const file of assets.keys()) copyFileSync(resolve(assetDir, file), resolve(pubDir, file));
writeFileSync(outFile, JSON.stringify(dataset) + "\n");
console.log(`fixture: ${docs.length} docs + ${assets.size} assets -> lib/sanity/fixtures/dataset.json, public/cms-fixtures/`);

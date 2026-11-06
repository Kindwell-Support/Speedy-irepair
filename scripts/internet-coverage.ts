/**
 * Builds data/internet-coverage.json, the data behind the /home-internet address check, from the FCC National
 * Broadband Map (fixed broadband availability, Ohio). Re-run when the FCC publishes a new release (twice a year)
 * and commit the JSON.
 *
 * Two ways to get the FCC files:
 *   A) FCC API (free account at broadbandmap.fcc.gov, then "Manage API Access" for a token). With these in .env.local
 *        FCC_BDC_USERNAME=<the account's email>
 *        FCC_BDC_API_TOKEN=<the token>
 *      run: npx tsx --env-file=.env.local scripts/internet-coverage.ts
 *   B) By hand: on broadbandmap.fcc.gov > Data Download, pick the latest release, Ohio, Fixed Broadband, and download
 *      the Cable, Fiber to the Premises, Copper and Licensed Fixed Wireless files (.zip, no need to unzip) into one
 *      folder, then run: npx tsx scripts/internet-coverage.ts --dir <folder> [--as-of 2025-06-30]
 *
 * For each 2020 census block in the counties in lib/internet-availability/config.ts, it keeps whether Spectrum
 * and AT&T report residential service there (AT&T fiber separately). It prints the brand names it matched, so
 * check those look right. Nothing here runs on the website.
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { createInflateRaw } from "node:zlib";
import {
  COVERAGE_COUNTIES,
  COVERAGE_FILE,
  MIN_DOWNLOAD_MBPS,
  PROVIDERS,
  TECH,
  type CoverageFile,
} from "../lib/internet-availability/config";

const API = "https://broadbandmap.fcc.gov/api/public/map";
const OHIO_FIPS = "39";
const WANTED_TECH = new Set<number>(PROVIDERS.flatMap((p) => [...p.technologies]));
/** Without these files the result would wrongly say "not available", so the script refuses to write. */
const REQUIRED_TECH = [TECH.cable, TECH.fiber, TECH.copper];

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

function fail(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}

// ---------- FCC API (mode A) ----------
async function api<T>(path: string): Promise<T> {
  const username = process.env.FCC_BDC_USERNAME?.trim();
  const hash_value = process.env.FCC_BDC_API_TOKEN?.trim();
  if (!username || !hash_value) fail("Set FCC_BDC_USERNAME and FCC_BDC_API_TOKEN, or pass --dir <folder>.");
  const res = await fetch(`${API}/${path}`, {
    headers: { username, hash_value, "user-agent": "speedy-irepair-coverage-script" },
  });
  if (!res.ok) fail(`FCC API ${res.status} for ${path}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as T;
}

async function downloadFromApi(): Promise<{ dir: string; asOf: string }> {
  const dates = await api<{ data: { data_type: string; as_of_date: string }[] }>("listAsOfDates");
  const asOf = dates.data
    .filter((d) => d.data_type === "availability")
    .map((d) => d.as_of_date.slice(0, 10))
    .sort()
    .at(-1);
  if (!asOf) fail(`No availability release in listAsOfDates: ${JSON.stringify(dates).slice(0, 300)}`);
  console.log(`Latest FCC release: ${asOf}`);

  type FileRow = {
    file_id: number | string;
    state_fips?: string;
    technology_type?: string;
    technology_code?: string | number;
    file_name?: string;
    file_type?: string;
  };
  // Per-state fixed broadband files are "State / Location Coverage", one per technology, as CSV.
  const list = await api<{ data: FileRow[] }>(
    `downloads/listAvailabilityData/${asOf}?category=State&subcategory=Location%20Coverage`,
  );
  const files = list.data.filter(
    (f) =>
      String(f.state_fips) === OHIO_FIPS &&
      WANTED_TECH.has(Number(f.technology_code)) &&
      (!f.technology_type || /fixed/i.test(f.technology_type)) &&
      (!f.file_type || /csv/i.test(f.file_type)),
  );
  if (!files.length) fail(`No Ohio fixed broadband files found. First rows: ${JSON.stringify(list.data.slice(0, 3))}`);

  const dir = join(tmpdir(), `fcc-bdc-${asOf}`);
  mkdirSync(dir, { recursive: true });
  for (const f of files) {
    const out = join(dir, `${f.file_name ?? f.file_id}.zip`);
    if (existsSync(out)) {
      console.log(`  have ${out}`);
      continue;
    }
    console.log(`  downloading technology ${f.technology_code}: ${f.file_name ?? f.file_id}`);
    const username = process.env.FCC_BDC_USERNAME!.trim();
    const hash_value = process.env.FCC_BDC_API_TOKEN!.trim();
    const res = await fetch(`${API}/downloads/downloadFile/availability/${f.file_id}`, {
      headers: { username, hash_value, "user-agent": "speedy-irepair-coverage-script" },
    });
    if (!res.ok) fail(`Download ${f.file_id} failed: ${res.status}`);
    writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  }
  return { dir, asOf };
}

// ---------- Reading the files ----------
/** The CSVs inside a .zip, streamed (Ohio's cable file is hundreds of MB unzipped). Plain .zip, no zip64. */
function* zipEntries(file: string): Generator<{ name: string; stream: Readable }> {
  const buf = readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) fail(`${file} isn't a zip file.`);
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  if (p === 0xffffffff) fail(`${file} is a zip64 archive; unzip it and pass the folder with the .csv instead.`);
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) fail(`${file}: unexpected zip layout.`);
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    p += 46 + nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
    if (!/\.csv$/i.test(name)) continue;
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = Readable.from([buf.subarray(start, start + size)]);
    if (method === 0) yield { name, stream: raw };
    else if (method === 8) yield { name, stream: raw.pipe(createInflateRaw()) };
    else fail(`${file}: ${name} uses zip method ${method}; unzip it and pass the folder with the .csv instead.`);
  }
}

function splitCsv(line: string): string[] {
  if (!line.includes('"')) return line.split(",");
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const blocks = new Map<string, Set<string>>();
const countiesSeen = new Set<string>();
const techSeen = new Set<number>();
const matched = new Map<string, number>(); // "Spectrum <- Charter Communications (provider 130077)" -> rows

async function readCsv(label: string, stream: Readable) {
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let col: Record<string, number> | null = null;
  let rows = 0;
  for await (const line of lines) {
    if (!line) continue;
    const cells = splitCsv(line);
    if (!col) {
      col = Object.fromEntries(cells.map((h, i) => [h.trim().toLowerCase(), i]));
      for (const need of ["brand_name", "technology", "max_advertised_download_speed", "business_residential_code", "block_geoid"])
        if (!(need in col)) fail(`${label}: no "${need}" column. Header: ${line.slice(0, 300)}`);
      continue;
    }
    rows++;
    const block = cells[col.block_geoid]?.trim();
    if (!block || block.length !== 15) continue;
    const county = block.slice(0, 5);
    if (!(county in COVERAGE_COUNTIES)) continue;
    const tech = Number(cells[col.technology]);
    countiesSeen.add(county);
    techSeen.add(tech);
    if (!/^[RX]$/.test(cells[col.business_residential_code]?.trim() ?? "")) continue; // business-only
    if (Number(cells[col.max_advertised_download_speed]) < MIN_DOWNLOAD_MBPS) continue;
    const brand = cells[col.brand_name]?.trim() ?? "";
    for (const p of PROVIDERS) {
      if (!p.brand.test(brand) || !(p.technologies as readonly number[]).includes(tech)) continue;
      const code = p.key === "spectrum" ? "s" : tech === TECH.fiber ? "f" : "a";
      let set = blocks.get(block);
      if (!set) blocks.set(block, (set = new Set()));
      set.add(code);
      const providerId = col.provider_id !== undefined ? ` (provider ${cells[col.provider_id]})` : "";
      const k = `${p.label} <- ${brand}${providerId}`;
      matched.set(k, (matched.get(k) ?? 0) + 1);
    }
  }
  console.log(`  ${label}: ${rows.toLocaleString()} rows`);
}

async function main() {
  const dirArg = arg("dir");
  const { dir, asOf: apiAsOf } = dirArg ? { dir: resolve(dirArg), asOf: undefined } : await downloadFromApi();
  if (!existsSync(dir)) fail(`No folder ${dir}`);
  const files = readdirSync(dir).filter((f) => /\.(zip|csv)$/i.test(f));
  if (!files.length) fail(`No .zip or .csv files in ${dir}`);

  console.log(`Reading ${files.length} file(s) from ${dir}`);
  for (const f of files) {
    const path = join(dir, f);
    if (/\.csv$/i.test(f)) await readCsv(f, createReadStream(path));
    else for (const e of zipEntries(path)) await readCsv(`${f} > ${e.name}`, e.stream);
  }

  const missingTech = REQUIRED_TECH.filter((t) => !techSeen.has(t));
  if (missingTech.length)
    fail(`No rows for technology ${missingTech.join(", ")} (40 cable, 50 fiber, 10 copper). Add those Ohio files and re-run.`);
  const missingCounties = Object.keys(COVERAGE_COUNTIES).filter((c) => !countiesSeen.has(c));
  if (missingCounties.length)
    console.warn(`\nNo data for ${missingCounties.map((c) => COVERAGE_COUNTIES[c]).join(", ")}: addresses there will show "checking".`);

  // From the release, else a --as-of flag, else the FCC file name's J25 / D24 (June / December release).
  const fromName = files.join(" ").match(/_([JD])(\d{2})_/);
  const asOf =
    apiAsOf ?? arg("as-of") ?? (fromName ? `20${fromName[2]}-${fromName[1] === "J" ? "06-30" : "12-31"}` : null);
  if (!asOf) fail("Couldn't tell the release date from the file names; pass --as-of YYYY-MM-DD.");

  const out: CoverageFile = {
    asOf,
    generatedAt: new Date().toISOString(),
    counties: [...countiesSeen].sort(),
    blocks: Object.fromEntries(
      [...blocks.keys()].sort().map((b) => [b, ["s", "f", "a"].filter((c) => blocks.get(b)!.has(c)).join("")]),
    ),
  };
  // AT&T fiber implies AT&T, so "fa" is stored as "f".
  for (const [b, code] of Object.entries(out.blocks)) if (code.includes("f")) out.blocks[b] = code.replace("a", "");
  writeFileSync(COVERAGE_FILE, JSON.stringify(out));

  const count = (re: RegExp) => Object.values(out.blocks).filter((c) => re.test(c)).length;
  console.log("\nMatched brands (rows):");
  for (const [k, n] of [...matched].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n.toLocaleString()}`);
  console.log(
    `\nWrote ${COVERAGE_FILE} (release ${asOf}): ${Object.keys(out.blocks).length.toLocaleString()} blocks, ` +
      `Spectrum ${count(/s/).toLocaleString()}, AT&T ${count(/[fa]/).toLocaleString()} (fiber ${count(/f/).toLocaleString()}). ` +
      `Counties: ${out.counties.map((c) => COVERAGE_COUNTIES[c]).join(", ")}.`,
  );
}

void main();

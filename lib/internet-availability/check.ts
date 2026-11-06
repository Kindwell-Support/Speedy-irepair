import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  COVERAGE_FILE,
  UNKNOWN_RESULT,
  resultFromCode,
  type AvailabilityResult,
  type CoverageFile,
} from "@/lib/internet-availability/config";

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zip: string;
}

const GEOCODER = "https://geocoding.geo.census.gov/geocoder/geographies/address";
const GEOCODE_TIMEOUT_MS = 6000;

let coverage: Promise<CoverageFile | null> | undefined;

/** The data file, read once per server instance. Missing or empty file = every check is "unknown". */
function loadCoverage(): Promise<CoverageFile | null> {
  coverage ??= readFile(path.join(process.cwd(), COVERAGE_FILE), "utf8")
    .then((text) => {
      const file = JSON.parse(text) as CoverageFile;
      return file.asOf && file.counties.length ? file : null;
    })
    .catch(() => null);
  return coverage;
}

/**
 * The address's 2020 census block (15-digit GEOID), from the free US Census geocoder. Null when it can't place the
 * address. It sometimes returns an empty body, so one retry.
 */
async function censusBlock({ street, city, state, zip }: AddressInput): Promise<string | null> {
  const params = new URLSearchParams({
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    zip: zip.trim(),
    benchmark: "Public_AR_Current",
    vintage: "Census2020_Current",
    layers: "Census Blocks",
    format: "json",
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${GEOCODER}?${params}`, {
        signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        result?: { addressMatches?: { geographies?: Record<string, { GEOID?: string }[]> }[] };
      };
      const matches = data.result?.addressMatches;
      if (!matches) continue;
      const geoid = matches[0]?.geographies?.["Census Blocks"]?.[0]?.GEOID;
      return geoid && /^\d{15}$/.test(geoid) ? geoid : null;
    } catch {
      // timeout, network or a bad body: try once more
    }
  }
  return null;
}

const recent = new Map<string, AvailabilityResult>();
const keyFor = (a: AddressInput) =>
  [a.street, a.city, a.state, a.zip].map((s) => s.trim().toLowerCase().replace(/\s+/g, " ")).join("|");

/**
 * Which of Spectrum / AT&T report service in the address's census block. Never throws: anything that stops the
 * check (no data file, geocoder down, address not found, outside the covered counties) is "unknown".
 */
export async function checkAvailability(address: AddressInput): Promise<AvailabilityResult> {
  const key = keyFor(address);
  const cached = recent.get(key);
  if (cached) return cached;

  const file = await loadCoverage();
  if (!file) return UNKNOWN_RESULT;
  const block = await censusBlock(address);
  if (!block || !file.counties.includes(block.slice(0, 5))) return UNKNOWN_RESULT;

  const result = resultFromCode(file.blocks[block] ?? "");
  if (recent.size > 500) recent.clear(); // memory guard
  recent.set(key, result);
  return result;
}

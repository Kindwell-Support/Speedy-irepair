/**
 * Home internet availability check: which providers we look for and where. Shared by the server check
 * (lib/internet-availability/check.ts) and the data script (scripts/internet-coverage.ts), so no server-only import.
 *
 * Data: the FCC National Broadband Map (the same source BroadbandNow mostly uses). The script keeps, per 2020
 * census block in the counties below, whether Spectrum and AT&T report residential service there. An address is
 * matched to its block by the Census geocoder, so a result means "available in your area", not a promise for
 * that exact door: staff still confirm on the call.
 */

/** Where the data covers. An address outside these counties gets "unknown" (staff check by hand), never "none". */
export const COVERAGE_COUNTIES: Record<string, string> = {
  "39153": "Summit",
  "39133": "Portage",
  "39151": "Stark",
  "39103": "Medina",
  "39169": "Wayne",
  "39035": "Cuyahoga",
};

/** FCC technology codes: 10 copper (DSL/VDSL), 40 cable, 50 fiber to the premises, 71 licensed fixed wireless. */
export const TECH = { copper: 10, cable: 40, fiber: 50, licensedFixedWireless: 71 } as const;

/**
 * Offers below this download speed aren't counted. AT&T no longer sells its old slow DSL, which is still on the
 * map at some addresses; this keeps it from showing as "AT&T is available".
 */
export const MIN_DOWNLOAD_MBPS = 25;

/**
 * The providers, in the order the result screen prefers them (Spectrum is the shop's main one).
 * `brand` matches the FCC file's brand_name; the script prints every brand it matched so you can check it.
 */
export const PROVIDERS = [
  { key: "spectrum", label: "Spectrum", brand: /spectrum|charter/i, technologies: [TECH.cable, TECH.fiber] },
  {
    key: "att",
    label: "AT&T",
    brand: /^at&t|^at\s?and\s?t/i,
    technologies: [TECH.copper, TECH.fiber, TECH.licensedFixedWireless],
  },
] as const;

/**
 * The data file's shape (data/internet-coverage.json). Per block, a short code:
 * "s" Spectrum, "f" AT&T fiber, "a" AT&T without fiber, so "sf" is Spectrum + AT&T Fiber.
 * A block in a covered county with no entry has neither.
 */
export interface CoverageFile {
  /** The FCC data's "as of" date, e.g. 2025-06-30. Null until the script has run. */
  asOf: string | null;
  generatedAt: string | null;
  /** County FIPS codes the data covers. */
  counties: string[];
  blocks: Record<string, string>;
}

export const COVERAGE_FILE = "data/internet-coverage.json";

/** What the result screen shows: Spectrum first, then AT&T, then sorry. "unknown" = couldn't check, staff will. */
export const AVAILABILITY_STATUSES = ["spectrum", "att", "none", "unknown"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export interface AvailabilityResult {
  status: AvailabilityStatus;
  /** Null when we couldn't check. */
  spectrum: boolean | null;
  att: boolean | null;
  attFiber: boolean;
}

export const UNKNOWN_RESULT: AvailabilityResult = { status: "unknown", spectrum: null, att: null, attFiber: false };

/** Spectrum wins, then AT&T, then none. */
export function resultFromCode(code: string): AvailabilityResult {
  const spectrum = code.includes("s");
  const attFiber = code.includes("f");
  const att = attFiber || code.includes("a");
  return { status: spectrum ? "spectrum" : att ? "att" : "none", spectrum, att, attFiber };
}

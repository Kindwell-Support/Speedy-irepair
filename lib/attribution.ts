/**
 * Ad and referrer attribution for repair leads. AttributionCapture (mounted in the site layout) records the first
 * page of the session, so UTMs from an ad that lands on the homepage are still there when the visitor books on
 * /repair. The widget sends what's stored with the first contact upsert; the server maps it to a Lead Source.
 * Client-safe.
 */
export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Only an external referrer; same-site navigation isn't attribution. */
  referrer?: string;
  landingPage?: string;
}

/** Exactly as spelled in the GHL "Lead Source" dropdown (GHL silently drops anything else). */
export const LEAD_SOURCES = {
  metaAd: "Meta Ad",
  googleAd: "Google Ad",
  organicSearch: "Organic Search",
  direct: "Website-Direct",
} as const;
export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

const STORAGE_KEY = "speedy:attribution:v1";
const META_SOURCES = ["facebook", "instagram", "meta"];
const PAID_MEDIUMS = ["cpc", "paid"];
const SEARCH_ENGINES = ["google", "bing", "duckduckgo"];

/** Stores this page's attribution, unless the session already has some and this URL carries no new UTMs. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    };
    const hasUtm = Boolean(utm.utmSource || utm.utmMedium || utm.utmCampaign);
    if (!hasUtm && sessionStorage.getItem(STORAGE_KEY)) return;
    let referrer = "";
    if (document.referrer && new URL(document.referrer).origin !== window.location.origin)
      referrer = document.referrer;
    const record: Attribution = { ...utm, referrer, landingPage: window.location.pathname };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked or a malformed referrer: the lead just goes in as Website-Direct.
  }
}

export function readAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

export function leadSourceFor(a: Attribution): LeadSource {
  const source = a.utmSource?.trim().toLowerCase() ?? "";
  const medium = a.utmMedium?.trim().toLowerCase() ?? "";
  if (META_SOURCES.includes(source)) return LEAD_SOURCES.metaAd;
  if (source === "google" && PAID_MEDIUMS.includes(medium)) return LEAD_SOURCES.googleAd;
  const referrer = a.referrer?.toLowerCase() ?? "";
  if (!source && SEARCH_ENGINES.some((engine) => referrer.includes(engine)))
    return LEAD_SOURCES.organicSearch;
  return LEAD_SOURCES.direct;
}

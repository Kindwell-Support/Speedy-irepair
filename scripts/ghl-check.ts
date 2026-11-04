/**
 * Read-only check of the GHL account against what the website writes. Run after changing anything in GHL:
 *   npx tsx --env-file=.env.local scripts/ghl-check.ts
 * Verifies every GHL_* var is set, every custom field ID still has its fieldKey, every dropdown value the site can
 * send exists exactly as spelled (GHL drops unknown values silently), every stage ID belongs to its pipeline and
 * the calendar exists. Exits 1 on a problem.
 * Then prints the live account as ready-to-paste .env lines: the vars the site uses, resolved from the account
 * (by the current ID, else by fieldKey or name), and commented reference lines for every custom field, pipeline,
 * stage and calendar. Only GHL_API_TOKEN and GHL_LOCATION_ID are needed for that part, so it can bootstrap a new
 * account's .env.
 */
import { LEAD_SOURCES } from "../lib/attribution";
import {
  FIELD_IDS,
  FIELD_KEYS,
  GHL_FIELDS_ENV,
  INTERNET_OPTIONS,
  LEAD_STATUS,
  LOCATION,
  fieldEnvName,
  type FieldName,
} from "../lib/ghl/fields";
import { ALL_ISSUES, DEVICES } from "../lib/repair-catalog";

const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const DEFAULT_TIME_ZONE = "America/New_York";

const opt = (name: string) => process.env[name]?.trim() ?? "";
const env = (name: string) => {
  const v = opt(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${env("GHL_API_TOKEN")}`,
      Version: API_VERSION,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

interface CustomField {
  id: string;
  fieldKey: string;
  name: string;
  dataType?: string;
  picklistOptions?: string[];
}
interface Pipeline {
  id: string;
  name: string;
  stages: { id: string; name: string }[];
}
interface Calendar {
  id: string;
  name: string;
  slotDuration?: number;
}

const DROPDOWNS: Partial<Record<FieldName, readonly string[]>> = {
  deviceType: DEVICES,
  issue: ALL_ISSUES,
  leadSource: Object.values(LEAD_SOURCES),
  leadStatus: Object.values(LEAD_STATUS),
  location: [LOCATION],
  homeType: Object.values(INTERNET_OPTIONS.homeType),
  internetNeed: Object.values(INTERNET_OPTIONS.internetNeed),
  internetTiming: Object.values(INTERNET_OPTIONS.internetTiming),
};

/**
 * The pipelines the site writes to. Each is found by its env ID, else by name; each stage by its env ID within
 * that pipeline, else by name (null: the pipeline's first stage).
 */
const PIPELINES: { idVar: string; name: string; stages: Record<string, string | null> }[] = [
  {
    idVar: "GHL_PIPELINE_ID",
    name: "Repair Bookings",
    stages: {
      GHL_STAGE_INTAKE_STARTED: "Intake Started",
      GHL_STAGE_NEW_LEAD: "New Lead",
      GHL_STAGE_BOOKED: "Booked",
      GHL_STAGE_QUOTE_REQUESTED: "Quote Requested",
    },
  },
  { idVar: "GHL_INQUIRY_PIPELINE_ID", name: "General Inquiries", stages: { GHL_INQUIRY_STAGE_NEW: null } },
  { idVar: "GHL_BUYBACK_PIPELINE_ID", name: "Device Buyback", stages: { GHL_BUYBACK_STAGE_NEW: "New Inquiry" } },
  { idVar: "GHL_INTERNET_PIPELINE_ID", name: "Home Internet Leads", stages: { GHL_INTERNET_STAGE_NEW: "New Lead" } },
];
const CALENDAR_NAME = "Repair Appointments";

/** .env line; quoted when the value has spaces or other characters a .env parser could trip on. */
const line = (name: string, value: string) =>
  `${name}=${/^[\w.\-:/+]*$/.test(value) ? value : JSON.stringify(value)}`;
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

async function main() {
  let problems = 0;
  const fail = (msg: string) => {
    problems++;
    console.log(`  ✗ ${msg}`);
  };
  const locationId = env("GHL_LOCATION_ID");

  console.log("Env vars");
  const required = [
    "GHL_API_TOKEN",
    "GHL_LOCATION_ID",
    "GHL_CALENDAR_ID",
    "GHL_PIPELINE_ID",
    "GHL_STAGE_INTAKE_STARTED",
    "GHL_STAGE_NEW_LEAD",
    "GHL_STAGE_BOOKED",
    ...Object.keys(GHL_FIELDS_ENV),
  ];
  const missing = required.filter((name) => !opt(name));
  if (missing.length) fail(`not set: ${missing.join(", ")}`);
  else console.log(`  ✓ all ${required.length} required GHL_* vars set`);
  if (!opt("GHL_TIMEZONE")) console.log(`  · GHL_TIMEZONE not set; the site uses ${DEFAULT_TIME_ZONE}`);

  console.log("Custom fields");
  const { customFields } = await get<{ customFields: CustomField[] }>(
    `/locations/${locationId}/customFields?model=contact`,
  );
  const byId = new Map(customFields.map((f) => [f.id, f]));
  for (const name of Object.keys(FIELD_IDS) as FieldName[]) {
    const field = byId.get(FIELD_IDS[name]);
    if (!field) {
      const byKey = customFields.find((f) => f.fieldKey === FIELD_KEYS[name]);
      fail(
        `${name}: id ${FIELD_IDS[name] || "(unset)"} not found${byKey ? ` (${FIELD_KEYS[name]} is now ${byKey.id})` : ""}`,
      );
      continue;
    }
    if (field.fieldKey !== FIELD_KEYS[name])
      fail(`${name}: id ${field.id} is ${field.fieldKey}, expected ${FIELD_KEYS[name]}`);
    const values = DROPDOWNS[name];
    if (!values) {
      console.log(`  ✓ ${name} (${field.fieldKey})`);
      continue;
    }
    const options = new Set(field.picklistOptions ?? []);
    const missingOptions = values.filter((v) => !options.has(v));
    if (missingOptions.length)
      fail(
        `${name}: missing option(s) ${missingOptions.map((v) => JSON.stringify(v)).join(", ")}; GHL has ${JSON.stringify([...options])}`,
      );
    else console.log(`  ✓ ${name} (${field.fieldKey}): ${values.length} value(s) present`);
  }

  console.log("Pipelines");
  const { pipelines } = await get<{ pipelines: Pipeline[] }>(`/opportunities/pipelines?locationId=${locationId}`);
  const resolved: Record<string, string> = {};
  for (const spec of PIPELINES) {
    const envId = opt(spec.idVar);
    const pipeline =
      pipelines.find((p) => p.id === envId) ?? (envId ? undefined : pipelines.find((p) => sameName(p.name, spec.name)));
    if (!pipeline) {
      fail(`${spec.idVar} ${envId || "(unset)"} not found${envId ? "" : ` and no pipeline is named "${spec.name}"`}`);
      continue;
    }
    resolved[spec.idVar] = pipeline.id;
    if (envId === pipeline.id) console.log(`  ✓ ${spec.idVar} = ${pipeline.name}`);
    else fail(`${spec.idVar} is unset; "${pipeline.name}" is ${pipeline.id}`);
    for (const [stageVar, stageName] of Object.entries(spec.stages)) {
      const envStage = opt(stageVar);
      const stage =
        pipeline.stages.find((s) => s.id === envStage) ??
        (envStage ? undefined : stageName ? pipeline.stages.find((s) => sameName(s.name, stageName)) : pipeline.stages[0]);
      if (!stage) {
        fail(`${stageVar} ${envStage || "(unset)"} is not a stage of "${pipeline.name}"`);
        continue;
      }
      resolved[stageVar] = stage.id;
      if (envStage === stage.id) console.log(`  ✓ ${stageVar} = ${pipeline.name} / ${stage.name}`);
      else fail(`${stageVar} is unset; "${pipeline.name} / ${stage.name}" is ${stage.id}`);
    }
  }

  console.log("Calendar");
  const { calendars } = await get<{ calendars: Calendar[] }>(`/calendars/?locationId=${locationId}`);
  const calendarId = opt("GHL_CALENDAR_ID");
  const calendar =
    calendars.find((c) => c.id === calendarId) ??
    (calendarId ? undefined : calendars.find((c) => sameName(c.name, CALENDAR_NAME)));
  if (!calendar) fail(`GHL_CALENDAR_ID ${calendarId || "(unset)"} not found`);
  else if (calendar.id !== calendarId) fail(`GHL_CALENDAR_ID is unset; "${calendar.name}" is ${calendar.id}`);
  else console.log(`  ✓ ${calendar.name} (${calendar.slotDuration ?? "?"}-minute slots)`);

  // --- The live account as .env lines -------------------------------------------------------------------------
  const unresolved = (name: string) => `# ${name}=  (not found in the account)`;
  const out: string[] = [
    "",
    "# ----- GHL .env lines, from the live account -----",
    line("GHL_LOCATION_ID", locationId),
    calendar ? line("GHL_CALENDAR_ID", calendar.id) : unresolved("GHL_CALENDAR_ID"),
  ];
  for (const spec of PIPELINES)
    for (const name of [spec.idVar, ...Object.keys(spec.stages)])
      out.push(resolved[name] ? line(name, resolved[name]) : unresolved(name));
  for (const name of Object.keys(FIELD_KEYS) as FieldName[]) {
    const field = byId.get(FIELD_IDS[name]) ?? customFields.find((f) => f.fieldKey === FIELD_KEYS[name]);
    out.push(field ? line(fieldEnvName(FIELD_KEYS[name]), field.id) : unresolved(fieldEnvName(FIELD_KEYS[name])));
  }
  const locationOptions = customFields.find((f) => f.fieldKey === FIELD_KEYS.location)?.picklistOptions ?? [];
  const label = locationOptions.includes(LOCATION) ? LOCATION : locationOptions.length === 1 ? locationOptions[0] : "";
  out.push(
    label
      ? line("GHL_LOCATION_LABEL", label)
      : `# GHL_LOCATION_LABEL=  (pick one: ${locationOptions.map((o) => JSON.stringify(o)).join(", ")})`,
  );
  out.push(line("GHL_TIMEZONE", opt("GHL_TIMEZONE") || DEFAULT_TIME_ZONE));
  out.push("# GHL_API_TOKEN and GHL_OWNER_USER_IDS are not listed: set them by hand.");

  out.push("", "# ----- Reference: every contact custom field -----");
  for (const f of [...customFields].sort((a, b) => a.fieldKey.localeCompare(b.fieldKey)))
    out.push(`# ${fieldEnvName(f.fieldKey)}=${f.id}  (${f.name}${f.dataType ? `, ${f.dataType}` : ""})`);
  out.push("", "# ----- Reference: every pipeline and stage -----");
  for (const p of pipelines) {
    out.push(`# ${p.name}: ${p.id}`);
    for (const s of p.stages) out.push(`#   ${s.name}: ${s.id}`);
  }
  out.push("", "# ----- Reference: every calendar -----");
  for (const c of calendars) out.push(`# ${c.name}: ${c.id}`);
  console.log(out.join("\n"));

  console.log(problems ? `\n${problems} problem(s).` : "\nAll good.");
  process.exitCode = problems ? 1 : 0;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});

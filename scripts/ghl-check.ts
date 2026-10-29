/**
 * Read-only check of the GHL account against what the repair intake writes. Run after changing anything in GHL:
 *   npx tsx --env-file=.env.local scripts/ghl-check.ts
 * Verifies every custom field ID still has its fieldKey, every dropdown value the widget can send exists exactly as
 * spelled (GHL drops unknown values silently), and the pipeline stage IDs belong to the pipeline. Exits 1 on a mismatch.
 */
import { LEAD_SOURCES } from "../lib/attribution";
import { FIELD_IDS, FIELD_KEYS, LEAD_STATUS, LOCATION, type FieldName } from "../lib/ghl/fields";
import { ALL_ISSUES, DEVICES } from "../lib/repair-catalog";

const BASE_URL = "https://services.leadconnectorhq.com";
const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${env("GHL_API_TOKEN")}`,
      Version: "2021-07-28",
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
  picklistOptions?: string[];
}

const DROPDOWNS: Partial<Record<FieldName, readonly string[]>> = {
  deviceType: DEVICES,
  issue: ALL_ISSUES,
  leadSource: Object.values(LEAD_SOURCES),
  leadStatus: Object.values(LEAD_STATUS),
  location: [LOCATION],
};

async function main() {
  let problems = 0;
  const fail = (msg: string) => {
    problems++;
    console.log(`  ✗ ${msg}`);
  };

  console.log("Custom fields");
  const { customFields } = await get<{ customFields: CustomField[] }>(
    `/locations/${env("GHL_LOCATION_ID")}/customFields?model=contact`,
  );
  const byId = new Map(customFields.map((f) => [f.id, f]));
  for (const name of Object.keys(FIELD_IDS) as FieldName[]) {
    const field = byId.get(FIELD_IDS[name]);
    if (!field) {
      const byKey = customFields.find((f) => f.fieldKey === FIELD_KEYS[name]);
      fail(
        `${name}: id ${FIELD_IDS[name]} not found${byKey ? ` (${FIELD_KEYS[name]} is now ${byKey.id})` : ""}`,
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
    const missing = values.filter((v) => !options.has(v));
    if (missing.length)
      fail(
        `${name}: missing option(s) ${missing.map((v) => JSON.stringify(v)).join(", ")}; GHL has ${JSON.stringify([...options])}`,
      );
    else console.log(`  ✓ ${name} (${field.fieldKey}): ${values.length} value(s) present`);
  }

  console.log("Pipeline");
  const { pipelines } = await get<{
    pipelines: { id: string; name: string; stages: { id: string; name: string }[] }[];
  }>(`/opportunities/pipelines?locationId=${env("GHL_LOCATION_ID")}`);
  const pipeline = pipelines.find((p) => p.id === env("GHL_PIPELINE_ID"));
  if (!pipeline) fail(`GHL_PIPELINE_ID ${env("GHL_PIPELINE_ID")} not found`);
  else {
    for (const name of ["GHL_STAGE_INTAKE_STARTED", "GHL_STAGE_NEW_LEAD", "GHL_STAGE_BOOKED"]) {
      const stage = pipeline.stages.find((s) => s.id === env(name));
      if (stage) console.log(`  ✓ ${name} = ${stage.name}`);
      else fail(`${name} ${env(name)} is not a stage of "${pipeline.name}"`);
    }
  }

  console.log("Calendar");
  const { calendar } = await get<{ calendar: { name: string; slotDuration?: number } }>(
    `/calendars/${env("GHL_CALENDAR_ID")}`,
  );
  console.log(`  ✓ ${calendar.name} (${calendar.slotDuration ?? "?"}-minute slots)`);

  console.log(problems ? `\n${problems} problem(s).` : "\nAll good.");
  process.exitCode = problems ? 1 : 0;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});

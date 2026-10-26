/**
 * Rive icon manifest (A6 / M7).
 * id -> { riveSrc, stateMachine, art }. If `public/rive/<id>.riv` exists at build time
 * (see scripts/gen-rive-manifest.mjs -> available.generated.ts), <RiveIcon> renders the
 * Rive state machine; otherwise the code-driven SVG fallback with the SAME state API.
 *
 * Required .riv contract (for whoever authors them in the Rive editor):
 *   - Artboard 24x24 (or square), transparent background, white + #ED1C24 accent
 *   - State machine name: "icon" (override per icon via `stateMachine`)
 *   - Inputs: `hover` (Boolean), `click` (Trigger); default state = idle (static, no loop)
 *   - Under reduced motion we never mount Rive (static SVG shown)
 */
import { AVAILABLE_RIV } from "./available.generated";
import { ICON_ART, type IconArtId } from "./icons";

export type RiveIconEntry = {
  /** artwork used for the SVG fallback (and as poster while Rive loads) */
  art: IconArtId;
  /** default '/rive/<id>.riv' */
  riveSrc?: string;
  stateMachine?: string;
  label: string;
};

export const RIVE_ICONS = {
  // ---- Homepage services grid (spec 2.1.2, C1–C8)
  "smartphone-repair": { art: "smartphone-repair", label: "Smartphone repair" },
  "pre-owned": { art: "pre-owned", label: "Certified pre-owned devices" },
  "sell-trade": { art: "sell-trade", label: "Sell or trade your device" },
  "prepaid-plans": { art: "prepaid-plans", label: "Prepaid phone plans" },
  "bill-payment": { art: "bill-payment", label: "Bill payment services" },
  "home-internet": { art: "home-internet", label: "Home internet" },
  financing: { art: "financing", label: "Financing" },
  "device-unlocking": { art: "device-unlocking", label: "Device unlocking" },
  // ---- /services (spec 2.2, S01–S14). Ids shared with the homepage reuse the same file.
  "screen-repair": { art: "screen-repair", label: "Screen repair" }, // S01
  battery: { art: "battery", label: "Battery replacement" }, // S02
  "charger-port": { art: "charger-port", label: "Charger port repair" }, // S03
  camera: { art: "camera", label: "Camera repair" }, // S04
  "water-damage": { art: "water-damage", label: "Water damage inspection" }, // S05
  // S06 device-unlocking, S07 pre-owned, S08 sell-trade, S09 prepaid-plans,
  // S10 bill-payment, S11 home-internet, S12 financing -> shared entries above
  accessories: { art: "accessories", label: "Accessories" }, // S13
  "replacement-parts": { art: "replacement-parts", label: "Replacement parts" }, // S14
} satisfies Record<string, RiveIconEntry>;

export type RiveIconId = keyof typeof RIVE_ICONS;

/** Design markup aliases (design/pages/home.html: article.card-service[data-rive="icon-…"]). */
export const RIVE_ALIASES = {
  "icon-repair": "smartphone-repair",
  "icon-preowned": "pre-owned",
  "icon-trade": "sell-trade",
  "icon-plans": "prepaid-plans",
  "icon-bill": "bill-payment",
  "icon-internet": "home-internet",
  "icon-financing": "financing",
  "icon-unlock": "device-unlocking",
} as const satisfies Record<string, RiveIconId>;

export type RiveIconKey = RiveIconId | keyof typeof RIVE_ALIASES;

export const toRiveId = (key: RiveIconKey): RiveIconId =>
  key in RIVE_ALIASES ? RIVE_ALIASES[key as keyof typeof RIVE_ALIASES] : (key as RiveIconId);

/** /services order S01–S14 -> icon id (for the Frontend's section map). */
export const SERVICES_ICON_ORDER: RiveIconId[] = [
  "screen-repair", "battery", "charger-port", "camera", "water-damage", "device-unlocking",
  "pre-owned", "sell-trade", "prepaid-plans", "bill-payment", "home-internet", "financing",
  "accessories", "replacement-parts",
];

/** Homepage C1–C8 -> icon id. */
export const HOME_ICON_ORDER: RiveIconId[] = [
  "smartphone-repair", "pre-owned", "sell-trade", "prepaid-plans", "bill-payment",
  "home-internet", "financing", "device-unlocking",
];

export function resolveRiveIcon(key: RiveIconKey) {
  const id = toRiveId(key);
  const entry: RiveIconEntry = RIVE_ICONS[id];
  const hasRiv = AVAILABLE_RIV.has(id);
  return {
    ...entry,
    id,
    art: ICON_ART[entry.art],
    riveSrc: hasRiv ? (entry.riveSrc ?? `/rive/${id}.riv`) : undefined,
    stateMachine: entry.stateMachine ?? "icon",
  };
}

/** Shared .riv for the loader + button micro-interaction (optional). */
export const RIVE_LOADER_SRC = AVAILABLE_RIV.has("loader") ? "/rive/loader.riv" : undefined;
export const RIVE_BUTTON_SRC = AVAILABLE_RIV.has("button") ? "/rive/button.riv" : undefined;

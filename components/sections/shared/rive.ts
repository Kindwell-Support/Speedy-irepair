import { RIVE_ICONS, type RiveIconId } from "@/components/rive/manifest";

/** CMS stores riveIcon as a string; narrow it to a known manifest id (unknown ids render no icon). */
export function toRiveIconId(value: string | null | undefined): RiveIconId | null {
  return value && value in RIVE_ICONS ? (value as RiveIconId) : null;
}

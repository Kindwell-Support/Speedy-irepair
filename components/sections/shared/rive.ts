import { riveIconIdFrom, type RiveIconId } from "@/components/rive/manifest";

/** CMS stores riveIcon as a string; narrow it to a known manifest id or alias (unknown ids render no icon). */
export function toRiveIconId(value: string | null | undefined): RiveIconId | null {
  return riveIconIdFrom(value);
}

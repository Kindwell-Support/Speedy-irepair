import type { PortableTextBlock } from "../types";

let keyCounter = 0;
const key = (prefix: string): string => `${prefix}${(keyCounter++).toString(36)}`;

/** Build Portable Text paragraphs from plain strings (fixtures only). */
export function blocks(...paragraphs: string[]): PortableTextBlock[] {
  return paragraphs.map((text) => ({
    _type: "block",
    _key: key("b"),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key("s"), text, marks: [] }],
  }));
}

/** Text used for any copy the spec marks TBD. Rendered with a visible placeholder badge in non-production. */
export const PLACEHOLDER = (what: string): string => `[Placeholder: ${what}]`;

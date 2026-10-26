import type { PortableTextBlock } from "@/lib/sanity/types";

/** Plain text of a Portable Text block (spans only). */
export function blockText(block: PortableTextBlock): string {
  const children = (block as { children?: { text?: unknown }[] }).children ?? [];
  return children.map((c) => (typeof c.text === "string" ? c.text : "")).join("");
}

/** Stable anchor id from heading text ("How do we use your personal information?" → "how-do-we-use-your-personal-information"). */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** H2 table of contents for a Portable Text body (same ids RichText renders). */
export function headingToc(
  body: PortableTextBlock[] | null | undefined,
): { id: string; text: string }[] {
  return (body ?? [])
    .filter((b) => (b as { style?: string }).style === "h2")
    .map((b) => {
      const text = blockText(b);
      return { id: headingId(text), text };
    })
    .filter((h) => h.id);
}

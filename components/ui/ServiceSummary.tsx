import type { JsonLdGraph } from "@/lib/seo/jsonld";

/** Renders the page's Service description visibly (SEO G4) from the same graph passed to <JsonLd/>, so text and schema match. */
export function ServiceSummary({ data }: { data: JsonLdGraph }) {
  const node = data["@graph"].find((n) => n["@type"] === "Service");
  const description = node?.description;
  if (typeof description !== "string" || !description) return null;
  return (
    <div className="container-site pt-10">
      <p className="max-w-prose text-body-lg text-text-secondary">{description}</p>
    </div>
  );
}

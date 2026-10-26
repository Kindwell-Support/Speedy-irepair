import { serializeJsonLd, type JsonLdGraph } from "@/lib/seo/jsonld";

/**
 * Server component. Renders one <script type="application/ld+json"> per page.
 * Serialization escapes <, >, & and U+2028/9 so CMS text can never break out of the script tag.
 * Render it once per route in page.tsx (not in layout.tsx), so each route ships exactly its graph.
 */
export function JsonLd({ data, id = "jsonld" }: { data: JsonLdGraph; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

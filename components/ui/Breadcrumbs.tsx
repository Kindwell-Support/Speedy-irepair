import Link from "next/link";
import type { JsonLdGraph } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

interface Crumb {
  name: string;
  href: string;
}

/** Pull the trail out of the page's own BreadcrumbList node so the visible UI always matches the schema. */
function trailFrom(data: JsonLdGraph): Crumb[] {
  const node = data["@graph"].find((n) => n["@type"] === "BreadcrumbList");
  const items = node?.itemListElement;
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw: unknown) => {
    if (typeof raw !== "object" || raw === null) return [];
    const { name, item } = raw as { name?: unknown; item?: unknown };
    if (typeof name !== "string" || typeof item !== "string") return [];
    const href = item.startsWith(SITE_URL) ? item.slice(SITE_URL.length) || "/" : item;
    return [{ name, href }];
  });
}

/** Visible breadcrumb trail rendered from the same JSON-LD graph passed to <JsonLd/>. */
export function Breadcrumbs({ data, className }: { data: JsonLdGraph; className?: string }) {
  const trail = trailFrom(data);
  if (trail.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={className ?? "container-site pt-6"}>
      <ol className="flex flex-wrap items-center gap-2 text-body-sm text-text-secondary">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-text">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link
                    href={c.href}
                    className="rounded-sm hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

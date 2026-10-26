import Link from "next/link";
import type { PdpAssurance, PdpAssuranceKey } from "@/lib/sanity/types";
import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";

const ICONS: Record<PdpAssuranceKey, LineIconName> = {
  shipping: "truck",
  returns: "refresh",
  store: "pin",
  payments: "card",
};

/** Design `.assure`: 2×2 reassurance rows under the CTAs. The `store` row shows the siteSettings address. */
export function PdpAssurances({ items, address }: { items: PdpAssurance[]; address: string }) {
  if (!items.length) return null;
  return (
    <ul
      className="grid gap-4 border-y border-border-subtle py-6 sm:grid-cols-2"
      data-testid="pdp-assurances"
    >
      {items.map((a) => (
        <li key={a.key} className="flex gap-3">
          <LineIcon name={ICONS[a.key]} size={22} className="mt-0.5 shrink-0 text-brand" />
          <span className="grid gap-1 text-body-sm text-text-secondary">
            <strong className="font-semibold text-text">{a.title}</strong>
            <span>
              {a.key === "store" ? (a.body ?? address) : a.body}
              {a.linkLabel && a.linkHref ? (
                <>
                  {" "}
                  <Link
                    href={a.linkHref}
                    className="text-primary-text underline underline-offset-4 hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
                  >
                    {a.linkLabel}
                  </Link>
                </>
              ) : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

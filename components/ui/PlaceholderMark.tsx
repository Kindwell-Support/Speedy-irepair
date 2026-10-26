import type { ReactNode } from "react";
import { isProductionSite } from "@/lib/env";

/**
 * Visible placeholder marker (Architecture decision #6): content flagged isPlaceholder renders with a
 * dashed yellow outline + "Placeholder" tag on staging. In production it renders children plainly
 * (placeholders must be replaced before launch; QC checks for them).
 */
export function PlaceholderMark({ show, children }: { show?: boolean | null; children: ReactNode }) {
  if (!show || isProductionSite) return <>{children}</>;
  return (
    <span
      data-placeholder
      className="rounded-xs outline-dashed outline-1 outline-offset-2 outline-placeholder"
      title="Placeholder content, edit in Sanity"
    >
      <span className="mr-2 inline-block rounded-xs bg-placeholder px-1 align-middle text-label uppercase text-text-inverse">
        Placeholder
      </span>
      {children}
    </span>
  );
}

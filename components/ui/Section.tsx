import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { SectionCopy } from "@/lib/sanity/types";
import { PlaceholderMark } from "./PlaceholderMark";

/**
 * Standard page section: vertical rhythm from --section-pad-y, container width, optional h2 from CMS.
 * Header is split on desktop: the heading holds the left seven columns, the intro (and an optional
 * `aside`, e.g. a "see all" link) sits bottom-aligned on the right. `layout="stack"` keeps it in one column;
 * `layout="side"` puts the header in a sticky left column with the content beside it (lists, FAQs).
 * `reveal` fades the header's heading and intro up in turn as the section scrolls in.
 */
export function Section({
  id,
  copy,
  children,
  className,
  tone = "default",
  labelledBy,
  layout = "split",
  aside,
  reveal = false,
  bleed,
}: {
  id?: string;
  copy?: SectionCopy | null;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "raised";
  labelledBy?: string;
  layout?: "split" | "stack" | "side";
  aside?: ReactNode;
  reveal?: boolean;
  /** Full-width content after the container (e.g. a carousel that runs edge to edge). */
  bleed?: ReactNode;
}) {
  const headingId = labelledBy ?? (id ? `${id}-heading` : undefined);
  const split = layout === "split";
  const side = layout === "side" && copy;
  const header = copy ? (
    <header
      data-animate={reveal ? "reveal" : undefined}
      data-reveal={reveal ? "children" : undefined}
      className={cn(
        "grid gap-5",
        side ? "mb-10 self-start lg:sticky lg:top-32 lg:col-span-4 lg:mb-0" : "mb-10 md:mb-14",
        split && "lg:grid-cols-12 lg:items-end lg:gap-x-8",
        layout === "stack" && "max-w-prose",
      )}
    >
      <h2 id={headingId} className={cn("text-h2", split && "lg:col-span-7")}>
        {copy.heading}
      </h2>
      {copy.intro || aside ? (
        <div className={cn("flex flex-col gap-5", split && "lg:col-span-4 lg:col-start-9")}>
          {copy.intro ? (
            <p className="max-w-[52ch] text-body-lg text-text-secondary">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
          {aside}
        </div>
      ) : null}
    </header>
  ) : null;
  return (
    <section
      id={id}
      aria-labelledby={copy || labelledBy ? headingId : undefined}
      className={cn("py-section", tone === "raised" && "bg-bg-raised", className)}
    >
      <div className={cn("container-site", side && "lg:grid lg:grid-cols-12 lg:gap-x-8")}>
        {header}
        {side ? <div className="lg:col-span-8">{children}</div> : children}
      </div>
      {bleed}
    </section>
  );
}

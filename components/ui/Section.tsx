import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { SectionCopy } from "@/lib/sanity/types";
import { PlaceholderMark } from "./PlaceholderMark";

/** Standard page section: vertical rhythm from --section-pad-y, container width, optional h2 from CMS. */
export function Section({
  id,
  copy,
  children,
  className,
  tone = "default",
  labelledBy,
  section,
  testId,
}: {
  id?: string;
  copy?: SectionCopy | null;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "raised";
  labelledBy?: string;
  /** QA hook: data-section (homepage order check). */
  section?: string;
  /** QA hook: data-testid. */
  testId?: string;
}) {
  const headingId = labelledBy ?? (id ? `${id}-heading` : undefined);
  return (
    <section
      id={id}
      data-section={section}
      data-testid={testId}
      aria-labelledby={copy ? headingId : undefined}
      className={cn("py-section", tone === "raised" && "bg-bg-raised", className)}
    >
      <div className="container-site">
        {copy ? (
          <header
            className={cn(
              "mb-16 grid gap-4",
              copy.intro ? "lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-8" : "max-w-[760px]",
            )}
          >
            <div className="grid gap-4">
              {copy.eyebrow ? (
                <p className="inline-flex items-center gap-2 text-label font-semibold uppercase text-text-secondary before:size-2 before:rounded-[2px] before:bg-brand before:content-['']">
                  {copy.eyebrow}
                </p>
              ) : null}
              <h2 id={headingId} className="text-h2">
                {copy.heading}
              </h2>
            </div>
            {copy.intro ? (
              <p className="text-body-lg text-text-secondary">
                <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}

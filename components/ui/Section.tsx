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
          <header className="mb-10 max-w-prose md:mb-12">
            <h2 id={headingId} className="text-h2">
              {copy.heading}
            </h2>
            {copy.intro ? (
              <p className="mt-4 text-body-lg text-text-secondary">
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

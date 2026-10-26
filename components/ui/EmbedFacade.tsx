"use client";

import { useState } from "react";
import { buttonClasses } from "./ButtonLink";
import { cn } from "@/lib/utils/cn";

/**
 * Click-to-load facade for third-party iframes (Google Maps, Square booking, Jotform).
 * Nothing third-party loads until the user asks (performance + privacy). Always offers a direct link.
 * The iframe gets data-lenis-prevent so it scrolls natively inside Lenis.
 */
export function EmbedFacade({
  src,
  title,
  loadLabel,
  directHref,
  directLabel,
  heightClass = "h-[640px]",
  description,
}: {
  src: string;
  title: string;
  loadLabel: string;
  directHref: string;
  directLabel: string;
  heightClass?: string;
  description?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-surface", heightClass)}>
      {loaded ? (
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="payment; clipboard-write"
          data-lenis-prevent
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          {description ? <p className="max-w-prose text-body text-text-secondary">{description}</p> : null}
          <button type="button" className={buttonClasses("primary", "lg")} onClick={() => setLoaded(true)}>
            {loadLabel}
          </button>
          <a href={directHref} target="_blank" rel="noopener noreferrer" className={buttonClasses("link")}>
            {directLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      )}
    </div>
  );
}

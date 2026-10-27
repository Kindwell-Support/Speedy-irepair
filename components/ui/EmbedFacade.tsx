"use client";

import { useState, type ReactNode } from "react";
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
  idleHeightClass,
  description,
  backdrop,
}: {
  src: string;
  title: string;
  loadLabel: string;
  directHref: string;
  directLabel: string;
  heightClass?: string;
  /** Height before the iframe loads, when the full embed height would just be an empty box. */
  idleHeightClass?: string;
  description?: string;
  /** Decorative art behind the unloaded state (aria-hidden); dropped once the iframe loads. */
  backdrop?: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-surface", loaded ? heightClass : (idleHeightClass ?? heightClass))}>
      {!loaded && backdrop ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {backdrop}
        </div>
      ) : null}
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
        <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
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

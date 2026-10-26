"use client";

import { useEffect, useState } from "react";
import { buttonClasses } from "./ButtonLink";
import { cn } from "@/lib/utils/cn";

/**
 * Click-to-load facade for third-party iframes (Google Maps, Square booking, Jotform).
 * Nothing third-party loads until the user asks (performance + privacy). Always offers a direct link.
 * The iframe gets data-lenis-prevent so it scrolls natively inside Lenis.
 * Frames (Design HANDOFF): idle facade → skeleton while the iframe loads → loaded; if the iframe has not
 * fired onLoad within FALLBACK_MS (blocked by an extension/CSP/offline), a fallback frame with the direct link shows.
 */
const FALLBACK_MS = 12_000;
type Phase = "idle" | "loading" | "loaded" | "fallback";

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
  const [phase, setPhase] = useState<Phase>("idle");
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => setPhase((p) => (p === "loading" ? "fallback" : p)), FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, [phase]);
  const directLink = (
    <a href={directHref} target="_blank" rel="noopener noreferrer" className={buttonClasses("link")}>
      {directLabel}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-surface", heightClass)}
      data-embed-state={phase}
      aria-busy={phase === "loading"}
    >
      {phase !== "idle" ? (
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="payment; clipboard-write"
          data-lenis-prevent
          onLoad={() => setPhase("loaded")}
        />
      ) : null}
      {phase === "loading" ? (
        <div className="absolute inset-0 flex flex-col gap-4 bg-surface p-8" role="status">
          <span className="sr-only">Loading {title}…</span>
          <div className="h-8 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="flex-1 animate-pulse rounded-lg bg-surface-2" />
        </div>
      ) : null}
      {phase === "fallback" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface p-8 text-center" role="alert">
          <p className="max-w-prose text-body text-text-secondary">This embed didn&rsquo;t load here. You can open it directly instead.</p>
          {directLink}
        </div>
      ) : null}
      {phase === "idle" ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          {description ? <p className="max-w-prose text-body text-text-secondary">{description}</p> : null}
          <button type="button" className={buttonClasses("primary", "lg")} onClick={() => setPhase("loading")}>
            {loadLabel}
          </button>
          {directLink}
        </div>
      ) : null}
    </div>
  );
}

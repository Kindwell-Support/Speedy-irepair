"use client";
import { A11Y } from "@/components/ui/a11yStrings";

import { useEffect, useState } from "react";
import type { EmbedCopy } from "@/lib/sanity/types";
import { telHref } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { buttonClasses } from "./ButtonLink";

/**
 * Click-to-load facade for third-party iframes (Square booking, Jotform, Google Maps), styled as the
 * design's EmbedShell (.embed + .embed__bar). Nothing third-party loads until the user asks (perf + privacy).
 * Frames: idle facade → skeleton while the iframe loads → loaded; if onLoad has not fired within
 * FALLBACK_MS (design: 8 s; blocked by an extension/CSP/offline) the fallback alert shows with the
 * direct link and, when a phone is given, a call action. Copy comes from getEmbedCopy(kind).
 * Skeleton blocks are static; data-animate="shimmer" is the Motion lane hook (no animation code here).
 */
const FALLBACK_MS = 8_000;
type Phase = "idle" | "loading" | "loaded" | "fallback";

function Skeleton({ className }: { className: string }) {
  return <div data-animate="shimmer" className={cn("bg-surface-2", className)} />;
}

export function EmbedFacade({
  src,
  directHref,
  copy,
  phone,
  heightClass = "h-[640px]",
}: {
  src: string;
  directHref: string;
  copy: EmbedCopy;
  /** Display phone; enables the "Call us" action and fills {phone} in the fallback body */
  phone?: string;
  heightClass?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(
      () => setPhase((p) => (p === "loading" ? "fallback" : p)),
      FALLBACK_MS,
    );
    return () => window.clearTimeout(t);
  }, [phase]);

  const [before, after] = copy.fallbackBody.split("{phone}");
  const newTab = <span className="sr-only">{A11Y.opensInNewTab}</span>;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface"
      data-testid="embed-shell"
      data-embed-state={phase}
    >
      {copy.barLabel ? (
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-6 py-4 text-caption text-text-tertiary">
          <span>{copy.barLabel}</span>
        </div>
      ) : null}
      <div className={cn("relative w-full", heightClass)} aria-busy={phase === "loading"}>
        {phase !== "idle" ? (
          <iframe
            src={src}
            title={copy.title}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="payment; clipboard-write"
            data-lenis-prevent
            onLoad={() => setPhase("loaded")}
          />
        ) : null}
        {phase === "loading" ? (
          <div
            className="absolute inset-0 grid content-start gap-4 bg-surface px-6 py-8"
            role="status"
          >
            <span className="sr-only">{copy.loadingLabel}</span>
            <Skeleton className="h-6 w-2/5 rounded-full" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="mt-2 h-6 w-[30%] rounded-full" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          </div>
        ) : null}
        {phase === "fallback" ? (
          <div className="absolute inset-0 grid content-start gap-4 bg-surface px-6 py-8">
            <div
              role="alert"
              className="border-error/35 flex items-start gap-4 rounded-md border bg-error-tint px-6 py-4 text-body-sm text-text"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="mt-px shrink-0 text-error"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 8v4.5" />
                <path d="M12 15.8h.01" strokeWidth="2.2" />
              </svg>
              <div>
                <strong className="block font-semibold">{copy.fallbackTitle}</strong>
                {before}
                {after !== undefined && phone ? (
                  <>
                    <a className="tabular-nums underline" href={telHref(phone)}>
                      {phone}
                    </a>
                    {after}
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={directHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("primary")}
              >
                {copy.directLabel}
                {newTab}
              </a>
              {phone && copy.callLabel ? (
                <a href={telHref(phone)} className={buttonClasses("secondary")}>
                  {copy.callLabel}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        {phase === "idle" ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            {copy.description ? (
              <p className="max-w-prose text-body text-text-secondary">{copy.description}</p>
            ) : null}
            <button
              type="button"
              className={buttonClasses("primary", "lg")}
              onClick={() => setPhase("loading")}
            >
              {copy.loadLabel}
            </button>
            <a
              href={directHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("link")}
            >
              {copy.directLabel}
              {newTab}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

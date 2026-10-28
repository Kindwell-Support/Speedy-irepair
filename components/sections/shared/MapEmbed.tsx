"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Google Maps embed with a poster underneath. The server (and a visitor without JS) gets the poster: a pin,
 * the address and an "Open in Google Maps" link. After mount the iframe is added on top and fades in once it
 * has loaded, so the column never sits as a flat grey box while the map tiles arrive.
 */
export function MapEmbed({ src, title, address, mapsHref, className }: { src: string; title: string; address: string; mapsHref: string; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl bg-surface", className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <svg aria-hidden width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-brand">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
        <p className="max-w-[28ch] text-body-lg font-semibold text-text">{address}</p>
        {mounted && !loaded ? <p className="text-body-sm text-text-secondary">Loading map…</p> : null}
        <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="relative z-raised inline-flex min-h-12 items-center text-body font-bold text-primary-text underline underline-offset-4">
          Open in Google Maps
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      {mounted ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          data-lenis-prevent
          onLoad={() => setLoaded(true)}
          className={cn(
            "pointer-events-none absolute inset-0 z-raised h-full w-full border-0 opacity-0 transition-opacity duration-slow [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)]",
            loaded && "pointer-events-auto opacity-100",
          )}
        />
      ) : null}
    </div>
  );
}

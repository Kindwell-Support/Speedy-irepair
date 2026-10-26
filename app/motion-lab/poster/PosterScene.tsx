"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const PhoneScene = dynamic(() => import("@/components/3d/PhoneScene"), { ssr: false });

/** Renders the hero scene in its static poster pose for scripts/render-hero-poster.mjs. */
export function PosterScene() {
  const [ready, setReady] = useState(false);
  return (
    <div className="h-[1200px] w-[960px]" data-poster-ready={ready || undefined}>
      <PhoneScene active interactive={false} mobile={false} posterMode onFirstFrame={() => setTimeout(() => setReady(true), 400)} />
    </div>
  );
}

import { isSanityConfigured } from "@/lib/env";
import { StudioClient } from "./StudioClient";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

/** Embedded Sanity Studio at /studio (noindex via next.config headers). */
export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="container-site py-24">
        <h1 className="text-h2">Sanity Studio is not configured</h1>
        <p className="mt-4 text-body-lg text-text-secondary">
          Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET (see docs/ENV.md). The site is serving fixture content.
        </p>
      </main>
    );
  }
  return <StudioClient />;
}

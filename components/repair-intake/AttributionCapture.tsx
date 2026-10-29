"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where the visit came from (UTMs, referrer, landing page) on whichever page the visitor lands, so the repair
 * intake can send it with the lead. Renders nothing. Re-runs on client navigation in case a new UTM link is followed.
 */
export function AttributionCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution();
  }, [pathname]);
  return null;
}

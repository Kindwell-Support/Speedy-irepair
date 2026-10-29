import "server-only";
import { isGhlConfigured } from "@/lib/env.server";
import { ghlProvider } from "./ghl-provider";
import { mockProvider } from "./mock-provider";
import type { BookingProvider } from "./provider";

export { SlotUnavailableError } from "./provider";
export { signSession, verifySession } from "./session";

if (
  !isGhlConfigured &&
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build"
) {
  console.error(
    "[booking] GHL_* env vars are missing: /repair is using the mock backend and leads are NOT being saved.",
  );
}

/** GoHighLevel when every GHL_* variable is set (lib/env.server.ts), otherwise the logging mock. */
export const booking: BookingProvider = isGhlConfigured ? ghlProvider : mockProvider;

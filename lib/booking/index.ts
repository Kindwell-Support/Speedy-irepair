import "server-only";
import type { BookingProvider } from "./provider";
import { mockProvider } from "./mock-provider";

export { SlotUnavailableError } from "./provider";

/**
 * The live booking backend. To switch to GoHighLevel, finish lib/booking/ghl-provider.ts and change this line to:
 *   export const booking: BookingProvider = ghlProvider;   (import { ghlProvider } from "./ghl-provider")
 */
export const booking: BookingProvider = mockProvider;

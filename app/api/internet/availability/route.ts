import { NextResponse, type NextRequest } from "next/server";
import { internetSchema } from "@/lib/forms/schemas";
import { checkRateLimit, clientIp } from "@/lib/forms/spam";
import { checkAvailability } from "@/lib/internet-availability/check";
import { UNKNOWN_RESULT } from "@/lib/internet-availability/config";

export const dynamic = "force-dynamic";

const addressSchema = internetSchema.pick({ street: true, city: true, state: true, zip: true });

/** Each check calls the Census geocoder; people going back to fix a typo need a few, bots don't get many. */
const CHECKS_PER_WINDOW = 20;

/**
 * POST /api/internet/availability { street, city, state, zip } -> AvailabilityResult.
 * Run by the /home-internet form after the address step, so the result is ready when the visitor submits.
 * Anything that stops the check answers "unknown" (staff check by hand); it never errors the form.
 */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`availability:${clientIp(req.headers)}`, Date.now(), CHECKS_PER_WINDOW))
    return NextResponse.json(UNKNOWN_RESULT, { status: 429 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(UNKNOWN_RESULT, { status: 400 });
  }
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(UNKNOWN_RESULT, { status: 422 });

  return NextResponse.json(await checkAvailability(parsed.data));
}

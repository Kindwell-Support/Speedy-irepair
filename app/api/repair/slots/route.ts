import { NextResponse } from "next/server";
import { booking } from "@/lib/booking";
import type { SlotsResponse } from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: SlotsResponse, status = 200) => NextResponse.json(body, { status });

/** GET /api/repair/slots → free slots for the whole booking window, keyed by shop date. */
export async function GET() {
  try {
    return json({ ok: true, days: await booking.getFreeSlots() });
  } catch (err) {
    console.error("[repair] getFreeSlots failed", err);
    return json({ ok: false, message: "We couldn't load times." }, 502);
  }
}

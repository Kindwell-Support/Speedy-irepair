import { NextResponse, type NextRequest } from "next/server";
import { booking } from "@/lib/booking";
import { slotsQuerySchema, type SlotsResponse } from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: SlotsResponse, status = 200) => NextResponse.json(body, { status });

/** GET /api/repair/slots?date=YYYY-MM-DD → every slot that day in shop time, taken ones marked unavailable. */
export async function GET(req: NextRequest) {
  const parsed = slotsQuerySchema.safeParse({ date: req.nextUrl.searchParams.get("date") ?? "" });
  if (!parsed.success) return json({ ok: false, message: "Choose a valid date.", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  try {
    const slots = await booking.getAvailableSlots(parsed.data.date);
    return json({ ok: true, date: parsed.data.date, slots });
  } catch {
    return json({ ok: false, message: "We couldn't load times. Please try again." }, 500);
  }
}

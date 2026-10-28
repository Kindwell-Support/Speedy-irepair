import { NextResponse, type NextRequest } from "next/server";
import { booking, SlotUnavailableError } from "@/lib/booking";
import { checkRateLimit, clientIp } from "@/lib/forms/spam";
import { bookingInputSchema, type BookResponse } from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: BookResponse, status = 200) => NextResponse.json(body, { status });

/** POST /api/repair/book: the lead plus the chosen slot → the confirmed booking. 409 when the slot has gone. */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`repair-book:${clientIp(req.headers)}`))
    return json({ ok: false, message: "Too many requests. Please try again in a few minutes." }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, message: "Please check your details.", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  try {
    return json({ ok: true, booking: await booking.completeBooking(parsed.data) });
  } catch (err) {
    if (err instanceof SlotUnavailableError) return json({ ok: false, message: "That time was just taken. Please pick another." }, 409);
    return json({ ok: false, message: "Something went wrong. Please try again." }, 500);
  }
}

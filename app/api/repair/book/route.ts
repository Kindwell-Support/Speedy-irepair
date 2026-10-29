import { NextResponse, type NextRequest } from "next/server";
import { booking, SlotUnavailableError, verifySession } from "@/lib/booking";
import { checkRateLimit, clientIp } from "@/lib/forms/spam";
import { completeInputSchema, type CompleteResponse } from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: CompleteResponse, status = 200) => NextResponse.json(body, { status });

/**
 * POST /api/repair/book: step 7, every answer plus the chosen slot (or none) → the result to confirm. 409 when the
 * slot has just gone; any other backend failure still answers success, since the lead is logged and retried.
 */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`repair-book:${clientIp(req.headers)}`))
    return json(
      { ok: false, message: "Too many requests. Please try again in a few minutes." },
      429,
    );

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  const parsed = completeInputSchema.safeParse(raw);
  if (!parsed.success)
    return json(
      {
        ok: false,
        message: "Please check your details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      422,
    );

  try {
    return json({
      ok: true,
      result: await booking.completeIntake(verifySession(parsed.data.token), parsed.data),
    });
  } catch (err) {
    if (err instanceof SlotUnavailableError)
      return json({ ok: false, message: "That time was just taken. Please pick another." }, 409);
    console.error("[repair] completeIntake threw", err);
    return json({ ok: true, result: { reference: null, appointment: null } });
  }
}

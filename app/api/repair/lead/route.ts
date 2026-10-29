import { NextResponse, type NextRequest } from "next/server";
import { booking, signSession, verifySession } from "@/lib/booking";
import { checkRateLimit, clientIp } from "@/lib/forms/spam";
import {
  fieldInputSchema,
  startInputSchema,
  type FieldResponse,
  type StartResponse,
} from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: StartResponse | FieldResponse, status = 200) =>
  NextResponse.json(body, { status });

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/**
 * POST /api/repair/lead: step 2 (device, phone, email, attribution) → { token }. The token is the signed GHL session
 * the later steps send back; it's null when GHL couldn't be reached, and the widget carries on regardless.
 */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`repair-lead:${clientIp(req.headers)}`))
    return json(
      { ok: false, message: "Too many requests. Please try again in a few minutes." },
      429,
    );

  const parsed = startInputSchema.safeParse(await readJson(req));
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
    const session = await booking.startIntake(parsed.data);
    return json({ ok: true, token: session ? signSession(session) : null });
  } catch (err) {
    console.error("[repair] startIntake threw", err);
    return json({ ok: true, token: null });
  }
}

/** PATCH /api/repair/lead: steps 3–5 write one answer to the contact named in the token. */
export async function PATCH(req: NextRequest) {
  const parsed = fieldInputSchema.safeParse(await readJson(req));
  if (!parsed.success)
    return json(
      { ok: false, message: "Invalid request.", fieldErrors: parsed.error.flatten().fieldErrors },
      422,
    );

  const session = verifySession(parsed.data.token);
  if (!session) return json({ ok: false, message: "Session expired." }, 401);

  try {
    await booking.updateField(session, parsed.data.field, parsed.data.value);
  } catch (err) {
    console.error("[repair] updateField threw", err);
  }
  return json({ ok: true });
}

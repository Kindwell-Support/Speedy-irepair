import { NextResponse, type NextRequest } from "next/server";
import { booking } from "@/lib/booking";
import { checkRateLimit, clientIp } from "@/lib/forms/spam";
import { leadInputSchema, type LeadResponse } from "@/lib/repair-schemas";

export const dynamic = "force-dynamic";

const json = (body: LeadResponse, status = 200) => NextResponse.json(body, { status });

/** POST /api/repair/lead: device, issue and contact details → { leadId }, before the visitor picks a time. */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`repair-lead:${clientIp(req.headers)}`))
    return json({ ok: false, message: "Too many requests. Please try again in a few minutes." }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, message: "Please check your details.", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  try {
    const { leadId } = await booking.createLead(parsed.data);
    return json({ ok: true, leadId });
  } catch {
    return json({ ok: false, message: "Something went wrong. Please try again." }, 500);
  }
}

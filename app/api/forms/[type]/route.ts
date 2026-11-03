import { NextResponse, type NextRequest } from "next/server";
import { formSchemas, isFormType, spamFields, type FormResponse } from "@/lib/forms/schemas";
import { checkFillTime, checkHoneypot, checkRateLimit, clientIp, isTurnstileEnabled, verifyTurnstile } from "@/lib/forms/spam";
import { deliverSubmission } from "@/lib/forms/submit";
import { getSiteSettings } from "@/lib/sanity/content";
import { isProductionSite } from "@/lib/env";
import { isGhlConfigured } from "@/lib/env.server";
import { sendInquiry, sendInternet, sendQuote, sendTradeIn } from "@/lib/ghl/inquiry";
import type { ContactInput, InternetInput, QuoteInput, TradeInInput } from "@/lib/forms/schemas";

export const dynamic = "force-dynamic";

const json = (body: FormResponse, status = 200) => NextResponse.json(body, { status });

/**
 * POST /api/forms/{quote|tradein|contact|newsletter|internet}  (F1–F4 and the home internet address check)
 * Order: type check -> rate limit -> JSON parse -> spam fields (honeypot, fill time, Turnstile flag)
 *        -> zod validation -> GHL (contact, quote, trade-in and internet forms) -> deliver (Sanity formSubmission + signed webhook).
 * Spam hits get a fake success (no signal to bots) but are never stored.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isFormType(type)) return NextResponse.json({ ok: false, error: "server", message: "Unknown form." }, { status: 404 });

  const ip = clientIp(req.headers);
  if (!checkRateLimit(`${type}:${ip}`))
    return json({ ok: false, error: "rate_limited", message: "Too many submissions. Please try again in a few minutes." }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "server", message: "Invalid request." }, 400);
  }

  const spam = spamFields.safeParse(raw);
  if (!spam.success || !checkHoneypot(spam.data.company_website) || !checkFillTime(spam.data.startedAt))
    return json({ ok: true, stored: false, notified: false, staging: !isProductionSite });
  if (isTurnstileEnabled() && !(await verifyTurnstile(spam.data.turnstileToken, ip)))
    return json({ ok: false, error: "spam", message: "Verification failed. Please try again." }, 400);

  const parsed = formSchemas[type].safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: "validation", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  // Once GHL has the lead, a Sanity or webhook failure must not tell the visitor to send it again.
  const toGhl =
    type === "contact" ? () => sendInquiry(parsed.data as ContactInput)
    : type === "quote" ? () => sendQuote(parsed.data as QuoteInput)
    : type === "tradein" ? () => sendTradeIn(parsed.data as TradeInInput)
    : type === "internet" ? () => sendInternet(parsed.data as InternetInput)
    : undefined;
  const inGhl = isGhlConfigured && toGhl !== undefined && (await toGhl()) === true;

  try {
    const settings = await getSiteSettings();
    const result = await deliverSubmission(type, parsed.data as Record<string, unknown>, {
      pagePath: spam.data.pagePath,
      notificationEmail: settings.business.notificationEmail,
    });
    if (!result.configured && !inGhl && isProductionSite)
      return json({ ok: false, error: "not_configured", message: "Form delivery is not configured." }, 503);
    // The staging notice says nothing was kept, so it only shows when that's true.
    const delivered = inGhl || result.stored || result.notified;
    return json({ ok: true, stored: result.stored, notified: result.notified, staging: !isProductionSite && !delivered });
  } catch {
    if (inGhl) return json({ ok: true, stored: false, notified: false, staging: false });
    return json({ ok: false, error: "server", message: "Something went wrong. Please try again." }, 500);
  }
}

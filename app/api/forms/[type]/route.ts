import { NextResponse, type NextRequest } from "next/server";
import { formSchemas, isFormType, spamFields, type FormResponse } from "@/lib/forms/schemas";
import { checkFillTime, checkHoneypot, checkRateLimit, clientIp, isTurnstileEnabled, verifyTurnstile } from "@/lib/forms/spam";
import { deliverSubmission } from "@/lib/forms/submit";
import { getSiteSettings } from "@/lib/sanity/content";
import { isQaDryRun } from "@/lib/sanity/mutations";
import { isProductionSite } from "@/lib/env";

export const dynamic = "force-dynamic";

const json = (body: FormResponse, status = 200) => NextResponse.json(body, { status });

/**
 * POST /api/forms/{quote|tradein|contact|newsletter}  (F1–F4; F5 Square + Jotform are third-party embeds)
 * Order: type check -> rate limit -> JSON parse -> spam fields (honeypot, fill time, Turnstile flag)
 *        -> zod validation -> deliver (Sanity formSubmission + signed webhook).
 * Spam hits get a fake success (no signal to bots) but are never stored.
 * QA `x-qa-dry-run: 1`: success, nothing stored/sent (any env). Off production it also skips rate limit + fill time.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isFormType(type)) return NextResponse.json({ ok: false, error: "server", message: "Unknown form." }, { status: 404 });

  const ip = clientIp(req.headers);
  const dryRun = isQaDryRun(req.headers);
  if (!(dryRun && !isProductionSite) && !checkRateLimit(`${type}:${ip}`))
    return json({ ok: false, error: "rate_limited", message: "Too many submissions. Please try again in a few minutes." }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "server", message: "Invalid request." }, 400);
  }

  const spam = spamFields.safeParse(raw);
  if (!spam.success || !checkHoneypot(spam.data.company_website) || (!(dryRun && !isProductionSite) && !checkFillTime(spam.data.startedAt)))
    return json({ ok: true, stored: false, notified: false, staging: !isProductionSite });
  if (isTurnstileEnabled() && !(await verifyTurnstile(spam.data.turnstileToken, ip)))
    return json({ ok: false, error: "spam", message: "Verification failed. Please try again." }, 400);

  const parsed = formSchemas[type].safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: "validation", fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  try {
    const settings = await getSiteSettings();
    const result = await deliverSubmission(type, parsed.data as Record<string, unknown>, {
      pagePath: spam.data.pagePath,
      userAgent: req.headers.get("user-agent") ?? undefined,
      notificationEmail: settings.business.notificationEmail,
      dryRun,
    });
    if (result.dryRun) return json({ ok: true, stored: false, notified: false, staging: !isProductionSite, dryRun: true });
    if (!result.configured && isProductionSite)
      return json({ ok: false, error: "not_configured", message: "Form delivery is not configured." }, 503);
    return json({ ok: true, stored: result.stored, notified: result.notified, staging: !isProductionSite });
  } catch {
    return json({ ok: false, error: "server", message: "Something went wrong. Please try again." }, 500);
  }
}

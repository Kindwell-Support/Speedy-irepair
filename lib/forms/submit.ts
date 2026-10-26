import "server-only";
import { createHmac } from "node:crypto";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { buildFormSubmissionDoc, canStoreInSanity, fixtureSubmissionFile, storeFormSubmission } from "@/lib/sanity/mutations";
import type { FormTypeKey } from "./schemas";

/**
 * Delivery: (a) write a `formSubmission` doc to Sanity with the server-only write token, and
 * (b) POST JSON to FORM_WEBHOOK_URL with an HMAC-SHA256 signature header. Either, both or neither.
 * The webhook IS the notification mechanism (recipient default info@speedyirepair.com,
 * overridable via Sanity siteSettings.notificationEmail); the email-sending integration behind the
 * webhook is TBD (docs/ARCHITECTURE.md §Forms).
 * The Sanity write (and the fixture-mode JSONL sink) lives in lib/sanity/mutations.ts.
 * `dryRun` (QA header x-qa-dry-run: 1): validated upstream; nothing is stored and nothing is sent.
 */
export interface DeliveryResult {
  stored: boolean;
  notified: boolean;
  configured: boolean;
  dryRun?: boolean;
}

export const SIGNATURE_HEADER = "x-speedy-signature";

export function signPayload(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export async function deliverSubmission(
  type: FormTypeKey,
  payload: Record<string, unknown>,
  meta: { pagePath?: string; notificationEmail: string; userAgent?: string; dryRun?: boolean },
): Promise<DeliveryResult> {
  const createdAt = new Date().toISOString();
  const canStore = canStoreInSanity() || fixtureSubmissionFile() !== null;
  const canNotify = serverEnv.formWebhookUrl.length > 0;
  if (meta.dryRun) return { stored: false, notified: false, configured: true, dryRun: true };
  let stored = false;
  let notified = false;

  if (canNotify) {
    const body = JSON.stringify({
      event: "form.submitted",
      type,
      createdAt,
      site: publicEnv.siteUrl,
      env: publicEnv.siteEnv,
      notify: meta.notificationEmail,
      pagePath: meta.pagePath,
      payload,
    });
    const res = await fetch(serverEnv.formWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(serverEnv.formWebhookSecret
          ? { [SIGNATURE_HEADER]: signPayload(body, serverEnv.formWebhookSecret) }
          : {}),
      },
      body,
      cache: "no-store",
    });
    notified = res.ok;
    if (!res.ok) console.error(`[forms] webhook responded ${res.status}`);
  }

  const doc = buildFormSubmissionDoc(type, payload, {
    submittedAt: createdAt,
    webhookDelivered: notified,
    pagePath: meta.pagePath,
    userAgent: meta.userAgent,
  });
  const where = await storeFormSubmission(doc);
  stored = where === "sanity";

  // Fixture JSONL counts as "configured" on staging only (fixtureSubmissionFile() is null on production).
  return { stored, notified, configured: canStore || canNotify };
}

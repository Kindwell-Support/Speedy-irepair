import "server-only";
import { createHmac } from "node:crypto";
import { createClient } from "next-sanity";
import { publicEnv, isSanityConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { FormTypeKey } from "./schemas";

/**
 * Delivery: (a) write a `formSubmission` doc to Sanity with the server-only write token, and
 * (b) POST JSON to FORM_WEBHOOK_URL with an HMAC-SHA256 signature header. Either, both or neither.
 * The webhook IS the notification mechanism (recipient default info@speedyirepair.com,
 * overridable via Sanity siteSettings.notificationEmail); the email-sending integration behind the
 * webhook is TBD (docs/ARCHITECTURE.md §Forms).
 */
export interface DeliveryResult {
  stored: boolean;
  notified: boolean;
  configured: boolean;
}

export const SIGNATURE_HEADER = "x-speedy-signature";

export function signPayload(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export async function deliverSubmission(
  type: FormTypeKey,
  payload: Record<string, unknown>,
  meta: { pagePath?: string; notificationEmail: string },
): Promise<DeliveryResult> {
  const createdAt = new Date().toISOString();
  const canStore = isSanityConfigured && serverEnv.sanityWriteToken.length > 0;
  const canNotify = serverEnv.formWebhookUrl.length > 0;
  let stored = false;
  let notified = false;

  if (canStore) {
    const writeClient = createClient({
      projectId: publicEnv.sanityProjectId,
      dataset: publicEnv.sanityDataset,
      apiVersion: publicEnv.sanityApiVersion,
      token: serverEnv.sanityWriteToken,
      useCdn: false,
    });
    await writeClient.create({
      _type: "formSubmission",
      type,
      payload: JSON.stringify(payload),
      createdAt,
      status: "new",
      pagePath: meta.pagePath,
    });
    stored = true;
  }

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

  return { stored, notified, configured: canStore || canNotify };
}

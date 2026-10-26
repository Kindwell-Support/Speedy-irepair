import "server-only";
import { randomUUID } from "node:crypto";
import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "next-sanity";
import { publicEnv, isProductionSite, isSanityConfigured } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { FormTypeKey } from "@/lib/forms/schemas";

/**
 * Shared form-submission mutation helper (SCHEMA_CONTRACT v1.2 §3.9). The ONLY writer of `formSubmission`.
 * Used by lib/forms/submit.ts, which app/api/forms/[type] calls. Server-only (write token never reaches a client).
 */

/** QA harness (qa/README.md): `x-qa-dry-run: 1` => validate + succeed, but no storage and no webhook/email. */
export const QA_DRY_RUN_HEADER = "x-qa-dry-run";
export function isQaDryRun(headers: Pick<Headers, "get">): boolean {
  return headers.get(QA_DRY_RUN_HEADER)?.trim() === "1";
}

/** formSubmission.type (contract v1.2). URL segment `tradein` => `tradeIn`; the rest are identical. */
export type SubmissionType = "quote" | "tradeIn" | "contact" | "newsletter";
export const SUBMISSION_TYPE: Record<FormTypeKey, SubmissionType> = {
  quote: "quote",
  tradein: "tradeIn",
  contact: "contact",
  newsletter: "newsletter",
};

export interface FormSubmissionDoc {
  _id: `submissions.${string}`;
  _type: "formSubmission";
  type: SubmissionType;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  payload?: { deviceType?: string; brand?: string; model?: string; issue?: string; condition?: string };
  pagePath?: string;
  submittedAt: string;
  status: "new";
  webhookDelivered: boolean;
  userAgent?: string;
}

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v : undefined);

export function buildFormSubmissionDoc(
  type: FormTypeKey,
  data: Record<string, unknown>,
  meta: { submittedAt: string; webhookDelivered: boolean; pagePath?: string; userAgent?: string },
): FormSubmissionDoc {
  const isLead = type === "quote" || type === "tradein";
  return {
    // `submissions.` dot-path = private document: never returned to unauthenticated / CDN reads.
    _id: `submissions.${randomUUID()}`,
    _type: "formSubmission",
    type: SUBMISSION_TYPE[type],
    name: str(data.name),
    email: str(data.email),
    phone: str(data.phone),
    message: str(data.message) ?? str(data.details),
    payload: isLead
      ? { deviceType: str(data.deviceType), brand: str(data.brand), model: str(data.model), issue: str(data.issue), condition: str(data.condition) }
      : undefined,
    pagePath: str(meta.pagePath),
    submittedAt: meta.submittedAt,
    status: "new",
    webhookDelivered: meta.webhookDelivered,
    userAgent: meta.userAgent?.slice(0, 300),
  };
}

export const canStoreInSanity = (): boolean => isSanityConfigured && serverEnv.sanityWriteToken.length > 0;

/**
 * FIXTURE MODE sink: no Sanity => append the doc as one JSON line to FORM_FIXTURE_FILE
 * (default `<tmpdir>/speedy-irepair-form-submissions.jsonl`; `off` disables). Never on production.
 */
export function fixtureSubmissionFile(): string | null {
  const v = process.env.FORM_FIXTURE_FILE ?? "";
  if (isProductionSite || v === "off") return null;
  return v || join(tmpdir(), "speedy-irepair-form-submissions.jsonl");
}

export type StoreResult = "sanity" | "fixture-file" | "dry-run" | "none";

export async function storeFormSubmission(doc: FormSubmissionDoc, opts: { dryRun?: boolean } = {}): Promise<StoreResult> {
  if (opts.dryRun) return "dry-run";
  if (canStoreInSanity()) {
    const writeClient = createClient({
      projectId: publicEnv.sanityProjectId,
      dataset: publicEnv.sanityDataset,
      apiVersion: publicEnv.sanityApiVersion,
      token: serverEnv.sanityWriteToken,
      useCdn: false,
    });
    await writeClient.create(doc);
    return "sanity";
  }
  const file = fixtureSubmissionFile();
  if (!file) return "none";
  try {
    await appendFile(file, JSON.stringify(doc) + "\n", "utf8");
    // id + type only: no PII in logs.
    console.info(`[forms:fixture] ${doc.type} ${doc._id} -> ${file}`);
    return "fixture-file";
  } catch (error) {
    console.error("[forms:fixture] could not write", file, error);
    return "none";
  }
}

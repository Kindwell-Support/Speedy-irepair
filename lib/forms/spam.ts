import "server-only";
import { serverEnv } from "@/lib/env.server";

/**
 * Spam protection pipeline (docs/ARCHITECTURE.md §Forms):
 * 1. Honeypot `company_website` must be empty (checked by zod schema + here).
 * 2. Minimum fill time: now - startedAt >= MIN_FILL_MS and <= MAX_AGE_MS.
 * 3. Per-IP rate limit: RATE_LIMIT requests per RATE_WINDOW_MS per form type, in-memory per
 *    serverless instance (best-effort; upgrade path = Vercel KV/Upstash, documented, not added).
 * 4. Optional Cloudflare Turnstile when FORMS_TURNSTILE_ENABLED=true and TURNSTILE_SECRET_KEY set.
 */
export const MIN_FILL_MS = 2500;
export const MAX_AGE_MS = 1000 * 60 * 60 * 24;
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 1000 * 60 * 10;

const hits = new Map<string, number[]>();

export function checkHoneypot(value: string | undefined): boolean {
  return !value;
}

export function checkFillTime(startedAt: number, now = Date.now()): boolean {
  const elapsed = now - startedAt;
  return elapsed >= MIN_FILL_MS && elapsed <= MAX_AGE_MS;
}

export function checkRateLimit(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // memory guard
  return true;
}

export const isTurnstileEnabled = (): boolean =>
  serverEnv.formsTurnstileEnabled && serverEnv.turnstileSecretKey.length > 0;

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret: serverEnv.turnstileSecretKey, response: token, remoteip: ip });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

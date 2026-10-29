import "server-only";
import { serverEnv } from "@/lib/env.server";

/**
 * Minimal GoHighLevel API v2 client. Private Integration tokens only work on v2 (services.leadconnectorhq.com),
 * and every call needs the Version header. Server-only: the token never reaches the browser.
 */
const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const TIMEOUT_MS = 8000;

export class GhlError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "GhlError";
  }
}

/** Worth trying again: network failures, timeouts, rate limits and GHL-side errors. A 4xx won't fix itself. */
export const isRetriable = (err: unknown): boolean =>
  !(err instanceof GhlError) || err.status === 429 || err.status >= 500;

export async function ghl<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  opts: { revalidate?: number } = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serverEnv.ghlApiToken}`,
      Version: API_VERSION,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...(opts.revalidate
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" as const }),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const raw = (json as { message?: unknown } | undefined)?.message;
    const message = Array.isArray(raw)
      ? raw.join("; ")
      : typeof raw === "string"
        ? raw
        : `HTTP ${res.status}`;
    throw new GhlError(res.status, `${method} ${path.split("?")[0]}: ${message}`, json);
  }
  return json as T;
}

/** US numbers to E.164 (+13305551234), which is what GHL matches duplicates on. Anything else passes through. */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env.server";

/**
 * The intake session the widget carries between steps: the GHL contact and opportunity created at step 2, signed so
 * the field and booking routes only ever write to the contact this visitor created (a bare contactId from the
 * browser could be anyone's). The key is derived from the GHL token, so there's no extra secret to configure.
 */
export interface IntakeSession {
  contactId: string;
  /** Null when the opportunity couldn't be created at step 2; step 7 finds or creates it. */
  opportunityId: string | null;
}

const TTL_MS = 1000 * 60 * 60 * 24;
const key = createHash("sha256")
  .update(`repair-intake-session:v1:${serverEnv.ghlApiToken || "mock"}`)
  .digest();

const mac = (data: string) => createHmac("sha256", key).update(data).digest("base64url");

export function signSession(session: IntakeSession): string {
  const data = Buffer.from(
    JSON.stringify({ c: session.contactId, o: session.opportunityId, e: Date.now() + TTL_MS }),
  ).toString("base64url");
  return `${data}.${mac(data)}`;
}

/** The session, or null when the token is missing, tampered with or expired. */
export function verifySession(token: string | null | undefined): IntakeSession | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(mac(data));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { c, o, e } = JSON.parse(Buffer.from(data, "base64url").toString()) as {
      c?: unknown;
      o?: unknown;
      e?: unknown;
    };
    if (typeof c !== "string" || typeof e !== "number" || e < Date.now()) return null;
    return { contactId: c, opportunityId: typeof o === "string" ? o : null };
  } catch {
    return null;
  }
}

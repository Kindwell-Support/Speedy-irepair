import "server-only";
import { after } from "next/server";
import { isRetriable } from "./client";

/** Waits before each background retry. Kept short: retries run in the same serverless invocation, after the response. */
const RETRY_DELAYS_MS = [2000, 8000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const describe = (err: unknown) => (err instanceof Error ? err.message : String(err));

/**
 * Runs a GHL write now and never throws: the customer is never blocked on GHL. If it fails with something worth
 * retrying, it's retried after the response is sent (next/server `after`); if it still fails, or can't succeed,
 * the line `[ghl] FAILED <label>` is logged with the payload so the lead can be recovered by hand.
 * `rethrow` lets the caller see specific errors (e.g. a taken slot) instead of having them swallowed.
 * Returns the result, or undefined when the first try failed.
 */
export async function attempt<T>(
  label: string,
  payload: unknown,
  fn: () => Promise<T>,
  rethrow: (err: unknown) => boolean = () => false,
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    if (rethrow(err)) throw err;
    if (!isRetriable(err)) {
      console.error(`[ghl] FAILED ${label}`, { error: describe(err), payload });
      return undefined;
    }
    console.warn(`[ghl] ${label} failed, retrying in the background`, { error: describe(err) });
    after(async () => {
      let last = err;
      for (const delay of RETRY_DELAYS_MS) {
        await sleep(delay);
        try {
          await fn();
          console.info(`[ghl] ${label} succeeded on retry`);
          return;
        } catch (retryErr) {
          last = retryErr;
          if (rethrow(retryErr) || !isRetriable(retryErr)) break;
        }
      }
      console.error(`[ghl] FAILED ${label}`, { error: describe(last), payload });
    });
    return undefined;
  }
}

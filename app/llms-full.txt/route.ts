import { client } from "@/sanity/lib/client";
import { LLMS_FULL_TXT_QUERY } from "@/sanity/lib/seoQueries"; // = cms/adapters/seoQueries.ts (reads singleton llmsContent)
import { LLMS_FULL_TXT_DEFAULT } from "@/lib/seo/llms-defaults";

/**
 * GET /llms-full.txt — text/plain, 200. Content from the Sanity singleton `llmsContent.fullVersion`
 * (seeded from seo/llms-full.txt, the §5.3 expansion). Falls back to the static default if Sanity is
 * empty or unreachable, so this route can never 404/500.
 * Revalidate: ISR hourly + on-demand via Sanity webhook -> revalidateTag('llms').
 */
export const revalidate = 3600;

export async function GET() {
  let body = LLMS_FULL_TXT_DEFAULT;
  try {
    const doc = await client.fetch<{ llmsFullTxt?: string } | null>(
      LLMS_FULL_TXT_QUERY,
      {},
      { next: { tags: ["llms"] } },
    );
    if (doc?.llmsFullTxt && doc.llmsFullTxt.trim().length > 0)
      body = doc.llmsFullTxt.replace(/\r\n/g, "\n");
  } catch {
    /* fall back to default */
  }
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

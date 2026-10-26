import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { serverEnv } from "@/lib/env.server";

export const dynamic = "force-dynamic";

type Body = { _type?: string; slug?: string; tags?: string[] };

/**
 * Sanity GROQ webhook -> on-demand ISR. Signed with SANITY_REVALIDATE_SECRET (sanity-webhook-signature).
 * Revalidates the document type tag + "sanity" + SEO tags ("seo", "llms") used by the SEO lane.
 */
export async function POST(req: NextRequest) {
  if (!serverEnv.sanityRevalidateSecret) return NextResponse.json({ ok: false, message: "Not configured" }, { status: 503 });
  try {
    const { isValidSignature, body } = await parseBody<Body>(req, serverEnv.sanityRevalidateSecret, true);
    if (!isValidSignature) return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
    const tags = new Set<string>(["sanity", "seo"]);
    if (body?._type) tags.add(body._type);
    if (body?._type === "llmsDocument" || body?._type === "llmsContent") tags.add("llms");
    body?.tags?.forEach((t) => tags.add(t));
    tags.forEach((t) => revalidateTag(t));
    if (body?._type === "siteSettings" || body?._type === "navigation") revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, revalidated: [...tags] });
  } catch {
    return NextResponse.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}

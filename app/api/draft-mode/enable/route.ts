import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { sanityClient } from "@/lib/sanity/client";
import { serverEnv } from "@/lib/env.server";

/** Presentation tool -> enables Next draft mode after validating the preview secret with Sanity. */
export const GET = sanityClient
  ? defineEnableDraftMode({ client: sanityClient.withConfig({ token: serverEnv.sanityReadToken }) }).GET
  : () => new Response("Sanity is not configured", { status: 503 });

import { createClient, type SanityClient } from "next-sanity";
import { publicEnv, isSanityConfigured } from "@/lib/env";

/**
 * Read client (CDN, published perspective). Only created when Sanity is configured; the content
 * layer never calls it otherwise (fixtures are served instead).
 */
export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: publicEnv.sanityProjectId,
      dataset: publicEnv.sanityDataset,
      apiVersion: publicEnv.sanityApiVersion,
      useCdn: true,
      perspective: "published",
      stega: { studioUrl: "/studio" },
    })
  : null;

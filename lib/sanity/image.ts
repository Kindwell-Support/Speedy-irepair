import createImageUrlBuilder from "@sanity/image-url";
import type { ImageLoader } from "next/image";
import { publicEnv } from "@/lib/env";

const builder = createImageUrlBuilder({
  projectId: publicEnv.sanityProjectId || "placeholder",
  dataset: publicEnv.sanityDataset,
});

export const urlForImage = builder;

/**
 * next/image loader for Sanity CDN URLs (cdn.sanity.io). Appends width/quality/auto=format so the
 * Sanity CDN does the resizing (no Next image optimizer cost). Used by components/ui/SmartImage.
 */
export const sanityImageLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
};

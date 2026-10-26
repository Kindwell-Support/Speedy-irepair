import Image from "next/image";
import { sanityImageLoader } from "@/lib/sanity/image";
import type { ImageAsset } from "@/lib/sanity/types";

/**
 * The only image component for content images. Sanity assets use the Sanity CDN loader;
 * static assets use next/image optimisation. `sizes` is REQUIRED; `priority` only for the LCP image.
 */
export function SmartImage({
  image,
  sizes,
  priority = false,
  className,
}: {
  image: ImageAsset;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={className}
      {...(image.isSanity ? { loader: sanityImageLoader } : {})}
      {...(image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {})}
    />
  );
}

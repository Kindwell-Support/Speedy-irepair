import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ImageAsset, PortableTextBlock } from "@/lib/sanity/types";

const components: PortableTextComponents = {
  types: {
    // Inline photos in blog posts (projected to ImageAsset in postBySlugQuery).
    imageWithAlt: ({ value }: { value: Partial<ImageAsset> }) =>
      value?.src ? (
        <figure className="my-8">
          <div className="photo">
            <Image
              src={value.src}
              alt={value.alt ?? ""}
              width={value.width ?? 1600}
              height={value.height ?? 1000}
              sizes="(min-width: 768px) 65ch, 100vw"
              className="h-auto w-full"
            />
          </div>
        </figure>
      ) : null,
  },
  block: {
    h2: ({ children }) => <h2 className="mb-4 mt-10 text-h3">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-8 text-h4">{children}</h3>,
    normal: ({ children }) => <p className="mb-4 text-body text-text-primary">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-primary-text underline underline-offset-4"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function RichText({ value }: { value: PortableTextBlock[] | null | undefined }) {
  if (!value?.length) return null;
  return (
    <div className="max-w-prose">
      <PortableText value={value} components={components} />
    </div>
  );
}

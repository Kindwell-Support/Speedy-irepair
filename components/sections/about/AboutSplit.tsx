import type { ReactNode } from "react";
import { toPlainText } from "@portabletext/react";
import type { SectionCopy } from "@/lib/sanity/types";
import { Section } from "@/components/ui/Section";
import { RichText } from "@/components/ui/RichText";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * Design about.html `.about-split` (5fr / 7fr at lg): an aside slot (lede + badge, or a photo) and the
 * CMS body. Placeholder bodies (aboutIsPlaceholder / storyIsPlaceholder) are visibly marked.
 */
export function AboutSplit({
  id,
  copy,
  aside,
  tone,
}: {
  id: string;
  copy: SectionCopy;
  aside: ReactNode;
  tone?: "default" | "raised";
}) {
  const body = copy.body?.length ? copy.body : null;
  return (
    <Section
      id={id}
      copy={{ eyebrow: copy.eyebrow, heading: copy.heading }}
      tone={tone}
      className="border-t border-border-subtle"
    >
      <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16 [&>*]:min-w-0">
        <div className="grid content-start gap-6">{aside}</div>
        <div className="prose-site grid content-start gap-4 text-body text-text-secondary">
          {body && copy.isPlaceholder ? (
            <p>
              <PlaceholderMark show>{toPlainText(body)}</PlaceholderMark>
            </p>
          ) : body ? (
            <RichText value={body} />
          ) : copy.intro ? (
            <p>
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

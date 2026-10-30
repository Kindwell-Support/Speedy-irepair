import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";

/** A short "ask us" section with a Contact Us button, for pages where a visitor can run out of answers. */
export function ContactPrompt({ id, heading, intro }: { id: string; heading: string; intro: string }) {
  return (
    <Section
      id={id}
      copy={{ heading, intro }}
      aside={
        <div>
          <ButtonLink cta={{ label: "Contact Us", href: "/contact" }} />
        </div>
      }
    />
  );
}

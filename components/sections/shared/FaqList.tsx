import type { Faq } from "@/lib/sanity/types";
import { Accordion } from "@/components/motion/Accordion";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/** FAQ accordion. Answers stay in the DOM (FAQPage parity). engine: framer (home) | gsap (/faq). */
export function FaqList({ faqs, engine = "framer" }: { faqs: Faq[]; engine?: "framer" | "gsap" }) {
  return (
    <Accordion
      engine={engine}
      className="divide-y divide-border rounded-xl border border-border bg-surface"
      buttonClassName="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-body-lg font-semibold text-text"
      panelClassName="px-6 pb-5 text-body text-text-secondary"
      items={faqs.map((f) => ({
        id: f.id,
        question: <PlaceholderMark show={f.isPlaceholder}>{f.question}</PlaceholderMark>,
        answer: <p>{f.answer}</p>,
      }))}
    />
  );
}

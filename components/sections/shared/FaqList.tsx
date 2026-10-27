import type { Faq } from "@/lib/sanity/types";
import { Accordion } from "@/components/motion/Accordion";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * FAQ accordion. Answers stay in the DOM (FAQPage parity). engine: framer (home) | gsap (/faq).
 * Ruled rows, no card. Questions are set in the reading face (Rajdhani): they are read, not announced.
 */
export function FaqList({ faqs, engine = "framer" }: { faqs: Faq[]; engine?: "framer" | "gsap" }) {
  return (
    <Accordion
      engine={engine}
      className="border-b border-border"
      itemClassName="border-t border-border"
      buttonClassName="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-sans text-h5 font-bold text-text transition-colors duration-fast hover:text-primary-text aria-expanded:text-primary-text focus-visible:shadow-focus"
      panelClassName="max-w-[68ch] pb-7 pr-10 text-body-lg text-text-secondary"
      items={faqs.map((f) => ({
        id: f.id,
        question: <PlaceholderMark show={f.isPlaceholder}>{f.question}</PlaceholderMark>,
        answer: <p>{f.answer}</p>,
      }))}
    />
  );
}

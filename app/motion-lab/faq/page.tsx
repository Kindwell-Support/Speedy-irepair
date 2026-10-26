import { FAQS } from "../_data";

/** /faq: GSAP accordion = progressive enhancement of native <details> via [data-faq]. */
export default function MotionLabFaq() {
  return (
    <section className="py-section">
      <div className="container-site flex max-w-prose flex-col gap-8">
        <h1 className="text-h1" data-split="words" data-split-trigger="load">Frequently asked questions</h1>
        <div className="accordion" data-faq="single" data-animate="reveal">
          {[...FAQS, ...FAQS].map((f, i) => (
            <details key={i} className="accordion__item border-b border-border" open={i === 0}>
              <summary className="accordion__trigger flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-h6">
                {f.q}
                <span aria-hidden className="text-brand">+</span>
              </summary>
              <div className="accordion__panel">
                <p className="pb-4 text-text-secondary">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="h-[30vh]" />
    </section>
  );
}

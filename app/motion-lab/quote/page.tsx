import { QuoteDemo } from "./QuoteDemo";

export default function MotionLabQuote() {
  return (
    <section className="py-section">
      <div className="container-site max-w-prose">
        <h1 className="mb-8 text-h1" data-split="words" data-split-trigger="load">Instant quote</h1>
        <QuoteDemo />
      </div>
    </section>
  );
}

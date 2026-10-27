import type { Promotion, SectionCopy } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * Spec 2.1.7. The page's one full field of brand red: the heading on the left, each offer a row on the right
 * with a black button. White on --color-primary is 5.1:1, so body text can sit on it; the focus ring
 * switches to white because the usual red ring would vanish here.
 */
export function Promotions({ copy, items }: { copy: SectionCopy; items: Promotion[] }) {
  return (
    <section id="promotions" aria-labelledby="promotions-heading" className="bg-primary py-section text-text">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <h2 id="promotions-heading" className="text-h2">
            {copy.heading}
          </h2>
          {copy.intro ? (
            <p className="mt-5 max-w-[40ch] text-body-lg">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
        </div>
        <ul className="border-y border-white/30 lg:col-span-8 lg:col-start-5">
          {items.map((p) => (
            <li
              key={p.id}
              className="grid gap-5 border-b border-white/30 py-7 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:py-9"
            >
              <div>
                <h3 className="max-w-[24ch] text-h3">
                  <PlaceholderMark show={p.isPlaceholder}>{p.title}</PlaceholderMark>
                </h3>
                {p.body ? <p className="mt-2 max-w-[56ch] text-body-lg">{p.body}</p> : null}
              </div>
              <ButtonLink
                cta={{ ...p.cta, variant: "secondary" }}
                className="self-start border-bg shadow-none hover:border-surface md:self-auto focus-visible:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

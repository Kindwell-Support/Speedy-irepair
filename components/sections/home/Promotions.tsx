import type { Promotion, SectionCopy } from "@/lib/sanity/types";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";

/**
 * Spec 2.1.7. The page's one full field of brand red. Each offer is set in its own row, below the section heading in size, the
 * offer on the left and what it means plus a dark button on the right; no boxes, the type carries it. White on
 * --color-primary is 5.1:1, so body text can sit on it; the focus ring switches to white because the usual red
 * ring would vanish here.
 */
export function Promotions({ copy, items }: { copy: SectionCopy; items: Promotion[] }) {
  return (
    <section id="promotions" aria-labelledby="promotions-heading" className="bg-primary py-16 text-text md:py-20">
      <div className="container-site">
        <div data-animate="reveal" data-reveal="children" className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <h2 id="promotions-heading" className="text-h2 lg:col-span-7">
            {copy.heading}
          </h2>
          {copy.intro ? (
            <p className="max-w-[40ch] text-body-lg lg:col-span-4 lg:col-start-9">
              <PlaceholderMark show={copy.isPlaceholder}>{copy.intro}</PlaceholderMark>
            </p>
          ) : null}
        </div>
        <ul className="mt-10 grid gap-8 md:mt-12 md:gap-10" data-stagger>
          {items.map((p) => (
            <li key={p.id} className="grid gap-4 md:grid-cols-12 md:items-center md:gap-x-8">
              <h3 className="font-heading text-h3 font-black md:col-span-8">
                <PlaceholderMark show={p.isPlaceholder}>{p.title}</PlaceholderMark>
              </h3>
              <div className="md:col-span-4">
                {p.body ? <p className="max-w-[36ch] text-body-lg">{p.body}</p> : null}
                <ButtonLink
                  cta={{ ...p.cta, variant: "secondary" }}
                  size="lg"
                  className="mt-4 focus-visible:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

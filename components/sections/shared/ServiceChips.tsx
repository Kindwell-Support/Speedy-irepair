import type { Service } from "@/lib/sanity/types";
import { navTitle } from "./navTitle";

/** Design .svc-chips: horizontally scrolling jump links above the services list below lg. */
export function ServiceChips({
  services,
  ariaLabel,
}: {
  services: Pick<Service, "id" | "slug" | "title">[];
  ariaLabel: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden"
    >
      <ul className="flex w-max gap-2">
        {services.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.slug}`}
              data-toc-link={s.slug}
              title={s.title}
              className="inline-flex h-8 max-w-[calc(100vw-48px)] items-center rounded-full border border-border px-4 text-body-sm text-text-secondary hover:border-border-strong hover:text-text aria-[current=true]:border-text aria-[current=true]:bg-text aria-[current=true]:text-text-inverse"
            >
              <span className="truncate">{navTitle(s.title)}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

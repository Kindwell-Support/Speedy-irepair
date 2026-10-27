import type { Service } from "@/lib/sanity/types";
import { navTitle } from "./navTitle";

/**
 * Design .svc-index (sticky, ≥lg) and .svc-chips (horizontal jump chips, <lg). No JS: anchors only;
 * active-section highlighting (aria-current) is the Motion lane's scroll-spy via data-toc hooks.
 */
export function ServicesIndex({
  services,
  label,
  ariaLabel,
}: {
  services: Pick<Service, "id" | "slug" | "title">[];
  label: string;
  ariaLabel: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      data-testid="services-index"
      data-animate="toc-spy"
      className="hidden self-start lg:sticky lg:top-[calc(var(--nav-h-desktop)+24px)] lg:block"
    >
      <p className="mb-4 text-label font-semibold uppercase text-text-secondary">{label}</p>
      <ol className="grid gap-[2px] border-l border-border-subtle">
        {services.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.slug}`}
              data-toc-link={s.slug}
              className="group -ml-px flex min-h-8 items-center gap-2 border-l border-transparent py-1 pl-4 text-body-sm text-text-tertiary hover:text-text aria-[current=true]:border-brand aria-[current=true]:text-text"
            >
              <span className="w-7 shrink-0 tabular-nums text-text-tertiary group-aria-[current=true]:text-primary-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              {navTitle(s.title)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

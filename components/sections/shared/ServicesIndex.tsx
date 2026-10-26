import type { Service } from "@/lib/sanity/types";

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
      <ol className="gap-0.5 grid border-l border-border-subtle">
        {services.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.slug}`}
              data-toc-link={s.slug}
              className="py-1.5 group -ml-px flex gap-2 border-l border-transparent pl-4 text-body-sm text-text-tertiary hover:text-text aria-[current=true]:border-brand aria-[current=true]:text-text"
            >
              <span className="w-7 shrink-0 tabular-nums text-text-tertiary group-aria-[current=true]:text-primary-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

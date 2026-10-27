type Item = { id: string; text: string };

function TocList({ items }: { items: Item[] }) {
  return (
    <ol className="grid gap-[2px] border-l border-border-subtle">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            data-toc-link={item.id}
            className="-ml-px flex min-h-8 items-center border-l border-transparent py-1 pl-4 text-body-sm text-text-tertiary hover:text-text aria-[current=true]:border-brand aria-[current=true]:text-text"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Design PolicyLayout contents list: sticky nav ≥lg, <details> disclosure below lg (no JS).
 * Active-section highlighting (aria-current) is the Motion lane's IntersectionObserver via data-toc hooks.
 */
export function PolicyToc({ label, items }: { label: string; items: Item[] }) {
  if (!items.length) return null;
  return (
    <>
      <nav
        aria-label={label}
        data-testid="policy-toc"
        data-animate="toc-spy"
        className="hidden self-start lg:sticky lg:top-[calc(var(--nav-h-desktop)+24px)] lg:block"
      >
        <p className="mb-4 text-label font-semibold uppercase text-text-secondary">{label}</p>
        <TocList items={items} />
      </nav>
      <details className="group lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-md border border-border bg-surface px-6 py-4 font-semibold group-open:rounded-b-none [&::-webkit-details-marker]:hidden">
          {label}
          <span aria-hidden="true" className="group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            &minus;
          </span>
        </summary>
        <div className="rounded-b-md border border-t-0 border-border pb-4 pr-4 pt-2">
          <TocList items={items} />
        </div>
      </details>
    </>
  );
}

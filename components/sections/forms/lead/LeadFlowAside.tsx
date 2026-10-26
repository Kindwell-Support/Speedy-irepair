import type { LeadAsideCard } from "@/lib/sanity/types";
import { telHref } from "@/lib/utils/format";
import { LeadIcon } from "./LeadIcon";

/** Design .aside next to the LeadFlow: info cards + "Rather talk?" phone card. Sticky at lg. Server-rendered. */
export function LeadFlowAside({
  label,
  cards,
  contactLabel,
  phone,
  address,
}: {
  label: string;
  cards: LeadAsideCard[];
  contactLabel: string;
  phone: string;
  address: string;
}) {
  const card = "grid gap-4 rounded-lg border border-border-subtle bg-surface p-6";
  const title = "text-label font-semibold uppercase text-text-secondary";
  return (
    <aside
      aria-label={label}
      className="grid content-start gap-4 lg:sticky lg:top-[calc(var(--nav-h-desktop)+24px)]"
    >
      {cards.map((c) => (
        <div key={c.label} className={card}>
          <p className={title}>{c.label}</p>
          {c.body ? <p className="text-body text-text-secondary">{c.body}</p> : null}
          {c.items?.length ? (
            <ul className="grid list-none gap-4">
              {c.items.map((it) => (
                <li key={it.text} className="flex items-start gap-4 text-body text-text-secondary">
                  <LeadIcon name="check" size={18} className="mt-[3px] shrink-0 text-brand" />
                  <span>
                    {it.strong ? (
                      <strong className="font-semibold text-text">{it.strong} </strong>
                    ) : null}
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      <div className={card}>
        <p className={title}>{contactLabel}</p>
        <a
          className="text-h4 font-semibold tabular-nums text-text hover:text-primary-text"
          href={telHref(phone)}
        >
          {phone}
        </a>
        <p className="text-caption text-text-tertiary">{address}</p>
      </div>
    </aside>
  );
}

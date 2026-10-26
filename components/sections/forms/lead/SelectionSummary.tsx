/** Design .summary: read-only tags of earlier answers. */
export function SelectionSummary({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  return (
    <ul aria-label={label} className="mb-6 mt-4 flex list-none flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="inline-flex h-7 items-center rounded-full border border-border px-4 text-caption text-text-secondary"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

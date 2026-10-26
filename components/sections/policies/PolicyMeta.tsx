/** Design .policy-meta under the policy H1: "Last updated: …" · "Source: …". Renders only fields that exist. */
export function PolicyMeta({
  lastUpdated,
  sourceUrl,
  lastUpdatedLabel,
  sourceLabel,
}: {
  lastUpdated?: string | null;
  sourceUrl?: string | null;
  lastUpdatedLabel: string;
  sourceLabel: string;
}) {
  const date = lastUpdated ? new Date(`${lastUpdated}T00:00:00Z`) : null;
  const dateText =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : null;
  const source = sourceUrl ? sourceUrl.replace(/^https?:\/\/(www\.)?/, "") : null;
  if (!dateText && !source) return null;
  return (
    <p
      className="mt-6 flex flex-wrap items-center gap-4 text-caption text-text-tertiary"
      data-testid="policy-meta"
    >
      {dateText && lastUpdated ? (
        <span>
          {lastUpdatedLabel}: <time dateTime={lastUpdated}>{dateText}</time>
        </span>
      ) : null}
      {dateText && source ? <span aria-hidden="true">·</span> : null}
      {source && sourceUrl ? (
        <span>
          {sourceLabel}:{" "}
          <a
            href={sourceUrl}
            className="underline-offset-4 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {source}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </span>
      ) : null}
    </p>
  );
}

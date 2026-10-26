import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";

/** Design `.info-card`: bordered icon tile (brand stroke), t-h4 title, optional body. */
export function InfoCard({
  icon,
  title,
  body,
}: {
  icon: LineIconName;
  title: string;
  body?: string | null;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-8">
      <span className="mb-2 grid size-12 place-items-center rounded-md border border-border text-brand">
        <LineIcon name={icon} />
      </span>
      <h3 className="text-h4">{title}</h3>
      {body ? <p className="text-body-sm text-text-secondary">{body}</p> : null}
    </li>
  );
}

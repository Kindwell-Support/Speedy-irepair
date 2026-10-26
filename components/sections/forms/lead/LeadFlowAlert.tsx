import { telHref } from "@/lib/utils/format";
import { LeadIcon } from "./LeadIcon";

/** Design .alert--error for a failed submission (network / server). Answers stay in state. `phone` = display form (1.855.377.3339). */
export function LeadFlowAlert({
  title,
  body,
  phone,
}: {
  title: string;
  body: string;
  phone: string;
}) {
  return (
    <div
      role="alert"
      className="border-error/35 mb-6 flex items-start gap-4 rounded-md border bg-error-tint px-6 py-4 text-body-sm text-text"
    >
      <LeadIcon name="alert" size={20} className="mt-px shrink-0 text-error" />
      <div>
        <strong className="block font-semibold text-text">{title}</strong>
        {body}{" "}
        <a className="tabular-nums underline" href={telHref(phone)}>
          {phone}
        </a>
        .
      </div>
    </div>
  );
}

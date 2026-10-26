import { cn } from "@/lib/utils/cn";
import { LeadIcon } from "./LeadIcon";

/** Design .field__msg: icon + caption under a field. Error tone carries the QA hook "field-error". */
export function FieldMessage({
  id,
  message,
  tone = "error",
}: {
  id: string;
  message: string;
  tone?: "error" | "success";
}) {
  return (
    <p
      id={id}
      data-testid={tone === "error" ? "field-error" : undefined}
      className={cn(
        "flex items-center gap-[6px] text-caption",
        tone === "error" ? "text-error" : "text-success",
      )}
    >
      <LeadIcon name={tone === "error" ? "alert" : "check"} size={14} />
      {message}
    </p>
  );
}

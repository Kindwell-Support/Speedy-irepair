import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { FieldMessage } from "./FieldMessage";

const control =
  "w-full rounded-md border bg-surface-2 px-4 text-body text-text placeholder:text-text-tertiary focus-visible:border-brand focus-visible:shadow-focus";

/** Design .field: label, input/textarea, message. Error = red border + error tint (field--error). */
export function LeadTextField({
  id,
  label,
  optionalLabel,
  error,
  value,
  onValue,
  multiline,
  className,
  ...rest
}: {
  id: string;
  label: string;
  /** Rendered muted after the label ("(optional)") */
  optionalLabel?: string;
  error?: string;
  value: string;
  onValue: (v: string) => void;
  multiline?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const msgId = `${id}-msg`;
  const shared = {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? msgId : undefined,
  } as const;
  const tone = error ? "border-error bg-error-tint" : "border-border";
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="text-body-sm font-medium text-text">
        {label}
        {optionalLabel ? (
          <span className="font-normal text-text-tertiary"> {optionalLabel}</span>
        ) : null}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={3}
          value={value}
          placeholder={rest.placeholder}
          onChange={(e) => onValue(e.target.value)}
          className={cn(control, tone, "min-h-[96px] py-3")}
        />
      ) : (
        <input
          {...shared}
          {...rest}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          className={cn(control, tone, "h-control-md")}
        />
      )}
      {error ? <FieldMessage id={msgId} message={error} /> : null}
    </div>
  );
}

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

const control =
  "w-full rounded-md border border-border bg-surface-2 px-4 text-body text-text placeholder:text-text-tertiary focus-visible:border-brand aria-[invalid=true]:border-error";

function Wrap({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium text-text-primary">
        {label}
      </label>
      {children}
      {hint ? <p className="text-caption text-text-tertiary">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} data-testid="field-error" className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Common = { id: string; label: string; error?: string; hint?: string };

export function TextField({
  id,
  label,
  error,
  hint,
  className,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, "h-control-md", className)}
        {...rest}
      />
    </Wrap>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  className,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        name={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, "py-3", className)}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  options,
  className,
  ...rest
}: Common & { options: readonly string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        name={id}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, "h-control-md", className)}
        {...rest}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

/** Visually hidden honeypot. Bots fill it; humans never see it. */
export function Honeypot(
  props: InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> },
) {
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
      <label htmlFor="company_website">Company website</label>
      <input id="company_website" {...props} />
    </div>
  );
}

export const fieldError = (
  errors: Record<string, string[] | undefined> | undefined,
  key: string,
): string | undefined => errors?.[key]?.[0];

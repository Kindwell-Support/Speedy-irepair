import type { LeadOption } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";
import { FieldMessage } from "./FieldMessage";
import { LeadIcon } from "./LeadIcon";

/** Design .radio-cards / .radio-card: 2 cols, 3 at md; native radios (arrow keys work), card is the label. */
export function RadioCardGroup({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: LeadOption[];
  value: string;
  onChange: (key: string) => void;
  error?: string | null;
}) {
  const errId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errId : undefined} className="grid gap-4">
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {options.map((o) => {
          const checked = value === o.key;
          return (
            <label
              key={o.key}
              data-testid="form-option"
              data-checked={checked || undefined}
              className={cn(
                "group relative flex min-h-[112px] cursor-pointer flex-col gap-4 rounded-lg border bg-surface p-6 transition-colors duration-fast ease-out",
                "hover:border-border-strong hover:bg-surface-2 has-[:focus-visible]:shadow-focus",
                checked ? "border-brand bg-primary-tint hover:bg-primary-tint" : "border-border",
                error && !value ? "border-error" : null,
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.key}
                checked={checked}
                onChange={() => onChange(o.key)}
                className="peer absolute opacity-0"
              />
              <span
                aria-hidden
                className={cn(
                  "absolute right-4 top-4 grid size-5 place-items-center rounded-full border",
                  checked
                    ? "border-primary bg-primary after:h-[5px] after:w-2 after:-translate-y-px after:translate-x-px after:-rotate-45 after:border-b-2 after:border-l-2 after:border-text after:content-['']"
                    : "border-border-strong",
                )}
              />
              {o.icon ? (
                <LeadIcon
                  name={o.icon}
                  size={32}
                  className={checked ? "text-brand" : "text-text-secondary"}
                />
              ) : null}
              <span className="mt-auto grid gap-1">
                <span className="text-body font-semibold text-text">{o.label}</span>
                {o.description ? (
                  <span className="text-caption text-text-tertiary">{o.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? <FieldMessage id={errId} message={error} /> : null}
    </fieldset>
  );
}

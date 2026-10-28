"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { TextField } from "@/components/sections/forms/fields";
import { cn } from "@/lib/utils/cn";

/** Big tap-target card shared by every pick step. aria-pressed marks the current answer when someone comes back. */
export const optionClass =
  "flex min-h-16 w-full items-center gap-4 rounded-md border border-border bg-surface-2 px-5 py-4 text-left font-sans text-body-lg font-bold text-text transition-[border-color,background-color,box-shadow] duration-fast ease-out hover:border-brand-border-hover focus-visible:shadow-focus aria-pressed:border-brand aria-pressed:bg-primary-tint";

export const continueClass = buttonClasses("primary", "lg", "w-full sm:w-auto");

/** Each step's title. RepairIntake moves focus here (data-step-heading) whenever the step changes. */
export function StepHeading({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="mb-8">
      <h2 data-step-heading tabIndex={-1} className="font-heading text-h4 font-black uppercase outline-none">
        {title}
      </h2>
      {intro ? <p className="mt-3 max-w-[56ch] text-body text-text-secondary">{intro}</p> : null}
    </div>
  );
}

/**
 * A pick-one list of cards. Choosing a listed option commits at once (the wrapper moves on); choosing the
 * `otherOption` card reveals a free-text box and a Continue button instead. With only the other option to offer
 * (e.g. "Other" device → brand), the box shows on its own.
 */
export function ChoiceList({
  id,
  options,
  value,
  otherOption,
  otherValue,
  otherLabel,
  otherPlaceholder,
  otherError,
  gridClassName = "grid-cols-2 md:grid-cols-3",
  onChoose,
}: {
  id: string;
  options: readonly string[];
  value: string | null;
  otherOption: string;
  otherValue: string;
  otherLabel: string;
  otherPlaceholder?: string;
  otherError: string;
  gridClassName?: string;
  onChoose: (option: string, otherText: string) => void;
}) {
  const onlyOther = options.length === 1 && options[0] === otherOption;
  const [showOther, setShowOther] = useState(onlyOther || value === otherOption);
  const [text, setText] = useState(otherValue);
  const [error, setError] = useState<string>();

  const submitOther = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return setError(otherError);
    onChoose(otherOption, trimmed);
  };

  return (
    <div className="grid gap-6">
      {onlyOther ? null : (
        <ul className={cn("grid gap-3", gridClassName)}>
          {options.map((option) => {
            const isOther = option === otherOption;
            const pressed = isOther ? showOther : !showOther && value === option;
            return (
              <li key={option}>
                <button
                  type="button"
                  aria-pressed={pressed}
                  className={cn(optionClass, "h-full")}
                  onClick={() => (isOther ? setShowOther(true) : onChoose(option, ""))}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {showOther ? (
        <form noValidate onSubmit={submitOther} className="grid gap-5">
          <TextField
            id={`${id}-other`}
            label={otherLabel}
            placeholder={otherPlaceholder}
            value={text}
            error={error}
            maxLength={120}
            autoComplete="off"
            autoFocus={!onlyOther}
            onChange={(e) => {
              setText(e.target.value);
              setError(undefined);
            }}
          />
          <div>
            <button type="submit" className={continueClass}>
              Continue
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

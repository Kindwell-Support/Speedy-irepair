import type { InputHTMLAttributes } from "react";
import type { LeadFlowCopy } from "@/lib/sanity/types";
import { FieldMessage } from "./FieldMessage";
import { LeadTextField } from "./LeadTextField";

export type ContactValues = { name: string; phone: string; email: string; details: string };

/** Contact step: Name + Phone (2 cols at md), Email, optional details, consent (design .form-grid--2 + .consent). */
export function ContactStep({
  idPrefix,
  values,
  onValue,
  errors,
  consent,
  onConsent,
  consentError,
  copy,
  disabled,
}: {
  idPrefix: string;
  values: ContactValues;
  onValue: (key: keyof ContactValues, v: string) => void;
  errors: Partial<Record<keyof ContactValues, string>>;
  consent: boolean;
  onConsent: (v: boolean) => void;
  consentError?: string | null;
  copy: LeadFlowCopy["contact"];
  disabled?: boolean;
}) {
  const field = (
    key: keyof ContactValues,
    label: string,
    attrs: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">,
  ) => (
    <LeadTextField
      id={`${idPrefix}-${key}`}
      label={label}
      value={values[key]}
      onValue={(v) => onValue(key, v)}
      error={errors[key]}
      disabled={disabled}
      {...attrs}
    />
  );
  const optional = /\(([^)]+)\)\s*$/.exec(copy.detailsLabel);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {field("name", copy.nameLabel, { autoComplete: "name", required: true })}
      {field("phone", copy.phoneLabel, {
        type: "tel",
        autoComplete: "tel",
        inputMode: "tel",
        required: true,
        className: "tabular-nums",
      })}
      {field("email", copy.emailLabel, {
        type: "email",
        autoComplete: "email",
        required: true,
        className: "md:col-span-2",
      })}
      <LeadTextField
        id={`${idPrefix}-details`}
        label={optional ? copy.detailsLabel.slice(0, optional.index).trim() : copy.detailsLabel}
        optionalLabel={optional ? `(${optional[1]})` : undefined}
        multiline
        value={values.details}
        onValue={(v) => onValue("details", v)}
        error={errors.details}
        className="md:col-span-2"
      />
      <div className="grid gap-2 md:col-span-2">
        <label className="flex items-start gap-2 text-caption text-text-tertiary">
          <input
            type="checkbox"
            name={`${idPrefix}-consent`}
            checked={consent}
            onChange={(e) => onConsent(e.target.checked)}
            aria-invalid={consentError ? true : undefined}
            aria-describedby={consentError ? `${idPrefix}-consent-msg` : undefined}
            className="mt-[2px] size-4 shrink-0 accent-brand"
          />
          {copy.consentLabel}
        </label>
        {consentError ? (
          <FieldMessage id={`${idPrefix}-consent-msg`} message={consentError} />
        ) : null}
      </div>
    </div>
  );
}

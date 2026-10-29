"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { z } from "zod";
import { Notice } from "@/components/ui/Notice";
import { TextField, fieldError } from "@/components/sections/forms/fields";
import { CONSENT_TEXT, detailsStepSchema, phoneStepSchema } from "@/lib/repair-schemas";
import { StepHeading, continueClass } from "./ui";

type FieldErrors = Record<string, string[] | undefined>;
type Values = Record<string, string>;

/** Validates with the step's schema on submit; field errors clear as the visitor edits that field. */
function useStepForm<T extends Values>(
  schema: z.ZodType<T>,
  value: T,
  onChange: (value: T) => void,
  onSubmit: (value: T) => void,
) {
  const [errors, setErrors] = useState<FieldErrors>();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(value);
    if (!parsed.success) return setErrors(parsed.error.flatten().fieldErrors);
    setErrors(undefined);
    onSubmit(parsed.data);
  };
  const set = (key: keyof T & string) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [key]: e.target.value });
    setErrors((prev) => (prev ? { ...prev, [key]: undefined } : prev));
  };
  return { errors, submit, set };
}

/** Step 2. Phone (required, with the SMS consent line) and optional email; Continue creates the lead in the CRM. */
export function PhoneStep({
  value,
  pending,
  error,
  serverFieldErrors,
  onChange,
  onSubmit,
}: {
  value: { phone: string; email: string };
  pending: boolean;
  error?: string;
  serverFieldErrors?: FieldErrors;
  onChange: (value: { phone: string; email: string }) => void;
  onSubmit: (value: { phone: string; email: string }) => void;
}) {
  const { errors, submit, set } = useStepForm(phoneStepSchema, value, onChange, onSubmit);
  const shown = errors ?? serverFieldErrors;

  return (
    <>
      <StepHeading
        title="How do we reach you?"
        intro="We'll text or call if anything changes before your appointment."
      />
      <form noValidate onSubmit={submit} aria-busy={pending} className="grid gap-5">
        <TextField
          id="repair-phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value.phone}
          onChange={set("phone")}
          error={fieldError(shown, "phone")}
          hint={CONSENT_TEXT}
          required
        />
        <TextField
          id="repair-email"
          label="Email (optional)"
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={set("email")}
          error={fieldError(shown, "email")}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div>
          <button type="submit" className={continueClass} disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </button>
        </div>
      </form>
    </>
  );
}

/** Step 7. Name, plus the email from step 2 to confirm or add; submitting books the time (or sends the request). */
export function DetailsStep({
  value,
  booking,
  pending,
  error,
  serverFieldErrors,
  onChange,
  onSubmit,
}: {
  value: { name: string; email: string };
  /** Whether a time was picked: changes only the button label. */
  booking: boolean;
  pending: boolean;
  error?: string;
  serverFieldErrors?: FieldErrors;
  onChange: (value: { name: string; email: string }) => void;
  onSubmit: (value: { name: string; email: string }) => void;
}) {
  const { errors, submit, set } = useStepForm(detailsStepSchema, value, onChange, onSubmit);
  const shown = errors ?? serverFieldErrors;

  return (
    <>
      <StepHeading
        title="Who's the repair for?"
        intro="So we know who to look for at the counter."
      />
      <form noValidate onSubmit={submit} aria-busy={pending} className="grid gap-5">
        <TextField
          id="repair-name"
          label="Name"
          autoComplete="name"
          value={value.name}
          onChange={set("name")}
          error={fieldError(shown, "name")}
          required
        />
        <TextField
          id="repair-email"
          label="Email (optional)"
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={set("email")}
          error={fieldError(shown, "email")}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div>
          <button type="submit" className={continueClass} disabled={pending}>
            {pending
              ? booking
                ? "Booking…"
                : "Sending…"
              : booking
                ? "Book this time"
                : "Send request"}
          </button>
        </div>
      </form>
    </>
  );
}

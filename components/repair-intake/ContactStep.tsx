"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { z } from "zod";
import { Notice } from "@/components/ui/Notice";
import { TextField, fieldError } from "@/components/sections/forms/fields";
import { contactStepSchema } from "@/lib/repair-schemas";
import { StepHeading, continueClass } from "./ui";

type FieldErrors = Record<string, string[] | undefined>;
type Values = Record<string, string>;
type Contact = { name: string; phone: string; email: string };

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

/**
 * Step 2 of the repair and quote widgets. Name, phone and email, all required;
 * on /repair, Continue creates the lead in the CRM.
 */
export function ContactStep({
  intro,
  value,
  pending,
  error,
  serverFieldErrors,
  onChange,
  onSubmit,
}: {
  intro: string;
  value: Contact;
  pending: boolean;
  error?: string;
  serverFieldErrors?: FieldErrors;
  onChange: (value: Contact) => void;
  onSubmit: (value: Contact) => void;
}) {
  const { errors, submit, set } = useStepForm(contactStepSchema, value, onChange, onSubmit);
  const shown = errors ?? serverFieldErrors;

  return (
    <>
      <StepHeading title="How do we reach you?" intro={intro} />
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
          id="repair-phone"
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value.phone}
          onChange={set("phone")}
          error={fieldError(shown, "phone")}
          required
        />
        <TextField
          id="repair-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={set("email")}
          error={fieldError(shown, "email")}
          required
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

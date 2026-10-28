"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Notice } from "@/components/ui/Notice";
import { TextField, fieldError } from "@/components/sections/forms/fields";
import { repairContactSchema, type RepairContact } from "@/lib/repair-schemas";
import { StepHeading, continueClass } from "./ui";

type FieldErrors = Record<string, string[] | undefined>;

/**
 * Step 5. Validated here with the same schema the server uses; on Continue the wrapper posts the lead and only
 * moves on once it has a leadId.
 */
export function ContactStep({
  value,
  pending,
  error,
  serverFieldErrors,
  onChange,
  onSubmit,
}: {
  value: RepairContact;
  pending: boolean;
  error?: string;
  serverFieldErrors?: FieldErrors;
  onChange: (contact: RepairContact) => void;
  onSubmit: (contact: RepairContact) => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>();
  const shown = errors ?? serverFieldErrors;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = repairContactSchema.safeParse(value);
    if (!parsed.success) return setErrors(parsed.error.flatten().fieldErrors);
    setErrors(undefined);
    onSubmit(parsed.data);
  };
  const set = (key: keyof RepairContact) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [key]: e.target.value });
    setErrors((prev) => (prev ? { ...prev, [key]: undefined } : prev));
  };

  return (
    <>
      <StepHeading title="How do we reach you?" intro="We'll text or call if anything changes before your appointment." />
      <form noValidate onSubmit={submit} aria-busy={pending} className="grid gap-5">
        <TextField id="repair-name" label="Name" autoComplete="name" value={value.name} onChange={set("name")} error={fieldError(shown, "name")} required />
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
        <TextField id="repair-email" label="Email" type="email" autoComplete="email" value={value.email} onChange={set("email")} error={fieldError(shown, "email")} required />
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

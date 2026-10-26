"use client";

import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { FormShell } from "./FormShell";
import { fieldError, TextField } from "./fields";

/** F2 Newsletter (REQ-037). Copy comes from homePage.newsletter. */
export function NewsletterForm({
  emailLabel,
  buttonLabel,
  successMessage,
}: {
  emailLabel: string;
  buttonLabel: string;
  successMessage: string;
}) {
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("newsletter");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <FormShell
      label="Newsletter signup"
      state={state}
      honeypotProps={honeypotProps}
      onFocusCapture={markStarted}
      submitLabel={buttonLabel}
      successMessage={successMessage}
      onSubmit={(d) => submit({ email: String(d.get("newsletter-email") ?? "") })}
    >
      <TextField id="newsletter-email" label={emailLabel} type="email" autoComplete="email" required error={fieldError(errors, "email")} />
    </FormShell>
  );
}

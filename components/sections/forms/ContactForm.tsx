"use client";

import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { FormShell } from "./FormShell";
import { fieldError, TextAreaField, TextField } from "./fields";

/** F4 Contact form (REQ-100): name, email, phone, message → /api/forms/contact. */
export function ContactForm({ idPrefix = "contact" }: { idPrefix?: string }) {
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("contact");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const f = (k: string) => `${idPrefix}-${k}`;
  return (
    <FormShell
      label="Contact us"
      state={state}
      honeypotProps={honeypotProps}
      onFocusCapture={markStarted}
      submitLabel="Send message"
      successMessage="Thanks! We'll get back to you soon."
      onSubmit={(d) =>
        submit({
          name: String(d.get(f("name")) ?? ""),
          email: String(d.get(f("email")) ?? ""),
          phone: String(d.get(f("phone")) ?? ""),
          message: String(d.get(f("message")) ?? ""),
        })
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField id={f("name")} label="Name" autoComplete="name" required error={fieldError(errors, "name")} />
        <TextField id={f("email")} label="Email" type="email" autoComplete="email" required error={fieldError(errors, "email")} />
      </div>
      <TextField id={f("phone")} label="Phone (optional)" type="tel" autoComplete="tel" error={fieldError(errors, "phone")} />
      <TextAreaField id={f("message")} label="Message" required error={fieldError(errors, "message")} />
    </FormShell>
  );
}

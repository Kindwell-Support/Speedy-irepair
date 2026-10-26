"use client";

import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import type { QuoteInput } from "@/lib/forms/schemas";
import { FormShell } from "./FormShell";
import { fieldError, SelectField, TextAreaField, TextField } from "./fields";

/**
 * F1 Instant Quote (Decision #5): device → model → issue → contact. Lead capture only, NO prices.
 * Single-step baseline; Frontend/Motion may wrap the same fields in <MultiStepForm> (StepTransition).
 */
export function QuoteForm({
  deviceTypes,
  issues,
  successMessage,
}: {
  deviceTypes: string[];
  issues: string[];
  successMessage: string;
}) {
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("quote");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <FormShell
      testId="quote-form"
      label="Instant quote request"
      state={state}
      honeypotProps={honeypotProps}
      onFocusCapture={markStarted}
      submitLabel="Request my quote"
      successMessage={successMessage}
      onSubmit={(d) =>
        submit({
          deviceType: String(d.get("q-device") ?? "") as QuoteInput["deviceType"],
          model: String(d.get("q-model") ?? ""),
          issue: String(d.get("q-issue") ?? "") as QuoteInput["issue"],
          details: String(d.get("q-details") ?? ""),
          name: String(d.get("q-name") ?? ""),
          phone: String(d.get("q-phone") ?? ""),
          email: String(d.get("q-email") ?? ""),
        })
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          id="q-device"
          label="Device type"
          options={deviceTypes}
          required
          error={fieldError(errors, "deviceType")}
        />
        <TextField
          id="q-model"
          label="Model"
          placeholder="e.g. iPhone 13"
          required
          error={fieldError(errors, "model")}
        />
      </div>
      <SelectField
        id="q-issue"
        label="What's wrong?"
        options={issues}
        required
        error={fieldError(errors, "issue")}
      />
      <TextAreaField
        id="q-details"
        label="Anything else? (optional)"
        error={fieldError(errors, "details")}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <TextField
          id="q-name"
          label="Name"
          autoComplete="name"
          required
          error={fieldError(errors, "name")}
        />
        <TextField
          id="q-phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          error={fieldError(errors, "phone")}
        />
        <TextField
          id="q-email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={fieldError(errors, "email")}
        />
      </div>
    </FormShell>
  );
}

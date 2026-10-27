"use client";

import type { FormEvent, ReactNode } from "react";
import { Notice } from "@/components/ui/Notice";
import { buttonClasses } from "@/components/ui/ButtonLink";
import type { SubmitState } from "@/lib/forms/useFormSubmit";
import { Honeypot } from "./fields";

/** Shared <form> chrome: honeypot, submit button, status/staging notices. */
export function FormShell({
  label,
  state,
  onSubmit,
  onFocusCapture,
  honeypotProps,
  submitLabel,
  successMessage,
  children,
  className,
  inline = false,
  testId,
}: {
  label: string;
  state: SubmitState;
  onSubmit: (data: FormData) => void;
  onFocusCapture: () => void;
  honeypotProps: Record<string, unknown>;
  submitLabel: string;
  successMessage: string;
  children: ReactNode;
  className?: string;
  /** Single-field forms (newsletter): field and submit share one row from sm up (design .input-group). */
  inline?: boolean;
  /** QA hook: data-testid on the <form> (e.g. contact-form). */
  testId?: string;
}) {
  const handle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };
  if (state.status === "success")
    return (
      <div className="space-y-3" data-testid="form-success">
        <Notice tone="success">{successMessage}</Notice>
        {state.staging ? (
          <Notice tone="staging">
            Staging preview: this submission was validated but not stored or sent (form delivery is
            not configured yet).
          </Notice>
        ) : null}
      </div>
    );
  const submit = (
    <button
      type="submit"
      className={buttonClasses("primary", "lg", inline ? "w-full sm:w-auto" : undefined)}
      disabled={state.status === "submitting"}
    >
      {state.status === "submitting" ? "Sending…" : submitLabel}
    </button>
  );
  return (
    <form
      data-testid={testId}
      aria-label={label}
      noValidate
      onSubmit={handle}
      onFocusCapture={onFocusCapture}
      className={className}
    >
      <div className="relative grid gap-5">
        <Honeypot {...honeypotProps} />
        {inline ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            {children}
            {submit}
          </div>
        ) : (
          children
        )}
        {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
        {inline ? null : <div>{submit}</div>}
      </div>
    </form>
  );
}

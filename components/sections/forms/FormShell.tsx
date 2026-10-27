"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { Notice } from "@/components/ui/Notice";
import { buttonClasses } from "@/components/ui/ButtonLink";
import type { SubmitState } from "@/lib/forms/useFormSubmit";
import { Honeypot } from "./fields";

/**
 * Shared <form> chrome: honeypot, submit button, status/staging notices.
 * On success the form is replaced by a confirmation panel that takes focus, so keyboard and screen-reader
 * users land on the result instead of on a node that no longer exists.
 */
export function FormShell({
  label,
  state,
  onSubmit,
  onFocusCapture,
  honeypotProps,
  submitLabel,
  successTitle = "Sent",
  successMessage,
  children,
  className,
}: {
  label: string;
  state: SubmitState;
  onSubmit: (data: FormData) => void;
  onFocusCapture: () => void;
  honeypotProps: Record<string, unknown>;
  submitLabel: string;
  successTitle?: string;
  successMessage: string;
  children: ReactNode;
  className?: string;
}) {
  const successRef = useRef<HTMLDivElement>(null);
  const succeeded = state.status === "success";
  useEffect(() => {
    if (succeeded) successRef.current?.focus();
  }, [succeeded]);

  const handle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };
  if (state.status === "success")
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 outline-none">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success" aria-hidden>
          <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        </span>
        <p className="font-heading text-h4 font-bold">{successTitle}</p>
        <p className="max-w-[52ch] text-body-lg text-text-secondary">{successMessage}</p>
        {state.staging ? (
          <Notice tone="staging">
            Staging preview: this submission was validated but not stored or sent (form delivery is not configured yet).
          </Notice>
        ) : null}
      </div>
    );
  return (
    <form aria-label={label} noValidate onSubmit={handle} onFocusCapture={onFocusCapture} className={className}>
      <div className="relative grid gap-5">
        <Honeypot {...honeypotProps} />
        {children}
        {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
        <div>
          <button type="submit" className={buttonClasses("primary", "lg")} disabled={state.status === "submitting"}>
            {state.status === "submitting" ? "Sending…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

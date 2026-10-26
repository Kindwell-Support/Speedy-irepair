"use client";

import { useCallback, useRef, useState } from "react";
import type { FormPayloads, FormResponse, FormTypeKey } from "./schemas";
import { formSchemas } from "./schemas";

export type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; staging: boolean }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * Client hook shared by all custom forms. Validates with the shared zod schema, adds spam fields
 * (honeypot value + startedAt), POSTs to /api/forms/[type]. No data fetching on mount.
 *
 *   const { state, submit, markStarted, honeypotProps } = useFormSubmit("contact");
 */
export function useFormSubmit<T extends FormTypeKey>(type: T) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const startedAt = useRef<number | null>(null);
  const honeypot = useRef<HTMLInputElement | null>(null);

  const markStarted = useCallback(() => {
    if (startedAt.current === null) startedAt.current = Date.now();
  }, []);

  const submit = useCallback(
    async (values: FormPayloads[T], extra?: { turnstileToken?: string }) => {
      const parsed = formSchemas[type].safeParse(values);
      if (!parsed.success) {
        setState({
          status: "error",
          message: "Please fix the highlighted fields.",
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>,
        });
        return;
      }
      setState({ status: "submitting" });
      try {
        const res = await fetch(`/api/forms/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            company_website: honeypot.current?.value ?? "",
            startedAt: startedAt.current ?? Date.now(),
            turnstileToken: extra?.turnstileToken,
            pagePath: window.location.pathname,
          }),
        });
        const data = (await res.json()) as FormResponse;
        if (data.ok) setState({ status: "success", staging: data.staging });
        else if (data.error === "validation")
          setState({ status: "error", message: "Please fix the highlighted fields.", fieldErrors: data.fieldErrors });
        else setState({ status: "error", message: data.message });
      } catch {
        setState({ status: "error", message: "Something went wrong. Please try again or call the store." });
      }
    },
    [type],
  );

  /** Spread onto a visually-hidden <input> (the honeypot). */
  const honeypotProps = {
    ref: honeypot,
    name: "company_website",
    type: "text",
    tabIndex: -1,
    autoComplete: "off",
    "aria-hidden": true,
    defaultValue: "",
  } as const;

  return { state, submit, markStarted, honeypotProps };
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { readAttribution } from "@/lib/attribution";
import {
  HOME_TYPES,
  INTERNET_CONSENT_TEXT,
  INTERNET_SITUATIONS,
  INTERNET_TIMING,
  internetSchema,
} from "@/lib/forms/schemas";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { telHref } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { StepHeading, StepProgress, continueClass, optionClass } from "@/components/repair-intake/ui";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { FormShell } from "@/components/sections/forms/FormShell";
import { fieldError, TextField } from "@/components/sections/forms/fields";

const STEPS = ["Address", "Your home", "Contact"] as const;
const [ADDRESS, HOME, CONTACT] = [0, 1, 2];

type FieldErrors = Record<string, string[] | undefined>;

interface Answers {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  homeType: string | null;
  situation: string | null;
  timing: string | null;
  currentProvider: string;
  name: string;
  phone: string;
  email: string;
}

const EMPTY: Answers = {
  street: "",
  unit: "",
  city: "Akron",
  state: "OH",
  zip: "",
  homeType: null,
  situation: null,
  timing: null,
  currentProvider: "",
  name: "",
  phone: "",
  email: "",
};

const addressSchema = internetSchema.pick({ street: true, unit: true, city: true, state: true, zip: true });
const homeSchema = internetSchema.pick({ homeType: true, situation: true, timing: true, currentProvider: true });

/** One pick-one row of tiles. Unlike ChoiceList it doesn't move on, because the step asks three questions. */
function TileGroup({
  legend,
  options,
  value,
  error,
  onChoose,
}: {
  legend: string;
  options: readonly string[];
  value: string | null;
  error?: string;
  onChoose: (option: string) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-body-sm font-medium text-text-primary">{legend}</legend>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              aria-pressed={value === option}
              className={cn(optionClass, "h-full min-h-14 justify-center px-3 py-3 text-center text-body")}
              onClick={() => onChoose(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p className="text-caption text-error">{error}</p> : null}
    </fieldset>
  );
}

/**
 * /home-internet: address → home → contact, then a confirmation. One request at the end (/api/forms/internet);
 * staff check availability and call back. With a Spectrum order link in the CMS the confirmation offers it too.
 */
export function InternetIntake({
  confirmationMessage,
  spectrumOrderUrl,
  shop,
}: {
  confirmationMessage: string;
  spectrumOrderUrl?: string | null;
  shop: { address: string; phone: string };
}) {
  const [step, setStep] = useState(ADDRESS);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>();
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("internet");
  const rootRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLHeadingElement>(null);
  const movedRef = useRef(false);
  const sent = state.status === "success";

  useEffect(() => {
    if (!movedRef.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (sent) confirmRef.current?.focus();
  }, [sent]);

  const goTo = (next: number) => {
    movedRef.current = true;
    setErrors(undefined);
    setStep(next);
  };

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    markStarted();
    setAnswers((a) => ({ ...a, [key]: value }));
    setErrors((prev) => (prev ? { ...prev, [key]: undefined } : prev));
  };

  const next = (schema: typeof addressSchema | typeof homeSchema, to: number) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(answers);
    if (!parsed.success) return setErrors(parsed.error.flatten().fieldErrors);
    goTo(to);
  };

  const line = [answers.street.trim(), answers.unit.trim()].filter(Boolean).join(", ");
  const shown = errors ?? (state.status === "error" ? state.fieldErrors : undefined);
  const status = sent ? "Address check sent" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;

  if (sent)
    return (
      <div ref={rootRef} className="scroll-mt-24" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success" aria-hidden>
          <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        </span>
        <h2 ref={confirmRef} tabIndex={-1} className="mt-5 font-heading text-h4 font-black uppercase outline-none">
          We&rsquo;re checking your address
        </h2>
        <p className="mt-2 font-bold text-text">
          {line}, {answers.city.trim()}, {answers.state.trim().toUpperCase()} {answers.zip.trim()}
        </p>
        <p className="mt-3 max-w-[52ch] text-body-lg text-text-secondary">{confirmationMessage}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {spectrumOrderUrl ? (
            <a href={spectrumOrderUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
              Finish on Spectrum<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
          <a href={telHref(shop.phone)} className={buttonClasses(spectrumOrderUrl ? "secondary" : "primary", "lg")}>
            Call {shop.phone}
          </a>
        </div>

        <div className="mt-8 rounded-md border border-border bg-surface-2 p-5">
          <p className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">The store</p>
          <address className="mt-1 not-italic text-body text-text-secondary">{shop.address}</address>
        </div>

        <p className="mt-6 text-body text-text-secondary">
          Phone cracked while you&rsquo;re moving in?{" "}
          <Link href="/repair" className="font-bold text-primary-text underline underline-offset-4">
            Fix my device
          </Link>
        </p>
      </div>
    );

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      <StepProgress steps={STEPS} step={step} status={status} label="Address check progress" onBack={() => goTo(step - 1)} />

      {step === ADDRESS ? (
        <>
          <StepHeading title="Where do you need internet?" intro="We'll check what's available at your address." />
          <form noValidate onSubmit={next(addressSchema, HOME)} onFocusCapture={markStarted} className="grid gap-5">
            <TextField
              id="net-street"
              label="Street address"
              autoComplete="address-line1"
              value={answers.street}
              onChange={(e) => set("street", e.target.value)}
              error={fieldError(shown, "street")}
              required
            />
            <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
              <TextField
                id="net-unit"
                label="Apt / unit (optional)"
                autoComplete="address-line2"
                value={answers.unit}
                onChange={(e) => set("unit", e.target.value)}
                error={fieldError(shown, "unit")}
              />
              <TextField
                id="net-zip"
                label="ZIP code"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                value={answers.zip}
                onChange={(e) => set("zip", e.target.value)}
                error={fieldError(shown, "zip")}
                required
              />
            </div>
            <div className="grid grid-cols-[1fr_6rem] gap-5">
              <TextField
                id="net-city"
                label="City"
                autoComplete="address-level2"
                value={answers.city}
                onChange={(e) => set("city", e.target.value)}
                error={fieldError(shown, "city")}
                required
              />
              <TextField
                id="net-state"
                label="State"
                autoComplete="address-level1"
                maxLength={2}
                value={answers.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
                error={fieldError(shown, "state")}
                required
              />
            </div>
            <div>
              <button type="submit" className={continueClass}>
                Continue
              </button>
            </div>
          </form>
        </>
      ) : null}

      {step === HOME ? (
        <>
          <StepHeading title="Tell us about your home" intro={`${line}, ${answers.city.trim()}`} />
          <form noValidate onSubmit={next(homeSchema, CONTACT)} className="grid gap-8">
            <TileGroup legend="Type of home" options={HOME_TYPES} value={answers.homeType} error={fieldError(shown, "homeType")} onChoose={(v) => set("homeType", v)} />
            <TileGroup legend="What do you need?" options={INTERNET_SITUATIONS} value={answers.situation} error={fieldError(shown, "situation")} onChoose={(v) => set("situation", v)} />
            <TileGroup legend="When do you need it?" options={INTERNET_TIMING} value={answers.timing} error={fieldError(shown, "timing")} onChoose={(v) => set("timing", v)} />
            <TextField
              id="net-provider"
              label="Current provider (optional)"
              autoComplete="off"
              value={answers.currentProvider}
              onChange={(e) => set("currentProvider", e.target.value)}
              error={fieldError(shown, "currentProvider")}
            />
            <div>
              <button type="submit" className={continueClass}>
                Continue
              </button>
            </div>
          </form>
        </>
      ) : null}

      {step === CONTACT ? (
        <>
          <StepHeading title="Who should we call?" intro="A local specialist will call or text you to confirm availability." />
          <FormShell
            label="Home internet address check"
            state={state}
            honeypotProps={honeypotProps}
            onFocusCapture={markStarted}
            submitLabel="Check my address"
            successMessage={confirmationMessage}
            onSubmit={() =>
              submit({
                street: answers.street,
                unit: answers.unit || undefined,
                city: answers.city,
                state: answers.state,
                zip: answers.zip,
                homeType: answers.homeType as (typeof HOME_TYPES)[number],
                situation: answers.situation as (typeof INTERNET_SITUATIONS)[number],
                timing: answers.timing as (typeof INTERNET_TIMING)[number],
                currentProvider: answers.currentProvider || undefined,
                name: answers.name,
                phone: answers.phone,
                email: answers.email,
                attribution: readAttribution(),
              })
            }
          >
            <TextField id="net-name" label="Name" autoComplete="name" value={answers.name} onChange={(e) => set("name", e.target.value)} error={fieldError(shown, "name")} required />
            <TextField
              id="net-phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={answers.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={fieldError(shown, "phone")}
              hint={INTERNET_CONSENT_TEXT}
              required
            />
            <TextField id="net-email" label="Email" type="email" autoComplete="email" value={answers.email} onChange={(e) => set("email", e.target.value)} error={fieldError(shown, "email")} required />
          </FormShell>
        </>
      ) : null}
    </div>
  );
}

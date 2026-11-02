"use client";

import { useEffect, useRef, useState } from "react";
import { readAttribution } from "@/lib/attribution";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { ISSUE_OTHER, OTHER, type Device } from "@/lib/repair-catalog";
import { CONSENT_TEXT } from "@/lib/repair-schemas";
import { BrandStep } from "@/components/repair-intake/BrandStep";
import { DeviceStep } from "@/components/repair-intake/DeviceStep";
import { IssueStep } from "@/components/repair-intake/IssueStep";
import { ModelStep } from "@/components/repair-intake/ModelStep";
import { StepHeading, StepProgress } from "@/components/repair-intake/ui";
import { FormShell } from "@/components/sections/forms/FormShell";
import { fieldError, TextAreaField, TextField } from "@/components/sections/forms/fields";

const STEPS = ["Device", "Brand", "Model", "Issue", "Your details"] as const;
const [DEVICE, BRAND, MODEL, ISSUE, DETAILS] = [0, 1, 2, 3, 4];

interface Answers {
  device: Device | null;
  brand: string | null;
  brandOther: string;
  model: string | null;
  modelOther: string;
  issue: string | null;
  issueOther: string;
}

const EMPTY: Answers = { device: null, brand: null, brandOther: "", model: null, modelOther: "", issue: null, issueOther: "" };

/** What each step owns. Changing a step's answer clears every later step's. */
const OWNED: (keyof Answers)[][] = [["device"], ["brand", "brandOther"], ["model", "modelOther"], ["issue", "issueOther"], []];

const resolved = (choice: string | null, other: string) => (choice === OTHER ? other : (choice ?? ""));

/**
 * /instant-quote: device → brand → model → issue → contact, one tap per step with the /repair widget's steps.
 * The last step posts to /api/forms/quote, which sends the lead to the GHL repair pipeline.
 */
export function QuoteIntake({ successMessage }: { successMessage: string }) {
  const [step, setStep] = useState(DEVICE);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("quote");
  const rootRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  // Keyboard and screen-reader users land on the new step's heading, not on a button that no longer exists.
  useEffect(() => {
    if (!movedRef.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  const goTo = (next: number) => {
    movedRef.current = true;
    setStep(next);
  };

  /** Records a step's answer (clearing later steps if it changed) and moves to the next step. */
  const answer = (at: number, patch: Partial<Answers>) => {
    markStarted();
    const changed = (Object.keys(patch) as (keyof Answers)[]).some((k) => patch[k] !== answers[k]);
    const later = OWNED.slice(at + 1).flat();
    setAnswers(changed ? { ...answers, ...patch, ...Object.fromEntries(later.map((k) => [k, EMPTY[k]])) } : answers);
    goTo(at + 1);
  };

  const brand = resolved(answers.brand, answers.brandOther);
  const model = resolved(answers.model, answers.modelOther);
  const problem = answers.issue === ISSUE_OTHER ? answers.issueOther : (answers.issue ?? "");
  const sent = state.status === "success";
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const status = sent ? "Quote request sent" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      {sent ? null : (
        <StepProgress steps={STEPS} step={step} status={status} label="Quote progress" onBack={() => goTo(step - 1)} />
      )}

      {step === DEVICE ? (
        <DeviceStep
          value={answers.device}
          intro="Pick your device and we'll get back to you with a free quote."
          onChoose={(device) => answer(DEVICE, { device })}
        />
      ) : null}

      {step === BRAND && answers.device ? (
        <BrandStep
          key={answers.device}
          device={answers.device}
          value={answers.brand}
          otherValue={answers.brandOther}
          onChoose={(choice, brandOther) => answer(BRAND, { brand: choice, brandOther })}
        />
      ) : null}

      {step === MODEL && answers.device && answers.brand ? (
        <ModelStep
          device={answers.device}
          brand={answers.brand}
          brandLabel={brand}
          value={answers.model}
          otherValue={answers.modelOther}
          onChoose={(choice, modelOther) => answer(MODEL, { model: choice, modelOther })}
        />
      ) : null}

      {step === ISSUE && answers.device ? (
        <IssueStep
          device={answers.device}
          value={answers.issue}
          details={answers.issueOther}
          onChoose={(issue, issueOther) => answer(ISSUE, { issue, issueOther })}
        />
      ) : null}

      {step === DETAILS && answers.device && answers.issue ? (
        <>
          {sent ? null : (
            <StepHeading
              title="Where should we send your quote?"
              intro={`${brand} ${model}: ${problem.toLowerCase()}. Leave your details and we'll be in touch.`}
            />
          )}
          <FormShell
            label="Instant quote request"
            state={state}
            honeypotProps={honeypotProps}
            onFocusCapture={markStarted}
            submitLabel="Request my quote"
            successTitle="Quote request sent"
            successMessage={successMessage}
            onSubmit={(d) =>
              submit({
                deviceType: answers.device!,
                brand,
                model,
                issue: answers.issue!,
                details: [answers.issueOther, String(d.get("q-details") ?? "")].filter((text) => text.trim()).join("\n\n"),
                name: String(d.get("q-name") ?? ""),
                phone: String(d.get("q-phone") ?? ""),
                email: String(d.get("q-email") ?? ""),
                attribution: readAttribution(),
              })
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField id="q-name" label="Name" autoComplete="name" required error={fieldError(errors, "name")} />
              <TextField id="q-phone" label="Phone" type="tel" autoComplete="tel" required hint={CONSENT_TEXT} error={fieldError(errors, "phone")} />
            </div>
            <TextField id="q-email" label="Email (optional)" type="email" autoComplete="email" error={fieldError(errors, "email")} />
            <TextAreaField id="q-details" label="Anything else? (optional)" error={fieldError(errors, "details")} />
          </FormShell>
        </>
      ) : null}
    </div>
  );
}

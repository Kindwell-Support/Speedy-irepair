"use client";

import { useEffect, useRef, useState } from "react";
import { readAttribution } from "@/lib/attribution";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { OTHER } from "@/lib/repair-catalog";
import {
  CONDITIONS,
  TRADE_IN_DEVICES,
  tradeInBrandsFor,
  tradeInModelsFor,
  type Condition,
  type TradeInDevice,
} from "@/lib/trade-in-catalog";
import { cn } from "@/lib/utils/cn";
import { DeviceTiles } from "@/components/repair-intake/DeviceTiles";
import { ChoiceList, StepHeading, StepProgress, optionClass } from "@/components/repair-intake/ui";
import { FormShell } from "@/components/sections/forms/FormShell";
import { fieldError, TextAreaField, TextField } from "@/components/sections/forms/fields";

const STEPS = ["Device", "Brand", "Model", "Condition", "Your details"] as const;
const [DEVICE, BRAND, MODEL, CONDITION, DETAILS] = [0, 1, 2, 3, 4];

interface Answers {
  device: TradeInDevice | null;
  brand: string | null;
  brandOther: string;
  model: string | null;
  modelOther: string;
  condition: Condition | null;
}

const EMPTY: Answers = { device: null, brand: null, brandOther: "", model: null, modelOther: "", condition: null };

/** What each step owns. Changing a step's answer clears every later step's. */
const OWNED: (keyof Answers)[][] = [["device"], ["brand", "brandOther"], ["model", "modelOther"], ["condition"], []];

const resolved = (choice: string | null, other: string) => (choice === OTHER ? other : (choice ?? ""));

/**
 * /sell-your-device: device → brand → model → condition → contact, one tap per step like the /repair widget.
 * The last step posts to /api/forms/tradein, which sends the lead to the GHL Device Buyback pipeline.
 */
export function TradeInIntake() {
  const [step, setStep] = useState(DEVICE);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("tradein");
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
  const sent = state.status === "success";
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const status = sent ? "Request sent" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      {sent ? null : (
        <StepProgress steps={STEPS} step={step} status={status} label="Trade-in progress" onBack={() => goTo(step - 1)} />
      )}

      {step === DEVICE ? (
        <>
          <StepHeading title="What are you selling?" intro="Pick your device. We'll compare trade-in prices and get back to you with an offer." />
          <DeviceTiles devices={TRADE_IN_DEVICES} value={answers.device} onChoose={(device) => answer(DEVICE, { device })} />
        </>
      ) : null}

      {step === BRAND && answers.device ? (
        <>
          <StepHeading title="Which brand?" intro={answers.device === "Other" ? "Tell us who makes it." : undefined} />
          <ChoiceList
            key={answers.device}
            id="tradein-brand"
            options={tradeInBrandsFor(answers.device)}
            value={answers.brand}
            otherOption={OTHER}
            otherValue={answers.brandOther}
            otherLabel="Brand"
            otherPlaceholder="e.g. OnePlus"
            otherError="Tell us the brand"
            onChoose={(choice, brandOther) => answer(BRAND, { brand: choice, brandOther })}
          />
        </>
      ) : null}

      {step === MODEL && answers.device && answers.brand ? (
        <>
          <StepHeading title="Which model?" intro="Not sure? Pick “Other / not listed” and describe it." />
          <ChoiceList
            id="tradein-model"
            options={tradeInModelsFor(answers.device, answers.brand)}
            value={answers.model}
            otherOption={OTHER}
            otherValue={answers.modelOther}
            otherLabel="Model"
            otherPlaceholder="e.g. the name on the box or in Settings"
            otherError="Tell us the model"
            gridClassName="sm:grid-cols-2 md:grid-cols-3"
            onChoose={(choice, modelOther) => answer(MODEL, { model: choice, modelOther })}
          />
        </>
      ) : null}

      {step === CONDITION ? (
        <>
          <StepHeading title="What condition is it in?" intro="Be honest: the offer we send is based on this." />
          <ul className="grid gap-3 sm:grid-cols-2">
            {CONDITIONS.map(({ value, hint }) => (
              <li key={value}>
                <button
                  type="button"
                  aria-pressed={answers.condition === value}
                  className={cn(optionClass, "h-full flex-col items-start gap-1")}
                  onClick={() => answer(CONDITION, { condition: value })}
                >
                  {value}
                  <span className="text-body-sm font-normal text-text-secondary">{hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {step === DETAILS && answers.device && answers.condition ? (
        <>
          {sent ? null : (
            <StepHeading
              title="Where should we send your offer?"
              intro={`${brand} ${model}, ${answers.condition.toLowerCase()}. Leave your details and we'll be in touch.`}
            />
          )}
          <FormShell
            label="Sell or trade in your device"
            state={state}
            honeypotProps={honeypotProps}
            onFocusCapture={markStarted}
            submitLabel="Get my offer"
            successTitle="Request sent"
            successMessage="Thanks! We'll compare trade-in prices and get back to you."
            onSubmit={(d) =>
              submit({
                deviceType: answers.device!,
                brand,
                model,
                condition: answers.condition!,
                details: String(d.get("t-details") ?? ""),
                name: String(d.get("t-name") ?? ""),
                phone: String(d.get("t-phone") ?? ""),
                email: String(d.get("t-email") ?? ""),
                attribution: readAttribution(),
              })
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField id="t-name" label="Name" autoComplete="name" required error={fieldError(errors, "name")} />
              <TextField id="t-phone" label="Phone" type="tel" autoComplete="tel" required error={fieldError(errors, "phone")} />
            </div>
            <TextField id="t-email" label="Email" type="email" autoComplete="email" required error={fieldError(errors, "email")} />
            <TextAreaField id="t-details" label="Anything else? (optional)" placeholder="e.g. storage size, carrier, accessories included" error={fieldError(errors, "details")} />
          </FormShell>
        </>
      ) : null}
    </div>
  );
}

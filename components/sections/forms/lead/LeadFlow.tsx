"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { MultiStepForm, useMultiStep } from "@/components/motion/MultiStepForm";
import { buttonClasses } from "@/components/ui/ButtonLink";
import type { QuoteInput, TradeInInput } from "@/lib/forms/schemas";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import type { LeadFlowCopy, LeadOption } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";
import { Honeypot } from "../fields";
import { ContactStep, type ContactValues } from "./ContactStep";
import { FlowStepper } from "./FlowStepper";
import { LeadFlowAlert } from "./LeadFlowAlert";
import { LeadFlowSuccess } from "./LeadFlowSuccess";
import { LeadIcon } from "./LeadIcon";
import { ModelStep } from "./ModelStep";
import { RadioCardGroup } from "./RadioCardGroup";
import { SelectionSummary } from "./SelectionSummary";
import { StepMeta } from "./StepMeta";

type Kind = "quote" | "tradein";
type Answers = Record<"device" | "brand" | "model" | "issue" | "condition", string>;

const CONTACT_KEYS = ["name", "phone", "email", "details"] as const;
const shell = "rounded-xl border border-border-subtle bg-surface px-6 py-8 md:p-12";

/**
 * LeadFlow (design HANDOFF pattern): multi-step lead capture for /instant-quote (quote) and
 * /sell-your-device (tradein). Lead capture only: NO prices. Steps animate via components/motion
 * MultiStepForm; validation + submission use the shared zod schema through useFormSubmit.
 * States: step, validation error (per step + per field), submitting, success, submit error.
 */
export function LeadFlow({
  kind,
  copy,
  brandOptions = [],
  phoneDisplay,
  testId,
}: {
  kind: Kind;
  copy: LeadFlowCopy;
  /** Trade-in brand step options (from `brand` docs, acceptsTradeIn). */
  brandOptions?: LeadOption[];
  phoneDisplay: string;
  testId: string;
}) {
  const steps = copy.steps;
  const flow = useMultiStep(steps.length, 0);
  const { state, submit, markStarted, honeypotProps } = useFormSubmit(kind);
  const [answers, setAnswers] = useState<Answers>({
    device: "",
    brand: "",
    model: "",
    issue: "",
    condition: "",
  });
  const [contact, setContact] = useState<ContactValues>({
    name: "",
    phone: "",
    email: "",
    details: "",
  });
  const [consent, setConsent] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);

  const step = steps[flow.index] ?? steps[0]!;
  const idPrefix = kind === "quote" ? "q" : "t";
  const submitting = state.status === "submitting";
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const submitFailed = state.status === "error" && !state.fieldErrors;

  const optionsFor = (id: string): LeadOption[] =>
    id === "brand" ? brandOptions : (copy.options[id] ?? []);
  const labelFor = (id: string, key: string) =>
    optionsFor(id).find((o) => o.key === key)?.label ?? key;
  const models = copy.models[kind === "tradein" ? answers.brand : answers.device] ?? [];

  const validate = (id: string): string | null => {
    if (id === "contact") return null;
    // zod is lazy-loaded (useFormSubmit); per-step checks are presence checks, full schema runs on submit.
    if (id === "model") return answers.model.trim() ? null : copy.model.error;
    return answers[id as keyof Answers] ? null : copy.chooseError;
  };

  const goNext = () => {
    const err = validate(step.id);
    setStepError(err);
    if (!err) flow.next();
  };
  const goBack = () => {
    setStepError(null);
    flow.back();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!flow.isLast) return goNext();
    if (!consent) {
      setConsentError(copy.contact.consentError);
      return;
    }
    setConsentError(null);
    const base = { model: answers.model, ...contact };
    if (kind === "quote")
      await submit({
        ...base,
        deviceType: answers.device as QuoteInput["deviceType"],
        issue: answers.issue as QuoteInput["issue"],
      });
    else
      await submit({
        ...base,
        deviceType: answers.device as TradeInInput["deviceType"],
        brand: answers.brand as TradeInInput["brand"],
        condition: answers.condition as TradeInInput["condition"],
      });
  };

  if (state.status === "success")
    return (
      <div className={shell}>
        <LeadFlowSuccess
          copy={copy.success}
          staging={state.staging}
          stagingNote={copy.stagingNote}
        />
      </div>
    );

  const set = (id: keyof Answers) => (v: string) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    setStepError(null);
  };

  const body = (id: string): ReactNode => {
    if (id === "contact") {
      const errors: Partial<Record<keyof ContactValues, string>> = {};
      for (const k of CONTACT_KEYS) {
        const msg = fieldErrors?.[k]?.[0];
        if (msg) errors[k] = msg;
      }
      return (
        <ContactStep
          idPrefix={idPrefix}
          values={contact}
          onValue={(k, v) => setContact((c) => ({ ...c, [k]: v }))}
          errors={errors}
          consent={consent}
          onConsent={(v) => {
            setConsent(v);
            if (v) setConsentError(null);
          }}
          consentError={consentError}
          copy={copy.contact}
        />
      );
    }
    if (id === "model")
      return (
        <ModelStep
          idPrefix={idPrefix}
          models={models}
          value={answers.model}
          onChange={set("model")}
          copy={copy.model}
          error={stepError ?? fieldErrors?.model?.[0]}
        />
      );
    const key = id as keyof Answers;
    return (
      <RadioCardGroup
        name={`${idPrefix}-${id}`}
        legend={steps.find((s) => s.id === id)?.title ?? id}
        options={optionsFor(id)}
        value={answers[key]}
        onChange={set(key)}
        error={stepError}
      />
    );
  };

  const summary = steps
    .slice(0, flow.index)
    .filter((s) => s.id !== "contact")
    .map((s) => {
      const v = answers[s.id as keyof Answers];
      return s.id === "model" ? v : labelFor(s.id, v);
    })
    .filter(Boolean);

  const lede = flow.isLast && submitting ? copy.submittingLede : step.lede;
  const percent = Math.round(((flow.index + 1) / steps.length) * 100);
  const counter = copy.stepCounter
    .replace("{n}", String(flow.index + 1))
    .replace("{total}", String(steps.length));

  return (
    <form
      data-testid={testId}
      aria-label={copy.ariaLabel}
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={markStarted}
      className={cn(shell, "relative")}
    >
      <Honeypot {...honeypotProps} />
      {submitFailed ? (
        <LeadFlowAlert
          title={copy.submitError.title}
          body={copy.submitError.body}
          phone={phoneDisplay}
        />
      ) : null}
      <StepMeta counter={counter} label={step.label} percent={percent} />
      <MultiStepForm
        label={copy.ariaLabel}
        index={flow.index}
        direction={flow.direction}
        progressTestId="form-progress"
        progressClassName="h-1"
        titleClassName="mb-2 mt-6 px-1 text-balance text-h4 font-semibold text-text"
        header={
          <>
            <FlowStepper labels={steps.map((s) => s.label)} index={flow.index} />
            <SelectionSummary items={summary} label={copy.ariaLabel} />
          </>
        }
        steps={steps.map((s) => ({
          id: s.id,
          title: s.title,
          content:
            s.id === step.id ? (
              <div className="grid gap-6 px-1 pb-1">
                {lede ? <p className="text-body-sm text-text-secondary">{lede}</p> : null}
                {body(s.id)}
              </div>
            ) : null,
        }))}
        footer={
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={flow.isFirst || submitting}
              className={cn(buttonClasses("secondary"), "border-transparent disabled:opacity-40")}
            >
              {copy.buttons.back}
            </button>
            {flow.isLast ? (
              <button
                type="submit"
                aria-busy={submitting || undefined}
                data-loading={submitting || undefined}
                disabled={submitting}
                className={cn(
                  buttonClasses("primary"),
                  "relative",
                  submitting &&
                    "after:from-text/20 after:via-text/55 after:to-text/20 text-transparent after:absolute after:inset-x-6 after:h-2 after:rounded-full after:bg-gradient-to-r after:content-['']",
                )}
              >
                {submitting
                  ? copy.buttons.submitting
                  : submitFailed
                    ? copy.buttons.retry
                    : copy.buttons.submit}
                {submitting ? null : <LeadIcon name="arrow" size={16} />}
              </button>
            ) : (
              <button type="button" onClick={goNext} className={buttonClasses("primary")}>
                {copy.buttons.next}
                <LeadIcon name="arrow" size={16} />
              </button>
            )}
          </div>
        }
      />
    </form>
  );
}

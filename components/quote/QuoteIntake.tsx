"use client";

import { useEffect, useRef, useState } from "react";
import { readAttribution } from "@/lib/attribution";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { ISSUE_OTHER, OTHER, type Device } from "@/lib/repair-catalog";
import { findPrices, type QuotePriceLine } from "@/lib/repair-prices";
import type { CompleteInput, CompleteResponse, IntakeResult, SlotsResponse } from "@/lib/repair-schemas";
import { shopDateISO } from "@/lib/repair-time";
import { BrandStep } from "@/components/repair-intake/BrandStep";
import { ConfirmationStep, type ShopInfo, type WhatToBring } from "@/components/repair-intake/ConfirmationStep";
import { ContactStep } from "@/components/repair-intake/ContactStep";
import { DeviceStep } from "@/components/repair-intake/DeviceStep";
import { IssueStep } from "@/components/repair-intake/IssueStep";
import { ModelStep } from "@/components/repair-intake/ModelStep";
import { ModelSummary } from "@/components/repair-intake/ModelSummary";
import { ScheduleStep, type SlotsState } from "@/components/repair-intake/ScheduleStep";
import { StepHeading, StepProgress, continueClass } from "@/components/repair-intake/ui";
import { FormShell } from "@/components/sections/forms/FormShell";
import { fieldError, TextAreaField } from "@/components/sections/forms/fields";

/** No price for the repair: notes, then "we'll get back to you". */
const STEPS = ["Device", "Contact", "Brand", "Model", "Issue", "Details"] as const;
/** A price in the CMS for it: the price, then the /repair time picker. */
const PRICED_STEPS = ["Device", "Contact", "Brand", "Model", "Issue", "Price", "Time"] as const;
const [DEVICE, CONTACT, BRAND, MODEL, ISSUE, DETAILS, TIME] = [0, 1, 2, 3, 4, 5, 6];
const PRICE = DETAILS; // the same slot: which one shows depends on whether there's a price
const DONE = PRICED_STEPS.length; // the booking confirmation, after the last numbered step

interface Answers {
  device: Device | null;
  name: string;
  phone: string;
  email: string;
  brand: string | null;
  brandOther: string;
  model: string | null;
  modelOther: string;
  issue: string | null;
  issueOther: string;
  date: string | null;
  slotStart: string | null;
}

const EMPTY: Answers = {
  device: null,
  name: "",
  phone: "",
  email: "",
  brand: null,
  brandOther: "",
  model: null,
  modelOther: "",
  issue: null,
  issueOther: "",
  date: null,
  slotStart: null,
};

/** What each step owns. Changing a step's answer clears every later step's (contact details are kept). */
const OWNED: (keyof Answers)[][] = [["device"], [], ["brand", "brandOther"], ["model", "modelOther"], ["issue", "issueOther"], [], ["date", "slotStart"]];

const resolved = (choice: string | null, other: string) => (choice === OTHER ? other : (choice ?? ""));

/**
 * /instant-quote: device → contact → brand → model → issue, in the same order as the /repair widget and with its
 * steps. Then one of two endings:
 * - the service pages' price lists have a price for that model and issue (lib/repair-prices.ts): the lead goes to
 *   GHL as Quote Shown, the price shows, and "Book this repair" opens the /repair time picker with everything carried
 *   over (/api/repair/book moves the same card to Booked);
 * - no price: a notes step that posts to /api/forms/quote as a Quote Requested lead for staff to price.
 */
export function QuoteIntake({
  successMessage,
  prices,
  priceDisclaimer,
  shop,
  whatToBring,
}: {
  successMessage: string;
  prices: QuotePriceLine[];
  priceDisclaimer: string;
  shop: ShopInfo;
  whatToBring: WhatToBring;
}) {
  const [step, setStep] = useState(DEVICE);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  // Two senders, so the background "price shown" lead never flips the notes form to its sent state.
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("quote");
  const shownLead = useFormSubmit("quote");
  const sentRepair = useRef<string | null>(null);
  const [slots, setSlots] = useState<SlotsState>({ status: "idle" });
  const [slotError, setSlotError] = useState<string>();
  const [booking, setBooking] = useState<{ pending: boolean; error?: string }>({ pending: false });
  const [result, setResult] = useState<IntakeResult | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);
  const slotsRequest = useRef(0);

  // Keyboard and screen-reader users land on the new step's heading, not on a button that no longer exists.
  useEffect(() => {
    if (!movedRef.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  // Times load once per visit to the time step (and again after a slot is lost).
  useEffect(() => {
    if (step === TIME && slots.status === "idle") void loadSlots();
  }, [step, slots.status]);

  const goTo = (next: number) => {
    movedRef.current = true;
    setStep(next);
  };

  /** Records a step's answer (clearing later steps if it changed) and moves to the next step. */
  const answer = (at: number, patch: Partial<Answers>) => {
    markStarted();
    shownLead.markStarted();
    const changed = (Object.keys(patch) as (keyof Answers)[]).some((k) => patch[k] !== answers[k]);
    const later = OWNED.slice(at + 1).flat();
    setAnswers(changed ? { ...answers, ...patch, ...Object.fromEntries(later.map((k) => [k, EMPTY[k]])) } : answers);
    goTo(at + 1);
  };

  const brand = resolved(answers.brand, answers.brandOther);
  const model = resolved(answers.model, answers.modelOther);
  const deviceLabel = `${brand} ${model}`.trim();
  const problem = answers.issue === ISSUE_OTHER ? answers.issueOther : (answers.issue ?? "");
  const quoted =
    answers.device && answers.issue ? findPrices(prices, { device: answers.device, brand, model, issue: answers.issue }) : [];
  const priced = quoted.length > 0;
  const steps = priced ? PRICED_STEPS : STEPS;
  const sent = !priced && state.status === "success";
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const status =
    step === DONE ? "Repair request sent" : sent ? "Quote request sent" : `Step ${step + 1} of ${steps.length}: ${steps[step]}`;

  /** The priced path's lead (GHL: Quote Shown), sent as the price shows. Once per repair, however often they go back. */
  function sendShownLead(issue: string, issueOther: string) {
    const payload = {
      deviceType: answers.device!,
      brand,
      model,
      issue,
      details: issueOther,
      name: answers.name,
      phone: answers.phone,
      email: answers.email,
    };
    const key = JSON.stringify(payload);
    if (sentRepair.current === key && shownLead.state.status !== "error") return;
    sentRepair.current = key;
    void shownLead.submit({ ...payload, attribution: readAttribution() });
  }

  async function loadSlots() {
    const id = ++slotsRequest.current;
    setSlots({ status: "loading" });
    try {
      const res = await fetch("/api/repair/slots", { cache: "no-store" });
      const body = (await res.json()) as SlotsResponse;
      if (id !== slotsRequest.current) return;
      if (!body.ok) return setSlots({ status: "error" });
      setSlots({ status: "ready", days: body.days });
      const first = Object.keys(body.days)
        .sort()
        .find((d) => body.days[d].some((s) => s.available));
      setAnswers((a) => (a.date && body.days[a.date] ? a : { ...a, date: first ?? null, slotStart: null }));
    } catch {
      if (id === slotsRequest.current) setSlots({ status: "error" });
    }
  }

  /** Same request as the /repair widget's last step. It finds the Quote Shown card and moves it to Booked. */
  async function book(slotStart: string | null) {
    if (!answers.device || !answers.issue) return;
    const payload: CompleteInput = {
      device: answers.device,
      brand,
      model,
      issue: answers.issue,
      issueDetails: answers.issue === ISSUE_OTHER ? answers.issueOther : undefined,
      phone: answers.phone,
      email: answers.email,
      name: answers.name,
      token: null,
      slotStart,
      attribution: readAttribution(),
    };
    setBooking({ pending: true });
    try {
      const res = await fetch("/api/repair/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as CompleteResponse;
      if (!body.ok) {
        // The slot went while they were deciding: the times reload so it's gone.
        if (res.status === 409) {
          setBooking({ pending: false });
          setAnswers((a) => ({ ...a, slotStart: null }));
          setSlotError(body.message);
          setSlots({ status: "idle" });
          return;
        }
        return setBooking({ pending: false, error: body.message });
      }
      setBooking({ pending: false });
      setResult(body.result);
      goTo(DONE);
    } catch {
      setBooking({ pending: false, error: "We couldn't send your request. Check your connection and try again." });
    }
  }

  const restart = () => {
    // Same visitor, new repair: contact details stay.
    setAnswers({ ...EMPTY, name: answers.name, phone: answers.phone, email: answers.email });
    setResult(null);
    setSlots({ status: "idle" });
    setSlotError(undefined);
    sentRepair.current = null;
    goTo(DEVICE);
  };

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      {sent || step === DONE ? null : (
        <StepProgress steps={steps} step={step} status={status} label="Quote progress" onBack={() => goTo(step - 1)} />
      )}

      {(step === ISSUE || step === DETAILS || step === TIME) && answers.device && !sent ? (
        <ModelSummary
          className="mb-8"
          device={answers.device}
          model={answers.model}
          label={deviceLabel}
          onChange={() => goTo(MODEL)}
        />
      ) : null}

      {step === DEVICE ? (
        <DeviceStep
          value={answers.device}
          intro="Pick your device and we'll get back to you with a free quote."
          onChoose={(device) => answer(DEVICE, { device })}
        />
      ) : null}

      {step === CONTACT ? (
        <ContactStep
          intro="We'll text or call you with your quote."
          value={{ name: answers.name, phone: answers.phone, email: answers.email }}
          pending={false}
          onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
          onSubmit={(v) => {
            setAnswers((a) => ({ ...a, ...v }));
            goTo(BRAND);
          }}
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

      {step === ISSUE && answers.device && answers.brand ? (
        <IssueStep
          device={answers.device}
          brand={answers.brand}
          value={answers.issue}
          details={answers.issueOther}
          onChoose={(issue, issueOther) => {
            answer(ISSUE, { issue, issueOther });
            if (findPrices(prices, { device: answers.device!, brand, model, issue }).length) sendShownLead(issue, issueOther);
          }}
        />
      ) : null}

      {step === PRICE && priced ? (
        <>
          <StepHeading title="Your repair price" intro={`${deviceLabel}, ${problem.toLowerCase()}.`} />
          <dl className="divide-y divide-border border-y border-border">
            {quoted.map((p, i) => (
              <div key={`${p.label}-${i}`} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="text-body-lg text-text-secondary">{p.label}</dt>
                <dd className="font-heading text-h4 font-black tabular-nums text-text">{p.price}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-body-sm text-text-tertiary">{priceDisclaimer}</p>
          <button type="button" className={`${continueClass} mt-8`} onClick={() => goTo(TIME)}>
            Book this repair
          </button>
          {shownLead.state.status === "error" ? (
            <p role="alert" className="mt-4 text-body-sm text-error">
              {shownLead.state.message}{" "}
              <button
                type="button"
                className="font-bold underline underline-offset-2"
                onClick={() => sendShownLead(answers.issue!, answers.issueOther)}
              >
                Try again
              </button>
            </p>
          ) : (
            <p className="mt-4 text-body-sm text-text-secondary">Not ready to book? We&apos;ll text or call you about your quote.</p>
          )}
        </>
      ) : null}

      {step === DETAILS && !priced && answers.device && answers.issue ? (
        <>
          {sent ? null : (
            <StepHeading
              title="Anything else we should know?"
              intro={`Problem: ${problem.toLowerCase()}. Add anything that helps, or just send it.`}
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
                name: answers.name,
                phone: answers.phone,
                email: answers.email,
                attribution: readAttribution(),
              })
            }
          >
            <TextAreaField id="q-details" label="Notes (optional)" error={fieldError(errors, "details")} />
          </FormShell>
        </>
      ) : null}

      {step === TIME && priced ? (
        <ScheduleStep
          today={shopDateISO()}
          date={answers.date}
          slotStart={answers.slotStart}
          slots={slots}
          // Held until the quote lead is in, so the booking finds its card rather than racing it.
          pending={booking.pending || shownLead.state.status === "submitting"}
          error={slotError ?? booking.error}
          onPickDate={(date) => setAnswers((a) => ({ ...a, date, slotStart: a.date === date ? a.slotStart : null }))}
          onPickSlot={(slotStart) => {
            setAnswers((a) => ({ ...a, slotStart }));
            setSlotError(undefined);
            setBooking({ pending: false });
          }}
          // Without times (load failed, or nothing free) there's no slot: the shop calls to confirm one.
          onBook={() => void book(slots.status === "ready" ? answers.slotStart : null)}
          onSkip={() => {
            setAnswers((a) => ({ ...a, slotStart: null }));
            setSlotError(undefined);
            void book(null);
          }}
        />
      ) : null}

      {step === DONE && result && answers.device ? (
        <ConfirmationStep
          result={result}
          calendarTitle={`${shop.name}: ${problem} (${model})`}
          device={<ModelSummary device={answers.device} model={answers.model} label={deviceLabel} />}
          summary={[
            { label: "Issue", value: problem },
            ...quoted.map((p) => ({ label: p.label, value: p.price })),
            { label: "Name", value: answers.name },
            { label: "Phone", value: answers.phone },
            { label: "Email", value: answers.email },
          ]}
          shop={shop}
          whatToBring={whatToBring}
          onRestart={restart}
        />
      ) : null}
    </div>
  );
}

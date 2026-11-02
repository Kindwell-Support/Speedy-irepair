"use client";

import { useEffect, useRef, useState } from "react";
import { readAttribution } from "@/lib/attribution";
import { ISSUE_OTHER, OTHER, isDevice, type Device } from "@/lib/repair-catalog";
import type {
  CompleteInput,
  CompleteResponse,
  IntakeField,
  IntakeResult,
  SlotsResponse,
  StartResponse,
} from "@/lib/repair-schemas";
import { shopDateISO } from "@/lib/repair-time";
import { BrandStep } from "./BrandStep";
import { ConfirmationStep, type ShopInfo, type WhatToBring } from "./ConfirmationStep";
import { ContactStep } from "./ContactStep";
import { DeviceStep } from "./DeviceStep";
import { IssueStep } from "./IssueStep";
import { ModelStep } from "./ModelStep";
import { ScheduleStep, type SlotsState } from "./ScheduleStep";
import { StepProgress } from "./ui";

const STEPS = ["Device", "Contact", "Brand", "Model", "Issue", "Time"] as const;
const [DEVICE, CONTACT, BRAND, MODEL, ISSUE, TIME] = [0, 1, 2, 3, 4, 5];
const DONE = STEPS.length; // the confirmation, after the last numbered step
const STORAGE_KEY = "speedy:repair-intake:v2";

interface Answers {
  device: Device | null;
  phone: string;
  email: string;
  name: string;
  /** Signed CRM session from step 2; null when step 2 couldn't reach the CRM (step 6 then creates the lead). */
  token: string | null;
  /** The step 2 payload the token was issued for; set even when token is null, and marks step 2 as done. */
  tokenKey: string | null;
  brand: string | null;
  brandOther: string;
  model: string | null;
  modelOther: string;
  issue: string | null;
  issueDetails: string;
  date: string | null;
  slotStart: string | null;
}

const EMPTY: Answers = {
  device: null,
  phone: "",
  email: "",
  name: "",
  token: null,
  tokenKey: null,
  brand: null,
  brandOther: "",
  model: null,
  modelOther: "",
  issue: null,
  issueDetails: "",
  date: null,
  slotStart: null,
};

/** What each step owns. Changing a step's answer clears every later step's (contact details are kept). */
const OWNED: (keyof Answers)[][] = [
  ["device"],
  ["token", "tokenKey"],
  ["brand", "brandOther"],
  ["model", "modelOther"],
  ["issue", "issueDetails"],
  ["date", "slotStart"],
];

function clearAfter(a: Answers, step: number): Answers {
  const keys = OWNED.slice(step + 1).flat();
  return { ...a, ...Object.fromEntries(keys.map((k) => [k, EMPTY[k]])) };
}

const resolved = (choice: string | null, other: string, otherOption: string) =>
  choice === otherOption ? other : (choice ?? "");

const startKey = (a: Pick<Answers, "device" | "name" | "phone" | "email">) =>
  JSON.stringify({ device: a.device, name: a.name.trim(), phone: a.phone.trim(), email: a.email.trim() });

/** The furthest step these answers support, so a restored session never lands past what it has. */
function furthestStep(a: Answers): number {
  if (!a.device) return DEVICE;
  if (!a.tokenKey || !a.name.trim() || !a.email.trim()) return CONTACT;
  if (!resolved(a.brand, a.brandOther, OTHER)) return BRAND;
  if (!resolved(a.model, a.modelOther, OTHER)) return MODEL;
  if (!a.issue || (a.issue === ISSUE_OTHER && !a.issueDetails)) return ISSUE;
  return TIME;
}

/** Restores a saved session, ignoring anything malformed. Times are always reloaded, so the slot is dropped. */
function readSaved(): { step: number; answers: Answers } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { step?: unknown; answers?: Partial<Answers> };
    const answers: Answers = { ...EMPTY, ...saved.answers, date: null, slotStart: null };
    if (answers.device !== null && !isDevice(answers.device)) return null;
    const step =
      typeof saved.step === "number" ? Math.max(0, Math.min(saved.step, furthestStep(answers))) : 0;
    return { step, answers };
  } catch {
    return null;
  }
}

/** Steps 3–5 write each answer to the CRM as it's chosen. Fire-and-forget: step 6 sends everything again anyway. */
function saveField(token: string | null, field: IntakeField, value: string) {
  if (!token || !value) return;
  void fetch("/api/repair/lead", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, field, value }),
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * /repair intake: device → name and phone (creates the lead) → brand → model → issue → time (books it, or asks for a
 * call) → confirmation. Talks only to /api/repair/*; the CRM behind those routes lives in lib/booking (server-only),
 * and nothing here depends on CMS data. A CRM failure never stops the visitor: the server logs and retries it.
 * Progress survives a reload through sessionStorage until the request is sent.
 */
export function RepairIntake({ shop, whatToBring }: { shop: ShopInfo; whatToBring: WhatToBring }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [restored, setRestored] = useState(false);

  const [start, setStart] = useState<{
    pending: boolean;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>({ pending: false });
  const [slots, setSlots] = useState<SlotsState>({ status: "idle" });
  const [slotError, setSlotError] = useState<string>();
  const [submit, setSubmit] = useState<{
    pending: boolean;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>({ pending: false });
  const [result, setResult] = useState<IntakeResult | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const slotsRequest = useRef(0);
  const movedRef = useRef(false);

  // Restore after mount, so the server render and the first client render match.
  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setAnswers(saved.answers);
      setStep(saved.step);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      if (step === DONE) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers }));
    } catch {
      // Storage blocked (private mode, quota): the widget still works, it just won't survive a reload.
    }
  }, [restored, step, answers]);

  // Keyboard and screen-reader users land on the new step's heading, not on a button that no longer exists.
  useEffect(() => {
    if (!movedRef.current) return;
    rootRef.current
      ?.querySelector<HTMLElement>("[data-step-heading]")
      ?.focus({ preventScroll: true });
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
    const changed = (Object.keys(patch) as (keyof Answers)[]).some((k) => patch[k] !== answers[k]);
    setAnswers(changed ? clearAfter({ ...answers, ...patch }, at) : answers);
    goTo(at + 1);
    return changed;
  };

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
      setAnswers((a) =>
        a.date && body.days[a.date] ? a : { ...a, date: first ?? null, slotStart: null },
      );
    } catch {
      if (id === slotsRequest.current) setSlots({ status: "error" });
    }
  }

  async function submitContact(value: { name: string; phone: string; email: string }) {
    const next = { ...answers, ...value };
    const key = startKey(next);
    if (answers.tokenKey === key) return goTo(BRAND);
    setStart({ pending: true });
    let token: string | null = null;
    try {
      const res = await fetch("/api/repair/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          device: next.device,
          name: next.name,
          phone: next.phone,
          email: next.email,
          attribution: readAttribution(),
        }),
      });
      const body = (await res.json()) as StartResponse;
      if (!body.ok && res.status === 422)
        return setStart({ pending: false, error: body.message, fieldErrors: body.fieldErrors });
      if (body.ok) token = body.token;
    } catch {
      // The CRM call is retried at step 6 with every answer; the visitor carries on.
    }
    setStart({ pending: false });
    setAnswers({ ...next, token, tokenKey: key });
    goTo(BRAND);
  }

  async function book(slotStart: string | null) {
    const a = answers;
    if (!a.device || !a.issue) return;
    const payload: CompleteInput = {
      device: a.device,
      brand: resolved(a.brand, a.brandOther, OTHER),
      model: resolved(a.model, a.modelOther, OTHER),
      issue: a.issue,
      issueDetails: a.issue === ISSUE_OTHER ? a.issueDetails : undefined,
      phone: a.phone,
      email: a.email,
      name: a.name,
      token: a.token,
      slotStart,
      attribution: readAttribution(),
    };
    setSubmit({ pending: true });
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
          setSubmit({ pending: false });
          setAnswers((prev) => ({ ...prev, slotStart: null }));
          setSlotError(body.message);
          setSlots({ status: "idle" });
          return;
        }
        return setSubmit({ pending: false, error: body.message, fieldErrors: body.fieldErrors });
      }
      setSubmit({ pending: false });
      setResult(body.result);
      goTo(DONE);
    } catch {
      setSubmit({
        pending: false,
        error: "We couldn't send your request. Check your connection and try again.",
      });
    }
  }

  const restart = () => {
    // Same visitor, new repair: contact details stay, but step 2 runs again so it gets its own opportunity.
    setAnswers({ ...EMPTY, phone: answers.phone, email: answers.email, name: answers.name });
    setResult(null);
    setSlots({ status: "idle" });
    setSlotError(undefined);
    goTo(0);
  };

  const brandLabel = resolved(answers.brand, answers.brandOther, OTHER);
  const modelLabel = resolved(answers.model, answers.modelOther, OTHER);
  const issueLabel = answers.issue === ISSUE_OTHER ? answers.issueDetails : (answers.issue ?? "");
  const status =
    step === DONE ? "Request sent" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      {step === DONE ? null : (
        <StepProgress
          steps={STEPS}
          step={step}
          status={status}
          label="Booking progress"
          onBack={() => goTo(step - 1)}
        />
      )}

      {step === DEVICE ? (
        <DeviceStep value={answers.device} onChoose={(device) => answer(DEVICE, { device })} />
      ) : null}

      {step === CONTACT ? (
        <ContactStep
          intro="We'll text or call if anything changes before your appointment."
          value={{ name: answers.name, phone: answers.phone, email: answers.email }}
          pending={start.pending}
          error={start.error}
          serverFieldErrors={start.fieldErrors}
          onChange={(v) => setAnswers((a) => ({ ...a, ...v }))}
          onSubmit={submitContact}
        />
      ) : null}

      {step === BRAND && answers.device ? (
        <BrandStep
          key={answers.device}
          device={answers.device}
          value={answers.brand}
          otherValue={answers.brandOther}
          onChoose={(brand, brandOther) => {
            if (answer(BRAND, { brand, brandOther }))
              saveField(answers.token, "brand", resolved(brand, brandOther, OTHER));
          }}
        />
      ) : null}

      {step === MODEL && answers.device && answers.brand ? (
        <ModelStep
          device={answers.device}
          brand={answers.brand}
          brandLabel={brandLabel}
          value={answers.model}
          otherValue={answers.modelOther}
          onChoose={(model, modelOther) => {
            if (answer(MODEL, { model, modelOther }))
              saveField(answers.token, "model", resolved(model, modelOther, OTHER));
          }}
        />
      ) : null}

      {step === ISSUE && answers.device && answers.brand ? (
        <IssueStep
          device={answers.device}
          brand={answers.brand}
          value={answers.issue}
          details={answers.issueDetails}
          onChoose={(issue, issueDetails) => {
            if (!answer(ISSUE, { issue, issueDetails })) return;
            saveField(answers.token, "issue", issue);
            if (issue === ISSUE_OTHER) saveField(answers.token, "problemDetails", issueDetails);
          }}
        />
      ) : null}

      {step === TIME ? (
        <ScheduleStep
          today={shopDateISO()}
          date={answers.date}
          slotStart={answers.slotStart}
          slots={slots}
          pending={submit.pending}
          error={slotError ?? submit.error}
          onPickDate={(date) =>
            setAnswers((a) => ({ ...a, date, slotStart: a.date === date ? a.slotStart : null }))
          }
          onPickSlot={(slotStart) => {
            setAnswers((a) => ({ ...a, slotStart }));
            setSlotError(undefined);
            setSubmit({ pending: false });
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

      {step === DONE && result ? (
        <ConfirmationStep
          result={result}
          calendarTitle={`${shop.name}: ${issueLabel} (${modelLabel})`}
          summary={[
            { label: "Device", value: `${brandLabel} ${modelLabel}`.trim() },
            { label: "Issue", value: issueLabel },
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

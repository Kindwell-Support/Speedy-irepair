"use client";

import { useEffect, useRef, useState } from "react";
import { ISSUE_OTHER, OTHER, isDevice, type Device } from "@/lib/repair-catalog";
import type { BookResponse, BookingResult, LeadInput, LeadResponse, RepairContact, SlotsResponse } from "@/lib/repair-schemas";
import { addDaysISO, shopDateISO, weekdayOf } from "@/lib/repair-time";
import { cssVars } from "@/lib/utils/css-vars";
import { BrandStep } from "./BrandStep";
import { ConfirmationStep, type ShopInfo, type WhatToBring } from "./ConfirmationStep";
import { ContactStep } from "./ContactStep";
import { DeviceStep } from "./DeviceStep";
import { IssueStep } from "./IssueStep";
import { ModelStep } from "./ModelStep";
import { ScheduleStep, type SlotsState } from "./ScheduleStep";

const STEPS = ["Device", "Brand", "Model", "Issue", "Your details", "Time"] as const;
const DONE = STEPS.length; // the confirmation, after the last numbered step
const STORAGE_KEY = "speedy:repair-intake:v1";

interface Answers {
  device: Device | null;
  brand: string | null;
  brandOther: string;
  model: string | null;
  modelOther: string;
  issue: string | null;
  issueDetails: string;
  contact: RepairContact;
  leadId: string | null;
  /** The lead payload leadId was created for; a different payload means a new lead. */
  leadKey: string | null;
  date: string | null;
  slotStart: string | null;
}

const EMPTY: Answers = {
  device: null,
  brand: null,
  brandOther: "",
  model: null,
  modelOther: "",
  issue: null,
  issueDetails: "",
  contact: { name: "", phone: "", email: "" },
  leadId: null,
  leadKey: null,
  date: null,
  slotStart: null,
};

/** What each step owns. Changing a step's answer clears every later step's (contact details are kept). */
const OWNED: (keyof Answers)[][] = [
  ["device"],
  ["brand", "brandOther"],
  ["model", "modelOther"],
  ["issue", "issueDetails"],
  ["leadId", "leadKey"],
  ["date", "slotStart"],
];

function clearAfter(a: Answers, step: number): Answers {
  const keys = OWNED.slice(step + 1).flat();
  return { ...a, ...Object.fromEntries(keys.map((k) => [k, EMPTY[k]])) };
}

const resolved = (choice: string | null, other: string, otherOption: string) => (choice === otherOption ? other : (choice ?? ""));

function leadPayload(a: Answers): LeadInput | null {
  if (!a.device || !a.issue) return null;
  return {
    device: a.device,
    brand: resolved(a.brand, a.brandOther, OTHER),
    model: resolved(a.model, a.modelOther, OTHER),
    issue: a.issue,
    issueDetails: a.issue === ISSUE_OTHER ? a.issueDetails : undefined,
    ...a.contact,
  };
}

/** The furthest step these answers support, so a restored session never lands past what it has. */
function furthestStep(a: Answers): number {
  if (!a.device) return 0;
  if (!resolved(a.brand, a.brandOther, OTHER)) return 1;
  if (!resolved(a.model, a.modelOther, OTHER)) return 2;
  if (!a.issue || (a.issue === ISSUE_OTHER && !a.issueDetails)) return 3;
  if (!a.leadId) return 4;
  return 5;
}

/** Restores a saved session, ignoring anything malformed. */
function readSaved(): { step: number; answers: Answers } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { step?: unknown; answers?: Partial<Answers> };
    const answers: Answers = { ...EMPTY, ...saved.answers, contact: { ...EMPTY.contact, ...saved.answers?.contact }, date: null, slotStart: null };
    if (answers.device !== null && !isDevice(answers.device)) return null;
    const step = typeof saved.step === "number" ? Math.max(0, Math.min(saved.step, furthestStep(answers))) : 0;
    return { step, answers };
  } catch {
    return null;
  }
}

/** First day worth showing times for: today, or Monday when today is Sunday. */
const firstOpenDay = (today: string) => (weekdayOf(today) === 0 ? addDaysISO(today, 1) : today);

/**
 * /repair intake: device → brand → model → issue → contact (creates the lead) → time (books it) → confirmation.
 * Talks only to /api/repair/*; the booking backend behind those routes lives in lib/booking (server-only).
 * Progress survives a reload through sessionStorage until the booking is made.
 */
export function RepairIntake({ shop, whatToBring }: { shop: ShopInfo; whatToBring: WhatToBring }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [restored, setRestored] = useState(false);

  const [lead, setLead] = useState<{ pending: boolean; error?: string; fieldErrors?: Record<string, string[] | undefined> }>({ pending: false });
  const [slots, setSlots] = useState<SlotsState>({ status: "idle" });
  const [emptyDates, setEmptyDates] = useState<ReadonlySet<string>>(new Set());
  const [book, setBook] = useState<{ pending: boolean; error?: string }>({ pending: false });
  const [booking, setBooking] = useState<BookingResult | null>(null);

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
    rootRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  const goTo = (next: number) => {
    movedRef.current = true;
    setStep(next);
  };

  /** Records a step's answer (clearing later steps if it changed) and moves to the next step. */
  const answer = (at: number, patch: Partial<Answers>) => {
    const changed = (Object.keys(patch) as (keyof Answers)[]).some((k) => patch[k] !== answers[k]);
    setAnswers(changed ? clearAfter({ ...answers, ...patch }, at) : answers);
    if (changed && at < 5) {
      setSlots({ status: "idle" });
      setBook({ pending: false });
    }
    goTo(at + 1);
  };

  async function fetchSlots(date: string) {
    const res = await fetch(`/api/repair/slots?date=${date}`, { cache: "no-store" });
    const body = (await res.json()) as SlotsResponse;
    if (!body.ok) throw new Error(body.message);
    return body.slots;
  }

  /** Shows a day's times. With `searchAhead`, skips forward (up to a week) past days with nothing open. */
  async function showDate(date: string, searchAhead = false) {
    const id = ++slotsRequest.current;
    setAnswers((a) => ({ ...a, date, slotStart: null }));
    setBook({ pending: false });
    setSlots({ status: "loading" });
    try {
      let day = date;
      for (let tries = 0; ; tries++) {
        const list = await fetchSlots(day);
        if (id !== slotsRequest.current) return;
        const hasOpening = list.some((s) => s.available);
        if (!hasOpening) setEmptyDates((prev) => new Set(prev).add(day));
        if (hasOpening || !searchAhead || tries >= 6) {
          setAnswers((a) => ({ ...a, date: day, slotStart: null }));
          setSlots({ status: "ready", slots: list });
          return;
        }
        day = addDaysISO(day, weekdayOf(day) === 6 ? 2 : 1);
      }
    } catch {
      if (id === slotsRequest.current) setSlots({ status: "error", message: "We couldn't load times for that day. Please try again." });
    }
  }

  async function submitContact(contact: RepairContact) {
    const payload = leadPayload({ ...answers, contact });
    if (!payload) return;
    const key = JSON.stringify(payload);
    if (answers.leadId && answers.leadKey === key) {
      goTo(5);
      if (slots.status === "idle") void showDate(firstOpenDay(shopDateISO()), true);
      return;
    }
    setLead({ pending: true });
    try {
      const res = await fetch("/api/repair/lead", { method: "POST", headers: { "content-type": "application/json" }, body: key });
      const body = (await res.json()) as LeadResponse;
      if (!body.ok) return setLead({ pending: false, error: body.message, fieldErrors: body.fieldErrors });
      setLead({ pending: false });
      setAnswers((a) => ({ ...clearAfter({ ...a, contact }, 3), leadId: body.leadId, leadKey: key }));
      goTo(5);
      void showDate(firstOpenDay(shopDateISO()), true);
    } catch {
      setLead({ pending: false, error: "We couldn't save your details. Check your connection and try again." });
    }
  }

  async function submitBooking() {
    const payload = leadPayload(answers);
    if (!payload || !answers.leadId || !answers.date || !answers.slotStart) return;
    setBook({ pending: true });
    try {
      const res = await fetch("/api/repair/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, leadId: answers.leadId, date: answers.date, slotStart: answers.slotStart }),
      });
      const body = (await res.json()) as BookResponse;
      if (!body.ok) {
        setBook({ pending: false, error: body.message });
        // The slot went while they were deciding: refresh the day so it shows as taken.
        if (res.status === 409) void refreshDay(answers.date, body.message);
        return;
      }
      setBook({ pending: false });
      setBooking(body.booking);
      goTo(DONE);
    } catch {
      setBook({ pending: false, error: "We couldn't book that time. Check your connection and try again." });
    }
  }

  async function refreshDay(date: string, message: string) {
    await showDate(date);
    setBook({ pending: false, error: message });
  }

  const restart = () => {
    setAnswers({ ...EMPTY, contact: answers.contact });
    setBooking(null);
    setSlots({ status: "idle" });
    setEmptyDates(new Set());
    goTo(0);
  };

  const brandLabel = resolved(answers.brand, answers.brandOther, OTHER);
  const modelLabel = resolved(answers.model, answers.modelOther, OTHER);
  const issueLabel = answers.issue === ISSUE_OTHER ? answers.issueDetails : (answers.issue ?? "");
  const progress = step === DONE ? 100 : ((step + 1) / STEPS.length) * 100;
  const status = step === DONE ? "Booking confirmed" : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;

  return (
    <div ref={rootRef} className="scroll-mt-24">
      <p className="sr-only" aria-live="polite" aria-atomic>
        {status}
      </p>

      {step === DONE ? null : (
        <div className="mb-8">
          <div className="mb-3 flex min-h-11 items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-body-sm font-bold uppercase tracking-[0.06em] text-text-secondary transition-colors duration-fast hover:text-text focus-visible:shadow-focus"
              >
                <span aria-hidden>←</span> Back
              </button>
            ) : (
              <span />
            )}
            <p aria-hidden className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              <span className="tabular-nums text-text">{step + 1}</span> / {STEPS.length} · {STEPS[step]}
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Booking progress"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-valuetext={status}
            className="h-1 overflow-hidden rounded-full bg-surface-3"
          >
            <div className="h-full w-[var(--progress)] rounded-full bg-primary transition-[width] duration-base ease-out" style={cssVars({ "--progress": `${progress}%` })} />
          </div>
        </div>
      )}

      {step === 0 ? <DeviceStep value={answers.device} onChoose={(device) => answer(0, { device })} /> : null}

      {step === 1 && answers.device ? (
        <BrandStep
          key={answers.device}
          device={answers.device}
          value={answers.brand}
          otherValue={answers.brandOther}
          onChoose={(brand, brandOther) => answer(1, { brand, brandOther })}
        />
      ) : null}

      {step === 2 && answers.device && answers.brand ? (
        <ModelStep
          device={answers.device}
          brand={answers.brand}
          brandLabel={brandLabel}
          value={answers.model}
          otherValue={answers.modelOther}
          onChoose={(model, modelOther) => answer(2, { model, modelOther })}
        />
      ) : null}

      {step === 3 && answers.device ? (
        <IssueStep
          device={answers.device}
          value={answers.issue}
          details={answers.issueDetails}
          onChoose={(issue, issueDetails) => answer(3, { issue, issueDetails })}
        />
      ) : null}

      {step === 4 ? (
        <ContactStep
          value={answers.contact}
          pending={lead.pending}
          error={lead.error}
          serverFieldErrors={lead.fieldErrors}
          onChange={(contact) => setAnswers((a) => ({ ...a, contact }))}
          onSubmit={submitContact}
        />
      ) : null}

      {step === 5 ? (
        <ScheduleStep
          today={shopDateISO()}
          date={answers.date}
          slotStart={answers.slotStart}
          slots={slots}
          emptyDates={emptyDates}
          booking={book}
          onPickDate={(date) => void showDate(date)}
          onPickSlot={(slotStart) => {
            setAnswers((a) => ({ ...a, slotStart }));
            setBook({ pending: false });
          }}
          onBook={submitBooking}
        />
      ) : null}

      {step === DONE && booking ? (
        <ConfirmationStep
          booking={booking}
          calendarTitle={`${shop.name}: ${issueLabel} (${modelLabel})`}
          summary={[
            { label: "Device", value: `${brandLabel} ${modelLabel}`.trim() },
            { label: "Issue", value: issueLabel },
            { label: "Name", value: answers.contact.name },
            { label: "Phone", value: answers.contact.phone },
            { label: "Email", value: answers.contact.email },
          ]}
          shop={shop}
          whatToBring={whatToBring}
          onRestart={restart}
        />
      ) : null}
    </div>
  );
}

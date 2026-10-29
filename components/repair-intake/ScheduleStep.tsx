"use client";

import { useState } from "react";
import { Notice } from "@/components/ui/Notice";
import { buttonClasses } from "@/components/ui/ButtonLink";
import type { Slot } from "@/lib/repair-schemas";
import {
  BOOKING_WINDOW_DAYS,
  addDaysISO,
  formatDateLong,
  formatSlotTime,
  weekdayOf,
} from "@/lib/repair-time";
import { cn } from "@/lib/utils/cn";
import { StepHeading, continueClass } from "./ui";

export type SlotsState =
  | { status: "idle" }
  | { status: "loading" }
  /** Times couldn't be loaded: the visitor carries on without one and the shop calls to confirm. */
  | { status: "error" }
  | { status: "ready"; days: Record<string, Slot[]> };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(`${month}-01T12:00:00Z`),
  );

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

function monthDays(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = weekdayOf(`${month}-01`);
  return [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
}

/**
 * Step 6. A plain month grid (no date-picker dependency) over the free slots for the whole booking window, loaded
 * once by the wrapper from /api/repair/slots. Days with nothing free are disabled. If the times can't be loaded, or
 * nothing is free in the window, the visitor continues without a time and the shop calls to confirm one. Every
 * time is shop time (Eastern), whatever the visitor's own clock says.
 */
export function ScheduleStep({
  today,
  date,
  slotStart,
  slots,
  error,
  onPickDate,
  onPickSlot,
  onContinue,
  onSkip,
}: {
  today: string;
  date: string | null;
  slotStart: string | null;
  slots: SlotsState;
  /** e.g. the time picked was taken before the booking went through. */
  error?: string;
  onPickDate: (date: string) => void;
  onPickSlot: (start: string) => void;
  onContinue: () => void;
  /** Continue without a time; the shop calls to arrange one. */
  onSkip: () => void;
}) {
  // Follows the selected day until the visitor pages through months themselves.
  const [viewMonth, setViewMonth] = useState<string>();
  const month = viewMonth ?? (date ?? today).slice(0, 7);
  const lastDay = addDaysISO(today, BOOKING_WINDOW_DAYS);
  const days = slots.status === "ready" ? slots.days : {};
  const closed = (d: string) => !days[d]?.some((s) => s.available);
  const daySlots = date ? (days[date] ?? []) : [];
  const noTimes =
    slots.status === "error" ||
    (slots.status === "ready" &&
      !Object.values(days).some((list) => list.some((s) => s.available)));

  if (noTimes) {
    return (
      <>
        <StepHeading
          title="Pick a time"
          intro="Most repairs are done in 45 minutes while you wait."
        />
        <div className="grid gap-6">
          <Notice>We&apos;ll call you to confirm a time.</Notice>
          <div>
            <button type="button" className={continueClass} onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StepHeading
        title="Pick a time"
        intro="Most repairs are done in 45 minutes while you wait. All times are Eastern Time."
      />
      <div className="grid gap-10 md:grid-cols-2 md:gap-8">
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className={buttonClasses("secondary", "sm", "w-11 px-0")}
              disabled={month <= today.slice(0, 7)}
              onClick={() => setViewMonth(shiftMonth(month, -1))}
              aria-label="Previous month"
            >
              <span aria-hidden>‹</span>
            </button>
            <p className="font-heading text-body-lg font-bold uppercase" aria-live="polite">
              {monthLabel(month)}
            </p>
            <button
              type="button"
              className={buttonClasses("secondary", "sm", "w-11 px-0")}
              disabled={month >= lastDay.slice(0, 7)}
              onClick={() => setViewMonth(shiftMonth(month, 1))}
              aria-label="Next month"
            >
              <span aria-hidden>›</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                aria-hidden
                className="pb-2 text-caption font-semibold uppercase tracking-[0.06em] text-text-tertiary"
              >
                {d}
              </span>
            ))}
            {monthDays(month).map((d, i) =>
              d ? (
                <button
                  key={d}
                  type="button"
                  disabled={closed(d)}
                  aria-pressed={d === date}
                  aria-label={`${formatDateLong(d)}${closed(d) ? ", unavailable" : ""}${d === today ? ", today" : ""}`}
                  onClick={() => onPickDate(d)}
                  className={cn(
                    "flex aspect-square min-h-11 items-center justify-center rounded-sm border border-transparent text-body font-semibold tabular-nums text-text transition-[background-color,border-color] duration-fast ease-out hover:border-brand-border-hover focus-visible:shadow-focus disabled:border-transparent disabled:text-text-disabled disabled:line-through aria-pressed:border-brand aria-pressed:bg-primary aria-pressed:text-text",
                    d === today && "border-border-strong",
                  )}
                >
                  {Number(d.slice(8))}
                </button>
              ) : (
                <span key={`pad-${i}`} aria-hidden />
              ),
            )}
          </div>
        </div>

        <div aria-live="polite" aria-busy={slots.status !== "ready"}>
          {slots.status !== "ready" ? (
            <>
              <p className="sr-only">Loading times…</p>
              <div aria-hidden className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className="h-12 animate-pulse rounded-sm bg-surface-3" />
                ))}
              </div>
            </>
          ) : null}

          {slots.status === "ready" && !date ? (
            <p className="text-body text-text-secondary">Pick a day to see open times.</p>
          ) : null}

          {slots.status === "ready" && date ? (
            <>
              <p className="font-sans text-body-lg font-bold">{formatDateLong(date)}</p>
              <p className="mb-4 text-body-sm text-text-tertiary">Eastern Time</p>
              {daySlots.length === 0 ? (
                <p className="rounded-md border border-border bg-surface-2 px-4 py-5 text-body text-text-secondary">
                  No openings that day — try another date.
                </p>
              ) : (
                <ul
                  className="grid grid-cols-3 gap-2"
                  aria-label={`Times on ${formatDateLong(date)}`}
                >
                  {daySlots.map((s) => (
                    <li key={s.start}>
                      <button
                        type="button"
                        disabled={!s.available}
                        aria-pressed={s.start === slotStart}
                        aria-label={`${formatSlotTime(s.start)}${s.available ? "" : ", taken"}`}
                        onClick={() => onPickSlot(s.start)}
                        className="flex h-12 w-full items-center justify-center rounded-sm border border-border bg-surface-2 text-body-sm font-bold tabular-nums text-text transition-[background-color,border-color] duration-fast ease-out hover:border-brand-border-hover focus-visible:shadow-focus disabled:border-border-subtle disabled:bg-transparent disabled:text-text-disabled disabled:line-through aria-pressed:border-brand aria-pressed:bg-primary"
                      >
                        {formatSlotTime(s.start)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}

          {slots.status === "ready" ? (
            <p className="mt-4 text-body-sm text-text-secondary">
              Can&apos;t find a time that works?{" "}
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex min-h-11 items-center rounded-sm text-primary-text underline underline-offset-4 focus-visible:shadow-focus"
              >
                Skip this and we&apos;ll call you.
              </button>
            </p>
          ) : null}
        </div>
      </div>

      {error && !slotStart ? (
        <div className="mt-6">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      {slotStart && date ? (
        <div className="mt-10 grid gap-4 border-t border-border pt-8">
          <p className="text-body-lg">
            <span className="text-text-secondary">Your appointment: </span>
            <strong>
              {formatDateLong(date)} at {formatSlotTime(slotStart)} ET
            </strong>
          </p>
          <div>
            <button type="button" className={continueClass} onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

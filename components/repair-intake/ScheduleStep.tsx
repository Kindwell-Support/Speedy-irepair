"use client";

import { useState } from "react";
import { Notice } from "@/components/ui/Notice";
import { buttonClasses } from "@/components/ui/ButtonLink";
import type { Slot } from "@/lib/repair-schemas";
import { BOOKING_WINDOW_DAYS, addDaysISO, formatDateLong, formatSlotTime, weekdayOf } from "@/lib/repair-time";
import { cn } from "@/lib/utils/cn";
import { StepHeading, continueClass } from "./ui";

export type SlotsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; slots: Slot[] };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00Z`));

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

function monthDays(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = weekdayOf(`${month}-01`);
  return [...Array<null>(lead).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
}

/**
 * Step 6. A plain month grid (no date-picker dependency) and the day's slots from /api/repair/slots, fetched by
 * the wrapper when a day is clicked. Sundays, past days, days beyond the booking window and days already found
 * full are disabled. Every time is shop time (Eastern), whatever the visitor's own clock says.
 */
export function ScheduleStep({
  today,
  date,
  slotStart,
  slots,
  emptyDates,
  booking,
  onPickDate,
  onPickSlot,
  onBook,
}: {
  today: string;
  date: string | null;
  slotStart: string | null;
  slots: SlotsState;
  emptyDates: ReadonlySet<string>;
  booking: { pending: boolean; error?: string };
  onPickDate: (date: string) => void;
  onPickSlot: (start: string) => void;
  onBook: () => void;
}) {
  // Follows the selected day until the visitor pages through months themselves.
  const [viewMonth, setViewMonth] = useState<string>();
  const month = viewMonth ?? (date ?? today).slice(0, 7);
  const lastDay = addDaysISO(today, BOOKING_WINDOW_DAYS);
  const closed = (d: string) => d < today || d > lastDay || weekdayOf(d) === 0 || emptyDates.has(d);
  const open = slots.status === "ready" ? slots.slots.filter((s) => s.available) : [];

  return (
    <>
      <StepHeading title="Pick a time" intro="Most repairs are done in 45 minutes while you wait. All times are Eastern Time." />
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
              <span key={d} aria-hidden className="pb-2 text-caption font-semibold uppercase tracking-[0.06em] text-text-tertiary">
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

        <div aria-live="polite" aria-busy={slots.status === "loading"}>
          {slots.status === "idle" ? <p className="text-body text-text-secondary">Pick a day to see open times.</p> : null}

          {slots.status === "loading" ? (
            <>
              <p className="sr-only">Loading times…</p>
              <div aria-hidden className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className="h-12 animate-pulse rounded-sm bg-surface-3" />
                ))}
              </div>
            </>
          ) : null}

          {slots.status === "error" ? (
            <div className="grid gap-4">
              <Notice tone="error">{slots.message}</Notice>
              {date ? (
                <div>
                  <button type="button" className={buttonClasses("secondary", "md")} onClick={() => onPickDate(date)}>
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {slots.status === "ready" && date ? (
            <>
              <p className="font-sans text-body-lg font-bold">{formatDateLong(date)}</p>
              <p className="mb-4 text-body-sm text-text-tertiary">Eastern Time</p>
              {open.length === 0 ? (
                <p className="rounded-md border border-border bg-surface-2 px-4 py-5 text-body text-text-secondary">No openings that day — try another date.</p>
              ) : (
                <ul className="grid grid-cols-3 gap-2" aria-label={`Times on ${formatDateLong(date)}`}>
                  {slots.slots.map((s) => (
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
        </div>
      </div>

      {slotStart && date ? (
        <div className="mt-10 grid gap-4 border-t border-border pt-8">
          <p className="text-body-lg">
            <span className="text-text-secondary">Your appointment: </span>
            <strong>
              {formatDateLong(date)} at {formatSlotTime(slotStart)} ET
            </strong>
          </p>
          {booking.error ? <Notice tone="error">{booking.error}</Notice> : null}
          <div>
            <button type="button" className={continueClass} disabled={booking.pending} aria-busy={booking.pending} onClick={onBook}>
              {booking.pending ? "Booking…" : "Book this time"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

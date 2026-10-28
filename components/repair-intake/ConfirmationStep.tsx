"use client";

import { buttonClasses } from "@/components/ui/ButtonLink";
import type { BookingResult } from "@/lib/repair-schemas";
import { formatDateLong, formatSlotTime, shopDateISO } from "@/lib/repair-time";
import { telHref } from "@/lib/utils/format";
import { StepHeading } from "./ui";

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
}

export interface WhatToBring {
  heading: string;
  intro?: string | null;
}

/** Google Calendar wants UTC stamps like 20261102T150000Z. */
const gcalStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function googleCalendarUrl(booking: BookingResult, title: string, shop: ShopInfo): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${gcalStamp(booking.start)}/${gcalStamp(booking.end)}`,
    details: `Booking ${booking.bookingId}. Questions? Call ${shop.phone}.`,
    location: `${shop.name}, ${shop.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Step 7. Booked: summary, calendar link, what to bring, and where the shop is. */
export function ConfirmationStep({
  booking,
  summary,
  calendarTitle,
  shop,
  whatToBring,
  onRestart,
}: {
  booking: BookingResult;
  summary: { label: string; value: string }[];
  calendarTitle: string;
  shop: ShopInfo;
  whatToBring: WhatToBring;
  onRestart: () => void;
}) {
  const day = shopDateISO(new Date(booking.start));
  const when = `${formatDateLong(day)} at ${formatSlotTime(booking.start)}`;
  return (
    <>
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success" aria-hidden>
        <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      </span>
      <StepHeading title="You're booked" intro={`See you ${when} Eastern Time. We've saved your details, so just walk up to the counter.`} />

      <dl className="grid gap-x-6 gap-y-4 rounded-md border border-border bg-surface-2 p-5 sm:grid-cols-[auto_1fr] md:p-6">
        <dt className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">When</dt>
        <dd className="text-body-lg font-bold">{when} ET</dd>
        {summary.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">{row.label}</dt>
            <dd className="break-words text-body">{row.value}</dd>
          </div>
        ))}
        <dt className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">Reference</dt>
        <dd className="break-all text-body-sm text-text-secondary">{booking.bookingId}</dd>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href={googleCalendarUrl(booking, calendarTitle, shop)} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
          Add to Google Calendar
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <button type="button" onClick={onRestart} className={buttonClasses("secondary", "lg")}>
          Book another repair
        </button>
      </div>

      <div className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-2">
        <section aria-labelledby="repair-bring-heading">
          <h3 id="repair-bring-heading" className="font-sans text-h5 font-bold">
            {whatToBring.heading}
          </h3>
          {whatToBring.intro ? <p className="mt-3 text-body text-text-secondary">{whatToBring.intro}</p> : null}
        </section>
        <section aria-labelledby="repair-where-heading">
          <h3 id="repair-where-heading" className="font-sans text-h5 font-bold">
            Where to find us
          </h3>
          <address className="mt-3 not-italic text-body text-text-secondary">
            {shop.name}
            <br />
            {shop.address}
          </address>
          <a href={telHref(shop.phone)} className="mt-3 inline-flex min-h-12 items-center font-heading text-h5 font-black tabular-nums hover:text-primary-text">
            {shop.phone}
          </a>
        </section>
      </div>
    </>
  );
}

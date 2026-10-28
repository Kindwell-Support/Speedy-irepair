/**
 * Date and time helpers for repair booking. Every appointment is in the shop's time zone, whatever the visitor's
 * own clock says. Client-safe (no server imports), shared by the widget and lib/booking.
 */
export const SHOP_TIME_ZONE = "America/New_York";
/** How far ahead the date picker lets you book. */
export const BOOKING_WINDOW_DAYS = 60;

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

function zonedParts(at: Date, timeZone = SHOP_TIME_ZONE): Record<string, number> {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(fmt.formatToParts(at).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Real calendar date in YYYY-MM-DD form (rejects 2026-02-31). */
export function isDateISO(value: string): boolean {
  if (!DATE_ISO.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Today (or the day of `at`) as the shop sees it. */
export function shopDateISO(at: Date = new Date()): string {
  const p = zonedParts(at);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (dateISO: string): number => new Date(`${dateISO}T12:00:00Z`).getUTCDay();

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The UTC instant of a wall-clock time ("14:30") on a date in the shop's time zone, DST-aware. */
export function shopTimeToUtc(dateISO: string, hhmm: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min);
  const offsetAt = (t: number) => {
    const p = zonedParts(new Date(t));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - t;
  };
  const first = wall - offsetAt(wall);
  return new Date(wall - offsetAt(first));
}

/** "10:45 AM", in shop time. */
export const formatSlotTime = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

/** "Monday, November 2", for a YYYY-MM-DD date. */
export const formatDateLong = (dateISO: string): string =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${dateISO}T12:00:00Z`));

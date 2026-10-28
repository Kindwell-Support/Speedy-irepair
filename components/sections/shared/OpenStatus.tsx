"use client";

import { useEffect, useState } from "react";
import type { BusinessInfo } from "@/lib/sanity/types";
import { to12h } from "@/components/sections/global/HoursList";
import { cn } from "@/lib/utils/cn";

const TIME_ZONE = "America/New_York";
/** Most repairs take 45 minutes, so the last same-day walk-in is this long before closing. */
const REPAIR_MINUTES = 45;

const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

/** The shop's local weekday and minutes past midnight, whatever the visitor's own time zone. */
function shopNow() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: get("weekday"), mins: Number(get("hour")) * 60 + Number(get("minute")) };
}

function status(business: BusinessInfo): { open: boolean; text: string } | null {
  const hours = business.hours;
  const { day, mins } = shopNow();
  const today = hours.findIndex((h) => h.day === day);
  if (today < 0) return null;
  const t = hours[today]!;
  if (!t.closed && t.opens && t.closes) {
    const opens = minutes(t.opens);
    const closes = minutes(t.closes);
    const lastWalkIn = closes - REPAIR_MINUTES;
    if (mins >= opens && mins < lastWalkIn)
      return { open: true, text: `Open now · walk in by ${to12h(hhmm(lastWalkIn))} and leave with it today` };
    if (mins >= opens && mins < closes) return { open: true, text: `Open until ${to12h(t.closes)} today` };
    if (mins < opens) return { open: false, text: `Opens today at ${to12h(t.opens)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = hours[(today + i) % hours.length]!;
    if (!next.closed && next.opens) return { open: false, text: `Opens ${i === 1 ? "tomorrow" : next.day} at ${to12h(next.opens)}` };
  }
  return null;
}

/**
 * Live open/closed line for the shop, worked out in Akron's time zone and refreshed each minute.
 * Renders nothing on the server (the answer depends on the visitor's clock) or while hours are a placeholder.
 */
export function OpenStatus({ business, className }: { business: BusinessInfo; className?: string }) {
  const [state, setState] = useState<ReturnType<typeof status>>(null);
  useEffect(() => {
    if (business.hoursIsPlaceholder) return;
    const tick = () => setState(status(business));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [business]);
  if (!state) return null;
  return (
    <p className={cn("flex items-center gap-3 text-body-lg font-semibold text-text", className)}>
      <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", state.open ? "bg-success" : "bg-text-tertiary")} />
      {state.text}
    </p>
  );
}

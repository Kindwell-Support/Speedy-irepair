import type { EmbedCopy, EmbedKind } from "../types";

/** Design: schedule-repair.html Frame 1–3 (bar caption, fallback alert + "Open booking in a new tab" / "Call us"). */
export const embedCopy: Record<EmbedKind, EmbedCopy> = {
  square: {
    title: "Book a repair appointment with Speedy iRepair (Square)",
    barLabel: "Book an appointment · powered by Square",
    loadLabel: "Load booking calendar",
    description: "Booking is provided by Square. Loading it sets Square cookies.",
    directLabel: "Open booking in a new tab",
    fallbackTitle: "The booking calendar did not load.",
    fallbackBody: "Book on Square in a new tab or call {phone}.",
    callLabel: "Call us",
    loadingLabel: "Loading the booking calendar",
  },
  jotform: {
    title: "Home Internet sign-up form (Jotform)",
    barLabel: "Home Internet sign-up · powered by Jotform",
    loadLabel: "Load sign-up form",
    directLabel: "Open the sign-up form in a new tab",
    fallbackTitle: "The sign-up form did not load.",
    fallbackBody: "Open the form in a new tab or call {phone}.",
    callLabel: "Call us",
    loadingLabel: "Loading the sign-up form",
  },
  map: {
    title: "Map: Speedy iRepair",
    loadLabel: "Show map",
    directLabel: "Open in Google Maps",
    fallbackTitle: "The map did not load.",
    fallbackBody: "Open it in Google Maps instead.",
    loadingLabel: "Loading the map",
  },
};

"use client";
import { useState } from "react";
import { MultiStepForm, useMultiStep } from "@/components/motion/MultiStepForm";
import { RiveButton, type ButtonState } from "@/components/rive/RiveButton";

/** Lead capture only: device > model > issue > contact. No prices (DECISIONS #5). */
const opts = (xs: string[]) => (
  <div className="mt-6 grid grid-cols-2 gap-3">
    {xs.map((x) => (
      <label key={x} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-4 has-[:checked]:border-brand has-[:checked]:bg-primary-tint">
        <input type="radio" name="opt" className="accent-[var(--color-brand)]" /> {x}
      </label>
    ))}
  </div>
);

export function QuoteDemo() {
  const ms = useMultiStep(4);
  const [state, setState] = useState<ButtonState>("idle");
  const steps = [
    { id: "device", title: "Which device?", content: opts(["iPhone", "Samsung", "Google Pixel", "Other"]) },
    { id: "model", title: "Which model?", content: opts(["iPhone 16", "iPhone 15", "iPhone 14", "Older"]) },
    { id: "issue", title: "What's wrong?", content: opts(["Cracked screen", "Battery", "Charging port", "Other"]) },
    {
      id: "contact",
      title: "How do we reach you?",
      content: (
        <div className="mt-6 grid gap-3">
          <input aria-label="Name" placeholder="Name" className="h-control-md rounded-md border border-border bg-surface-2 px-4" />
          <input aria-label="Phone" placeholder="Phone" className="h-control-md rounded-md border border-border bg-surface-2 px-4" />
        </div>
      ),
    },
  ];
  return (
    <MultiStepForm
      label="Instant repair quote"
      steps={steps}
      index={ms.index}
      direction={ms.direction}
      className="flex flex-col gap-8"
      footer={
        <div className="flex gap-4">
          <button type="button" onClick={ms.back} disabled={ms.isFirst} className="h-control-md rounded-md border border-border px-6 disabled:opacity-40">
            Back
          </button>
          {ms.isLast ? (
            <RiveButton
              type="button"
              state={state}
              className="h-control-md rounded-md bg-primary px-6 font-semibold text-text"
              onClick={() => {
                setState("loading");
                setTimeout(() => setState("success"), 1400);
              }}
            >
              Get my quote
            </RiveButton>
          ) : (
            <RiveButton type="button" className="h-control-md rounded-md bg-primary px-6 font-semibold text-text" onClick={ms.next}>
              Next
            </RiveButton>
          )}
        </div>
      }
    />
  );
}

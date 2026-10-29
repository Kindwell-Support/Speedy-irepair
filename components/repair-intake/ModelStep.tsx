"use client";

import { OTHER, modelsFor, type Device } from "@/lib/repair-catalog";
import { ChoiceList, StepHeading } from "./ui";

/** Step 4. Models for the chosen brand, newest first; "Other / not listed" asks for the model in words. */
export function ModelStep({
  device,
  brand,
  brandLabel,
  value,
  otherValue,
  onChoose,
}: {
  device: Device;
  brand: string;
  /** The brand as the visitor sees it (their own words when they typed one). */
  brandLabel: string;
  value: string | null;
  otherValue: string;
  onChoose: (model: string, otherText: string) => void;
}) {
  const models = modelsFor(device, brand);
  return (
    <>
      <StepHeading
        title="Which model?"
        intro={models.length === 1 ? `Which ${brandLabel} ${device.toLowerCase()} is it?` : "Not sure? Pick “Other / not listed” and describe it."}
      />
      <ChoiceList
        id="repair-model"
        options={models}
        value={value}
        otherOption={OTHER}
        otherValue={otherValue}
        otherLabel="Model"
        otherPlaceholder="e.g. the name on the box or in Settings"
        otherError="Tell us the model"
        gridClassName="sm:grid-cols-2 md:grid-cols-3"
        onChoose={onChoose}
      />
    </>
  );
}

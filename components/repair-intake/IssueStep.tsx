"use client";

import { ISSUE_OTHER, issuesFor, type Device } from "@/lib/repair-catalog";
import { ChoiceList, StepHeading } from "./ui";

/** Step 5. What's wrong; the list depends on the device (consoles swap Battery for HDMI Port) and, for consoles, the brand. */
export function IssueStep({
  device,
  brand,
  value,
  details,
  onChoose,
}: {
  device: Device;
  brand: string;
  value: string | null;
  details: string;
  onChoose: (issue: string, details: string) => void;
}) {
  return (
    <>
      <StepHeading title="What's wrong with it?" intro="Pick the main problem. We'll check everything else when you come in." />
      <ChoiceList
        id="repair-issue"
        options={issuesFor(device, brand)}
        value={value}
        otherOption={ISSUE_OTHER}
        otherValue={details}
        otherLabel="What's wrong?"
        otherPlaceholder="e.g. camera won't focus"
        otherError="Tell us what's wrong"
        onChoose={onChoose}
      />
    </>
  );
}

"use client";

import { ISSUE_OTHER, issuesFor, type Device } from "@/lib/repair-catalog";
import { ChoiceList, StepHeading } from "./ui";

/** Step 4. What's wrong; the list depends on the device (consoles swap Battery for HDMI Port). */
export function IssueStep({
  device,
  value,
  details,
  onChoose,
}: {
  device: Device;
  value: string | null;
  details: string;
  onChoose: (issue: string, details: string) => void;
}) {
  return (
    <>
      <StepHeading title="What's wrong with it?" intro="Pick the main problem. We'll check everything else when you come in." />
      <ChoiceList
        id="repair-issue"
        options={issuesFor(device)}
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

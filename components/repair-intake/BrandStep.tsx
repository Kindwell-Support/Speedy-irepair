"use client";

import { OTHER, brandsFor, type Device } from "@/lib/repair-catalog";
import { ChoiceList, StepHeading } from "./ui";

/** Step 3. Brands for the chosen device; "Other / not listed" asks for the brand in words. */
export function BrandStep({
  device,
  value,
  otherValue,
  onChoose,
}: {
  device: Device;
  value: string | null;
  otherValue: string;
  onChoose: (brand: string, otherText: string) => void;
}) {
  const brands = brandsFor(device);
  return (
    <>
      <StepHeading title="Which brand?" intro={brands.length === 1 ? "Tell us who makes it." : undefined} />
      <ChoiceList
        id="repair-brand"
        options={brands}
        value={value}
        otherOption={OTHER}
        otherValue={otherValue}
        otherLabel="Brand"
        otherPlaceholder="e.g. OnePlus"
        otherError="Tell us the brand"
        onChoose={onChoose}
      />
    </>
  );
}

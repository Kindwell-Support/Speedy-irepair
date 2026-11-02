"use client";

import { DEVICES, type Device } from "@/lib/repair-catalog";
import { DeviceTiles } from "./DeviceTiles";
import { StepHeading } from "./ui";

const PHOTOS: Record<Device, string> = {
  Phone: "/images/devices/phone.webp",
  Tablet: "/images/devices/tablet.webp",
  Laptop: "/images/devices/laptop.webp",
  "Game Console": "/images/devices/console.webp",
  Other: "/images/devices/other.webp",
};

/** Step 1. Picking a device moves straight on. */
export function DeviceStep({ value, onChoose }: { value: Device | null; onChoose: (device: Device) => void }) {
  return (
    <>
      <StepHeading title="What needs fixing?" intro="Pick your device and we'll walk you through booking a time at the shop." />
      <DeviceTiles devices={DEVICES} value={value} onChoose={onChoose} photos={PHOTOS} />
    </>
  );
}

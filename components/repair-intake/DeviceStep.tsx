"use client";

import type { ReactNode } from "react";
import { DEVICES, type Device } from "@/lib/repair-catalog";
import { StepHeading, optionClass } from "./ui";

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-primary-text" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

const ICONS: Record<Device, ReactNode> = {
  Phone: icon(
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>,
  ),
  Tablet: icon(
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M11 18h2" />
    </>,
  ),
  Laptop: icon(
    <>
      <rect x="4" y="4" width="16" height="11" rx="1" />
      <path d="M2 19h20" />
    </>,
  ),
  "Game Console": icon(
    <>
      <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" />
      <path d="M17.3 6H6.7a4 4 0 0 0-4 3.6C2.6 10.4 2 15.5 2 17a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.4-1.4A2 2 0 0 1 9.8 17h4.4a2 2 0 0 1 1.4.6L17 19c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.5-.6-6.6-.7-7.3a4 4 0 0 0-4-3.7z" />
    </>,
  ),
  Other: icon(<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z" />),
};

/** Step 1. Picking a device moves straight on. */
export function DeviceStep({ value, onChoose }: { value: Device | null; onChoose: (device: Device) => void }) {
  return (
    <>
      <StepHeading title="What needs fixing?" intro="Pick your device and we'll walk you through booking a time at the shop." />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {DEVICES.map((device) => (
          <li key={device}>
            <button type="button" aria-pressed={value === device} className={`${optionClass} h-full flex-col items-start md:min-h-24`} onClick={() => onChoose(device)}>
              {ICONS[device]}
              {device}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

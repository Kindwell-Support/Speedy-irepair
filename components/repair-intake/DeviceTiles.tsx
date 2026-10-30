"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { Device } from "@/lib/repair-catalog";
import type { TradeInDevice } from "@/lib/trade-in-catalog";
import { cn } from "@/lib/utils/cn";
import { optionClass } from "./ui";

type DeviceKind = Device | TradeInDevice;

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-12 w-12 shrink-0 text-primary-text md:h-14 md:w-14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

const ICONS: Record<DeviceKind, ReactNode> = {
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
  Smartwatch: icon(
    <>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2l1.5 1.5" />
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

/**
 * Photo per device, in public/images/devices (a cut-out on a transparent background reads best on the tile).
 * A device without one shows its line icon.
 */
const PHOTOS: Partial<Record<DeviceKind, string>> = {};

/** The device cards that open the repair and trade-in flows: picture on top, name below. Picking one moves straight on. */
export function DeviceTiles<T extends DeviceKind>({
  devices,
  value,
  onChoose,
}: {
  devices: readonly T[];
  value: T | null;
  onChoose: (device: T) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {devices.map((device) => {
        const photo = PHOTOS[device];
        return (
          <li key={device}>
            <button
              type="button"
              aria-pressed={value === device}
              className={cn(optionClass, "h-full min-h-36 flex-col justify-center gap-3 text-center md:min-h-44")}
              onClick={() => onChoose(device)}
            >
              {photo ? (
                <span className="relative block h-20 w-full md:h-24">
                  <Image src={photo} alt="" fill sizes="(min-width: 768px) 200px, 40vw" className="object-contain" />
                </span>
              ) : (
                ICONS[device]
              )}
              {device}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import Image from "next/image";
import type { Device } from "@/lib/repair-catalog";
import { modelImage } from "@/lib/model-images";
import { cn } from "@/lib/utils/cn";
import { DEVICE_ICONS } from "./DeviceTiles";

/**
 * "Your device" strip shown after the model step: the model's photo (or the device icon when there's none), its name
 * and, while the request can still change, a link back to the model step.
 */
export function ModelSummary({
  device,
  model,
  label,
  onChange,
  className,
}: {
  device: Device;
  model: string | null;
  /** Brand and model as the visitor sees them. */
  label: string;
  onChange?: () => void;
  className?: string;
}) {
  const image = modelImage(device, model);
  return (
    <div className={cn("flex items-center gap-4 rounded-md border border-border bg-surface-2 p-3 pr-4", className)}>
      <span
        className={cn(
          "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm",
          image ? "bg-white p-1" : "bg-surface-3 [&>svg]:h-9 [&>svg]:w-9",
        )}
      >
        {image ? (
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt=""
            sizes="64px"
            className="h-full w-full object-contain"
          />
        ) : (
          DEVICE_ICONS[device]
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">Your device</p>
        {/* Wraps rather than truncating: nowrap text would widen the widget's grid column on phones. */}
        <p className="break-words text-body-lg font-bold">{label}</p>
      </div>
      {onChange ? (
        <button
          type="button"
          onClick={onChange}
          aria-label={`Change device (${label})`}
          className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-sm px-2 text-body-sm font-bold uppercase tracking-[0.06em] text-primary-text transition-colors duration-fast hover:text-text focus-visible:shadow-focus"
        >
          Change
        </button>
      ) : null}
    </div>
  );
}

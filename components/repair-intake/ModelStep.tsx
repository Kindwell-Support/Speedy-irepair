"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { modelImage } from "@/lib/model-images";
import { OTHER, modelsFor, type Device } from "@/lib/repair-catalog";
import { ChoiceList, StepHeading } from "./ui";

const b = (text: string) => <strong className="font-bold text-text">{text}</strong>;

/** Where each phone brand shows its model name. Brands not listed get the generic iPhone / Android line. */
const FIND_MODEL: Record<string, ReactNode> = {
  Apple: (
    <>
      Open {b("Settings → General → About")}. Your model is next to {b("Model Name")}.
    </>
  ),
  Samsung: (
    <>
      Open {b("Settings → About phone")}. The model name is at the top of the screen, e.g. Galaxy S24 Ultra.
    </>
  ),
  Google: (
    <>
      Open {b("Settings → About phone")}. Your model is listed under {b("Model")}.
    </>
  ),
  Motorola: (
    <>
      Open {b("Settings → About phone")}. Your model is listed under {b("Model")}.
    </>
  ),
  LG: (
    <>
      Open {b("Settings → About phone")} (on some models {b("Settings → General → About phone")}). Look for{" "}
      {b("Model name")}.
    </>
  ),
};
/** Screenshot of each brand's Settings screen with the model highlighted, shown under the FIND_MODEL line. */
const FIND_MODEL_SHOT: Record<string, { src: string; width: number; height: number; maxW: string }> = {
  Apple: { src: "/images/find-model/apple.webp", width: 1200, height: 859, maxW: "max-w-full" },
  Samsung: { src: "/images/find-model/samsung.webp", width: 1200, height: 1467, maxW: "max-w-[360px]" },
  Google: { src: "/images/find-model/google.webp", width: 350, height: 720, maxW: "max-w-[200px]" },
  Motorola: { src: "/images/find-model/motorola.webp", width: 594, height: 1267, maxW: "max-w-[200px]" },
  LG: { src: "/images/find-model/lg.webp", width: 720, height: 1240, maxW: "max-w-[220px]" },
};
const FIND_MODEL_OTHER = (
  <>
    On an iPhone, open {b("Settings → General → About")}. On Android, open {b("Settings → About phone")}. Look for
    the model name.
  </>
);

/** What the photo check calls the device: "Is this your tablet?" */
const NOUN: Record<Device, string> = {
  Phone: "phone",
  Tablet: "tablet",
  Laptop: "laptop",
  "Game Console": "console",
  Other: "device",
};

/** Where to find the exact model name, shown beside the photo because look-alikes are common. */
function modelHint(device: Device, brand: string): ReactNode {
  if (device === "Phone") return FIND_MODEL[brand] ?? FIND_MODEL_OTHER;
  if (device === "Tablet") {
    return brand === "Samsung" ? (
      <>
        Open {b("Settings → About tablet")}. The model name is at the top of the screen.
      </>
    ) : (
      FIND_MODEL.Apple
    );
  }
  if (device === "Laptop") {
    return brand === "Apple" ? (
      <>
        Click the {b("Apple menu → About This Mac")}. The model is shown at the top, e.g. MacBook Air 13-inch.
      </>
    ) : (
      <>
        On Windows, open {b("Settings → System → About")}. The model is also on the sticker underneath the laptop.
      </>
    );
  }
  return <>The model is printed on the label on the back or underneath the console.</>;
}

/** Collapsed help under the heading for visitors who don't know which phone they have. */
function FindModelHelp({ brand, hasList }: { brand: string; hasList: boolean }) {
  const shot = FIND_MODEL_SHOT[brand];
  return (
    <details className="group mb-6 rounded-md border border-border bg-surface-2 [&>summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md px-5 py-3 text-body font-bold transition-colors duration-fast hover:text-primary-text focus-visible:shadow-focus">
        How do I find my model?
        <span
          aria-hidden
          className="text-h5 leading-none text-primary-text transition-transform duration-fast group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="grid max-w-[64ch] gap-3 border-t border-border px-5 py-4 text-body text-text-secondary">
        <p>{FIND_MODEL[brand] ?? FIND_MODEL_OTHER}</p>
        {shot ? (
          <Image
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={`${brand} Settings screen with the model highlighted`}
            sizes="(max-width: 640px) 90vw, 560px"
            className={`h-auto w-full ${shot.maxW} rounded-md border border-border`}
          />
        ) : null}
        {hasList ? (
          <p>Some models look almost the same in photos, so Settings is the surest way to tell them apart.</p>
        ) : null}
        <p>
          Phone won&apos;t turn on? The model is usually on the box or your carrier account. Or pick{" "}
          {b(`“${OTHER}”`)} and we&apos;ll identify it at the shop.
        </p>
      </div>
    </details>
  );
}

/**
 * Step 4. Models for the chosen brand, newest first; "Other / not listed" asks for the model in words. A model with a
 * photo (lib/model-images.ts) asks "Is this your phone/tablet/laptop/console?" before moving on, as a visual check plus the Settings path
 * for look-alike models.
 */
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
  const [checking, setChecking] = useState<string | null>(null);
  const image = modelImage(device, checking);
  const rootRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  // Swapping between the list and the photo moves focus to the new heading, like a step change does.
  useEffect(() => {
    if (!movedRef.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [checking]);

  const show = (model: string | null) => {
    movedRef.current = true;
    setChecking(model);
  };

  return (
    <div ref={rootRef} className="scroll-mt-32">
      {checking && image ? (
        <>
          <StepHeading
            title={`Is this your ${NOUN[device]}?`}
            intro="Does it look like yours? The color doesn't matter."
          />
          <div className="grid gap-6 rounded-md border border-border bg-surface-2 p-4 md:grid-cols-2 md:items-center md:gap-8 md:p-6">
            <div className="flex items-center justify-center rounded-sm bg-white p-4 md:p-6">
              <Image
                src={image.src}
                width={image.width}
                height={image.height}
                alt={checking}
                sizes="(min-width: 768px) 420px, 90vw"
                priority
                className="h-auto max-h-64 w-auto max-w-full object-contain md:max-h-80"
              />
            </div>
            <div>
              <p className="text-body-sm font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                {brandLabel}
              </p>
              <p className="mt-1 font-heading text-h4 font-black uppercase">{checking}</p>
              {/* Photos can't separate look-alikes (15 Pro / 16 Pro, Pro / Pro Max), so point to the exact name. */}
              <p className="mt-3 text-body-sm text-text-secondary">
                Some models look almost the same. To be sure: {modelHint(device, brand)}
              </p>
              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  className={buttonClasses("primary", "lg", "w-full px-5 lg:px-8")}
                  onClick={() => onChoose(checking, "")}
                >
                  Yes, that&apos;s my {NOUN[device]}
                </button>
                <button
                  type="button"
                  className={buttonClasses("secondary", "lg", "w-full px-5 lg:px-8")}
                  onClick={() => show(null)}
                >
                  Pick a different model
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <StepHeading
            title="Which model?"
            intro={
              models.length === 1
                ? `Which ${brandLabel} ${device.toLowerCase()} is it?`
                : models.some((m) => modelImage(device, m))
                  ? "Tap yours and we'll show a photo so you can check it's the right one."
                  : "Not sure? Pick “Other / not listed” and describe it."
            }
          />
          {device === "Phone" ? <FindModelHelp brand={brand} hasList={models.length > 1} /> : null}
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
            onChoose={(model, otherText) =>
              model !== OTHER && modelImage(device, model) ? show(model) : onChoose(model, otherText)
            }
          />
        </>
      )}
    </div>
  );
}

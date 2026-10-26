"use client";

import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Notice } from "@/components/ui/Notice";
import type { LeadFlowCopy } from "@/lib/sanity/types";
import { LeadIcon } from "./LeadIcon";

/** Design .success-frame. Takes focus so screen readers hear the confirmation. QA hook: form-success. */
export function LeadFlowSuccess({
  copy,
  staging,
  stagingNote,
}: {
  copy: LeadFlowCopy["success"];
  staging: boolean;
  stagingNote: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div
      data-testid="form-success"
      role="status"
      className="grid justify-items-center gap-4 px-6 py-12 text-center"
    >
      <span className="border-success/30 grid size-16 place-items-center rounded-full border bg-success-tint text-success">
        <LeadIcon name="check" size={28} />
      </span>
      <h2 ref={ref} tabIndex={-1} className="text-h3 font-semibold text-text outline-none">
        {copy.title}
      </h2>
      <p className="max-w-[440px] text-body-sm text-text-secondary">{copy.body}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {copy.ctas.map((c) => (
          <ButtonLink key={c.href} cta={c} />
        ))}
      </div>
      {staging ? (
        <Notice tone="staging" className="mt-2 text-left">
          {stagingNote}
        </Notice>
      ) : null}
    </div>
  );
}

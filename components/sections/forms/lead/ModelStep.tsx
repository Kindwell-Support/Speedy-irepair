"use client";

import { useState } from "react";
import type { LeadFlowCopy } from "@/lib/sanity/types";
import { cn } from "@/lib/utils/cn";
import { FieldMessage } from "./FieldMessage";
import { LeadIcon } from "./LeadIcon";
import { LeadTextField } from "./LeadTextField";

/**
 * Model step. With a CMS model list: search + .model-list of 48px options + "Not sure / Other".
 * Without one (seed state, CMS contract 2.4): a free-text Model input.
 */
export function ModelStep({
  idPrefix,
  models,
  value,
  onChange,
  copy,
  error,
}: {
  idPrefix: string;
  models: string[];
  value: string;
  onChange: (v: string) => void;
  copy: LeadFlowCopy["model"];
  error?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [other, setOther] = useState(() => value !== "" && !models.includes(value));
  const inputId = `${idPrefix}-model`;
  const freeText = (
    <LeadTextField
      id={inputId}
      label={copy.inputLabel}
      placeholder={copy.placeholder}
      autoComplete="off"
      value={value}
      onValue={onChange}
      error={error ?? undefined}
    />
  );
  if (!models.length)
    return (
      <div className="grid gap-2">
        {freeText}
        <p className="text-caption text-text-tertiary">{copy.help}</p>
      </div>
    );

  const q = query.trim().toLowerCase();
  const shown = q ? models.filter((m) => m.toLowerCase().includes(q)) : models;
  const opt = (label: string, checked: boolean, onSelect: () => void) => (
    <label
      key={label}
      data-testid="form-option"
      className={cn(
        "flex h-12 cursor-pointer items-center justify-between rounded-md border bg-surface px-4 text-body-sm text-text has-[:focus-visible]:shadow-focus",
        checked
          ? "border-brand bg-primary-tint after:h-[5px] after:w-2 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-brand after:content-['']"
          : "border-border hover:border-border-strong hover:bg-surface-2",
      )}
    >
      <input
        type="radio"
        name={`${idPrefix}-model-opt`}
        checked={checked}
        onChange={onSelect}
        className="absolute opacity-0"
      />
      {label}
    </label>
  );
  return (
    <div className="grid gap-4">
      <div className="relative">
        <label htmlFor={`${idPrefix}-model-search`} className="sr-only">
          {copy.searchLabel}
        </label>
        <LeadIcon
          name="search"
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          id={`${idPrefix}-model-search`}
          type="search"
          value={query}
          placeholder={copy.searchLabel}
          onChange={(e) => setQuery(e.target.value)}
          className="h-control-md w-full rounded-md border border-border bg-surface-2 pl-11 pr-4 text-body text-text placeholder:text-text-tertiary focus-visible:border-brand focus-visible:shadow-focus"
        />
      </div>
      <fieldset className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <legend className="sr-only">{copy.inputLabel}</legend>
        {shown.map((m) =>
          opt(m, !other && value === m, () => {
            setOther(false);
            onChange(m);
          }),
        )}
        {opt(copy.notSureLabel, other, () => {
          setOther(true);
          onChange("");
        })}
      </fieldset>
      {other ? freeText : error ? <FieldMessage id={`${inputId}-msg`} message={error} /> : null}
      <p className="text-caption text-text-tertiary">{copy.help}</p>
    </div>
  );
}

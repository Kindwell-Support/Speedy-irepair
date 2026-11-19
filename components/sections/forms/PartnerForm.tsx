"use client";

import { readAttribution } from "@/lib/attribution";
import { PARTNER_DEVICE_COUNTS, type PartnerAudience } from "@/lib/forms/schemas";
import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { FormShell } from "./FormShell";
import { fieldError, SelectField, TextAreaField, TextField } from "./fields";

const ORG_LABEL: Record<PartnerAudience, string> = { business: "Business name", education: "School or program name" };

/** /business-support and /education inquiry → /api/forms/partner → GHL General Inquiries, tagged by audience. */
export function PartnerForm({ audience }: { audience: PartnerAudience }) {
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("partner");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const f = (k: string) => `${audience}-${k}`;
  return (
    <FormShell
      label={audience === "business" ? "Business support inquiry" : "Education inquiry"}
      state={state}
      honeypotProps={honeypotProps}
      onFocusCapture={markStarted}
      submitLabel="Send inquiry"
      successMessage="Thanks! We'll be in touch soon to talk about what you need."
      onSubmit={(d) => {
        const deviceCount = String(d.get(f("devices")) ?? "");
        submit({
          audience,
          organization: String(d.get(f("organization")) ?? ""),
          name: String(d.get(f("name")) ?? ""),
          email: String(d.get(f("email")) ?? ""),
          phone: String(d.get(f("phone")) ?? ""),
          deviceCount: (PARTNER_DEVICE_COUNTS as readonly string[]).includes(deviceCount)
            ? (deviceCount as (typeof PARTNER_DEVICE_COUNTS)[number])
            : undefined,
          message: String(d.get(f("message")) ?? ""),
          attribution: readAttribution(),
        });
      }}
    >
      <TextField id={f("organization")} label={ORG_LABEL[audience]} autoComplete="organization" required error={fieldError(errors, "organization")} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField id={f("name")} label="Your name" autoComplete="name" required error={fieldError(errors, "name")} />
        <TextField id={f("phone")} label="Phone" type="tel" autoComplete="tel" required error={fieldError(errors, "phone")} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField id={f("email")} label="Email" type="email" autoComplete="email" required error={fieldError(errors, "email")} />
        <SelectField
          id={f("devices")}
          label="How many devices? (optional)"
          options={PARTNER_DEVICE_COUNTS}
          error={fieldError(errors, "deviceCount")}
        />
      </div>
      <TextAreaField id={f("message")} label="What do you need help with?" required error={fieldError(errors, "message")} />
    </FormShell>
  );
}

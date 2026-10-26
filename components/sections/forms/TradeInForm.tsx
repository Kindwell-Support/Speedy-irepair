"use client";

import { useFormSubmit } from "@/lib/forms/useFormSubmit";
import { tradeInSchema, type TradeInInput } from "@/lib/forms/schemas";
import { FormShell } from "./FormShell";
import { fieldError, SelectField, TextAreaField, TextField } from "./fields";

const DEVICE_TYPES = tradeInSchema.shape.deviceType.options;
const CONDITIONS = tradeInSchema.shape.condition.options;

/** F5 Trade-in (spec 2.5, Decision #5): device type → brand → model → condition → contact. No prices. */
export function TradeInForm({ brands }: { brands: string[] }) {
  const { state, submit, markStarted, honeypotProps } = useFormSubmit("tradein");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const brandOptions = [...brands, "Other"];
  return (
    <FormShell
      testId="trade-in-form"
      label="Sell or trade in your device"
      state={state}
      honeypotProps={honeypotProps}
      onFocusCapture={markStarted}
      submitLabel="Get my offer"
      successMessage="Thanks! We'll compare trade-in prices and get back to you."
      onSubmit={(d) =>
        submit({
          deviceType: String(d.get("t-device") ?? "") as TradeInInput["deviceType"],
          brand: String(d.get("t-brand") ?? "") as TradeInInput["brand"],
          model: String(d.get("t-model") ?? ""),
          condition: String(d.get("t-condition") ?? "") as TradeInInput["condition"],
          details: String(d.get("t-details") ?? ""),
          name: String(d.get("t-name") ?? ""),
          phone: String(d.get("t-phone") ?? ""),
          email: String(d.get("t-email") ?? ""),
        })
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          id="t-device"
          label="Device type"
          options={DEVICE_TYPES}
          required
          error={fieldError(errors, "deviceType")}
        />
        <SelectField
          id="t-brand"
          label="Brand"
          options={brandOptions}
          required
          error={fieldError(errors, "brand")}
        />
        <TextField
          id="t-model"
          label="Model"
          placeholder="e.g. Galaxy S22"
          required
          error={fieldError(errors, "model")}
        />
        <SelectField
          id="t-condition"
          label="Condition"
          options={CONDITIONS}
          required
          error={fieldError(errors, "condition")}
        />
      </div>
      <TextAreaField
        id="t-details"
        label="Anything else? (optional)"
        error={fieldError(errors, "details")}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <TextField
          id="t-name"
          label="Name"
          autoComplete="name"
          required
          error={fieldError(errors, "name")}
        />
        <TextField
          id="t-phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          required
          error={fieldError(errors, "phone")}
        />
        <TextField
          id="t-email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={fieldError(errors, "email")}
        />
      </div>
    </FormShell>
  );
}

import "server-only";
import { quoteSchema, tradeInSchema } from "@/lib/forms/schemas";
import type { LeadFlowCopy, LeadOption } from "@/lib/sanity/types";

/**
 * Server-only: keeps lead-flow option lists in step with the shared zod enums, so the client
 * LeadFlow never imports zod (first-load JS) yet can only submit values the API accepts.
 */
const ENUMS = {
  quote: { device: quoteSchema.shape.deviceType.options, issue: quoteSchema.shape.issue.options },
  tradein: {
    device: tradeInSchema.shape.deviceType.options,
    brand: tradeInSchema.shape.brand.options,
    condition: tradeInSchema.shape.condition.options,
  },
} as const satisfies Record<"quote" | "tradein", Record<string, readonly string[]>>;

const keep = (opts: LeadOption[], allowed: readonly string[] | undefined) =>
  allowed ? opts.filter((o) => allowed.includes(o.key)) : opts;

export function withEnumOptions(kind: "quote" | "tradein", flow: LeadFlowCopy): LeadFlowCopy {
  const allowed: Record<string, readonly string[]> = ENUMS[kind];
  return {
    ...flow,
    options: Object.fromEntries(
      Object.entries(flow.options).map(([id, opts]) => [id, keep(opts, allowed[id])]),
    ),
  };
}

export function tradeInBrandOptions(brands: { shortName: string }[]): LeadOption[] {
  return keep(
    brands.map((b) => ({ key: b.shortName, label: b.shortName })),
    tradeInSchema.shape.brand.options,
  );
}

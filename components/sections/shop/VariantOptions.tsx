"use client";
/** Variant shape VariantOptions needs (a subset of the route's buy-box variant). */
type OptVariant = { id: string; available: boolean; options: { name: string; value: string }[] };

const valueOf = (v: OptVariant, name: string) => v.options.find((o) => o.name === name)?.value;

/**
 * Design `.opts` / `.vopt`: one pressed-button group per Shopify option (Storage, Colour…). Picking a
 * value selects the variant that keeps the other current values (or the first available one with it).
 * Values with no available variant for the current combination are disabled and marked sold out.
 */
export function VariantOptions({
  options,
  variants,
  selectedId,
  onSelect,
  soldOutLabel,
}: {
  options: { name: string; values: string[] }[];
  variants: OptVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
  soldOutLabel: string;
}) {
  const current = variants.find((v) => v.id === selectedId);
  const pick = (name: string, value: string) => {
    const want = (v: OptVariant) =>
      valueOf(v, name) === value &&
      options.every(
        (o) => o.name === name || !current || valueOf(v, o.name) === valueOf(current, o.name),
      );
    const hit =
      variants.find((v) => want(v) && v.available) ??
      variants.find((v) => valueOf(v, name) === value && v.available) ??
      variants.find(want) ??
      variants.find((v) => valueOf(v, name) === value);
    if (hit) onSelect(hit.id);
  };
  const availableFor = (name: string, value: string) =>
    variants.some((v) => v.available && valueOf(v, name) === value);

  return (
    <div className="grid gap-5">
      {options.map((o) => (
        <div key={o.name} className="grid gap-2">
          <p className="text-label text-text-secondary" id={`opt-${o.name}`}>
            {o.name}
          </p>
          <div
            role="group"
            aria-labelledby={`opt-${o.name}`}
            className="flex flex-wrap gap-2"
            data-testid="variant-options"
          >
            {o.values.map((val) => {
              const on = current ? valueOf(current, o.name) === val : false;
              const ok = availableFor(o.name, val);
              return (
                <button
                  key={val}
                  type="button"
                  aria-pressed={on}
                  disabled={!ok}
                  onClick={() => pick(o.name, val)}
                  className="inline-flex h-11 items-center rounded-full border border-border px-5 text-body-sm text-text-secondary hover:border-border-strong hover:text-text focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:text-text-disabled disabled:line-through aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-text-inverse"
                >
                  {val}
                  {ok ? null : <span className="sr-only"> ({soldOutLabel})</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

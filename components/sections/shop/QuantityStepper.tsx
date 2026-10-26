/** Design `.qty`: − / value / + pill. Controlled; labels come from CMS (pdpChrome.drawer). */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  labels,
  size = "md",
  testId,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  labels: { group: string; decrease: string; increase: string };
  size?: "md" | "lg";
  testId?: string;
}) {
  const box = size === "lg" ? "h-control-lg" : "h-10";
  const btn = size === "lg" ? "h-full w-12" : "size-10";
  const btnCls = `${btn} rounded-full text-body hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent focus-visible:shadow-focus focus-visible:outline-none`;
  return (
    <div
      role="group"
      aria-label={labels.group}
      data-testid={testId}
      className={`inline-flex ${box} items-center self-start rounded-full border border-border`}
    >
      <button
        type="button"
        aria-label={labels.decrease}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={btnCls}
      >
        −
      </button>
      <span className="min-w-8 text-center text-body-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={labels.increase}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={btnCls}
      >
        +
      </button>
    </div>
  );
}

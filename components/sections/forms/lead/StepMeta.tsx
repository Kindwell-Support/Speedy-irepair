/** Design .progress__meta: "Step 2 of 4 · Model" and the percentage. Decorative (the progressbar carries the value). */
export function StepMeta({
  counter,
  label,
  percent,
}: {
  counter: string;
  label: string;
  percent: number;
}) {
  return (
    <div
      aria-hidden
      className="mb-2 flex justify-between gap-4 text-caption tabular-nums text-text-tertiary"
    >
      <span>
        {counter} · {label}
      </span>
      <span>{percent}%</span>
    </div>
  );
}

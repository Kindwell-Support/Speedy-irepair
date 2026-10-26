/** Design `.why__num`: oversized tabular number with a small unit (CMS valueProp.stat). */
export function WhyStat({ value, label }: { value: string; label?: string | null }) {
  return (
    <span className="block text-h1 font-extrabold tabular-nums leading-none tracking-[-0.05em] text-text">
      {value}
      {label ? (
        <small className="ml-1.5 text-[0.32em] font-semibold tracking-normal text-text-secondary">
          {label}
        </small>
      ) : null}
    </span>
  );
}

import { CountUp } from "@/components/motion/CountUp";

/** Purely numeric CMS strings ("45", "90", "4.5") count up (Motion's CountUp); anything else renders as-is. */
const NUMERIC = /^\d+(?:\.(\d+))?$/;

/** Design `.why__num`: oversized tabular number with a small unit (CMS valueProp.stat). SSR shows the final value. */
export function WhyStat({ value, label }: { value: string; label?: string | null }) {
  const m = NUMERIC.exec(value.trim());
  return (
    <span className="block text-h1 font-extrabold tabular-nums leading-none tracking-[-0.05em] text-text">
      {m ? <CountUp value={Number(value)} decimals={m[1]?.length ?? 0} duration={0.48} /> : value}
      {label ? (
        <small className="ml-1.5 text-[0.32em] font-semibold tracking-normal text-text-secondary">
          {label}
        </small>
      ) : null}
    </span>
  );
}

import { cn } from "@/lib/utils/cn";
import { LeadIcon } from "./LeadIcon";

/** Design .stepper: numbered dots; done = check on surface-3, current = filled primary with white number. */
export function FlowStepper({ labels, index }: { labels: string[]; index: number }) {
  return (
    <ol className="mb-2 mt-6 flex list-none flex-wrap gap-2">
      {labels.map((label, i) => {
        const done = i < index;
        const current = i === index;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 text-body-sm",
              i > 0 &&
                "before:mr-2 before:h-px before:w-6 before:bg-border-strong before:content-['']",
              current
                ? "font-semibold text-text"
                : done
                  ? "text-text-secondary"
                  : "text-text-tertiary",
            )}
          >
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-[12px] font-semibold tabular-nums",
                current
                  ? "border-primary bg-primary text-text"
                  : done
                    ? "border-surface-3 bg-surface-3 text-text"
                    : "border-border-strong",
              )}
            >
              {done ? <LeadIcon name="check" size={12} /> : i + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

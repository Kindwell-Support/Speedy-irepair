import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Inline status notice (staging notices, form results). role=status for polite announcement. */
export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "success" | "error" | "staging";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-border bg-surface text-text-primary",
    success: "border-success bg-success-tint text-text",
    error: "border-error bg-error-tint text-text",
    staging: "border-placeholder bg-surface text-text-primary",
  } as const;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-md border px-4 py-3 text-body-sm", tones[tone], className)}>
      {children}
    </div>
  );
}

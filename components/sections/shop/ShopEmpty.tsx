import type { ReactNode } from "react";

/** Design .empty: dashed frame, centred title/body/actions (empty category or empty catalog). */
export function ShopEmpty({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      data-testid="shop-empty"
      className="grid justify-items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center"
    >
      <h3 className="text-h4">{title}</h3>
      <p className="max-w-[280px] text-body-sm text-text-secondary">{body}</p>
      {children ? <div className="flex flex-wrap justify-center gap-4">{children}</div> : null}
    </div>
  );
}

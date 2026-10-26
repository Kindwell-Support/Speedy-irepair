/** Design shop Frame 1: skeleton product card (static; data-animate="shimmer" is the Motion hook). */
export function ProductSkeleton() {
  const block = "bg-surface-2";
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-hidden="true">
      <div data-animate="shimmer" className={`aspect-square ${block}`} />
      <div className="grid gap-3 p-6">
        <div data-animate="shimmer" className={`h-3 w-2/5 rounded-full ${block}`} />
        <div data-animate="shimmer" className={`h-5 w-4/5 rounded-full ${block}`} />
        <div data-animate="shimmer" className={`h-3 w-[30%] rounded-full ${block}`} />
        <div className="mt-2 flex gap-2">
          <div data-animate="shimmer" className={`h-10 flex-1 rounded-full ${block}`} />
          <div data-animate="shimmer" className={`h-10 flex-1 rounded-full ${block}`} />
        </div>
      </div>
    </div>
  );
}

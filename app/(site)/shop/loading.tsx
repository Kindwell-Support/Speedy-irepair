/** Shop skeleton (Design HANDOFF: loading state). Same grid as ShopGrid, so swapping in has zero CLS. */
export default function ShopLoading() {
  return (
    <div className="container-site py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-surface-2" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-square animate-pulse bg-surface-2" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

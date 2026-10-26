import { ProductSkeleton } from "@/components/sections/shop/ProductSkeleton";

/** Shop loading frame (design shop Frame 1): same bar + grid as ShopBrowser, so swapping in has zero CLS. Static skeleton. */
export default function ShopLoading() {
  return (
    <div className="container-site py-12" aria-busy="true" role="status" data-testid="shop-loading">
      <span className="sr-only">Loading</span>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} data-animate="shimmer" className="h-8 w-20 rounded-full bg-surface-2" />
          ))}
        </div>
        <div data-animate="shimmer" className="h-10 w-[200px] rounded-md bg-surface-2" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

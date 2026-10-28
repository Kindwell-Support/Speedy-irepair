"use client";

/**
 * Close button for the announcement banner. Flips html[data-banner="off"] (tokens.css hides the banner, so the
 * header and hero simply move up) and remembers the choice for later visits and other pages.
 */
export function BannerDismiss({ storageKey, storageValue }: { storageKey: string; storageValue: string }) {
  const dismiss = () => {
    document.documentElement.setAttribute("data-banner", "off");
    try {
      localStorage.setItem(storageKey, storageValue);
    } catch {
      // Storage blocked (private mode): hidden for this page view only.
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss announcement"
      className="inline-flex size-8 items-center justify-center justify-self-end rounded-full text-text transition-colors duration-fast hover:bg-black/20"
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

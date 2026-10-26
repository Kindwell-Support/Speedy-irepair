"use client";
/**
 * Drawer: right-side modal sheet (e.g. the cart drawer in design/pages/shop-product.responsive-and-motion.md).
 * Motion only. The Frontend owns the content and the open state.
 *
 *  - Panel slides in from the right (x 100% -> 0) and the scrim fades. 0.25s power-out on enter,
 *    0.2s on exit. Transform + opacity only, via m.* under the global LazyMotion (no new runtime).
 *  - Reduced motion: no slide. The panel and scrim fade in 120ms.
 *  - A11y: role="dialog" + aria-modal="true", labelled by `title` (visible <h2>) or `ariaLabel`.
 *    Focus moves to `initialFocusRef` or the first focusable element in the panel. Tab / Shift+Tab are
 *    trapped. Escape and a scrim click call onClose. Focus returns to the previously focused element
 *    on close. All body children except the drawer portal are `inert` while open.
 *  - Scroll lock: Lenis is stopped (when present) and html gets data-drawer-open (overflow hidden).
 *
 * Hooks: [data-drawer][data-state="open"], [data-drawer-panel], [data-drawer-scrim], data-testid={testId}.
 */
import { AnimatePresence, m } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/motion/LenisProvider";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { DUR, FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";

export type DrawerProps = {
  open: boolean;
  /** Called on Escape, scrim click and the built-in close button. */
  onClose: () => void;
  /** Visible heading (also the accessible name). Omit it to render your own header, then pass ariaLabel. */
  title?: ReactNode;
  /** Accessible name when there is no `title`. */
  ariaLabel?: string;
  children: ReactNode;
  /** Sticky bottom area (e.g. subtotal + Checkout button). */
  footer?: ReactNode;
  /** Element to focus on open (defaults to the first focusable element in the panel). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Built-in close button label (default "Close"). Pass null to hide the button. */
  closeLabel?: string | null;
  /** Panel width classes (default "w-full max-w-[420px]"). */
  widthClassName?: string;
  /** Extra panel classes (background, padding). */
  className?: string;
  /** data-testid on the dialog panel, e.g. "cart-drawer". */
  testId?: string;
  id?: string;
};

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

const focusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

export function Drawer({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  footer,
  initialFocusRef,
  closeLabel = "Close",
  widthClassName = "w-full max-w-[420px]",
  className,
  testId,
  id,
}: DrawerProps) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Open side effects: inert background, scroll lock, Escape, focus trap, focus return.
  useEffect(() => {
    if (!open || !mounted) return;
    const portal = portalRef.current;
    returnTo.current = document.activeElement as HTMLElement | null;
    const inerted: HTMLElement[] = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === portal || !(el instanceof HTMLElement) || el.inert) return;
      el.inert = true;
      inerted.push(el);
    });
    const html = document.documentElement;
    html.setAttribute("data-drawer-open", "");
    lenis?.stop();

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      (initialFocusRef?.current ?? focusables(panel)[0] ?? panel).focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables(panel);
      if (!list.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = list[0]!;
      const last = list[list.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      inerted.forEach((el) => (el.inert = false));
      html.removeAttribute("data-drawer-open");
      lenis?.start();
      returnTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, mounted, lenis, initialFocusRef]);

  if (!mounted) return null;

  const fade = { duration: reduced ? 0.12 : DUR.page, ease: FM_EASE.out };
  const slideIn = reduced ? fade : { duration: DUR.page, ease: FM_EASE.out };
  const slideOut = reduced ? { duration: 0.12, ease: FM_EASE.out } : { duration: 0.2, ease: FM_EASE.inOut };

  return createPortal(
    <div ref={portalRef} data-drawer data-state={open ? "open" : "closed"} id={id}>
      <AnimatePresence>
        {open ? (
          <div key="drawer" className="fixed inset-0 z-[90]">
            <m.div
              data-drawer-scrim
              aria-hidden
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fade }}
              exit={{ opacity: 0, transition: slideOut }}
              onClick={() => onCloseRef.current()}
            />
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-label={title ? undefined : ariaLabel}
              tabIndex={-1}
              data-drawer-panel
              data-testid={testId}
              className={cn(
                "absolute inset-y-0 right-0 flex flex-col border-l border-border bg-bg-raised shadow-2 outline-none",
                widthClassName,
                className,
              )}
              initial={reduced ? { opacity: 0 } : { x: "100%" }}
              animate={reduced ? { opacity: 1, transition: slideIn } : { x: 0, transition: slideIn }}
              exit={reduced ? { opacity: 0, transition: slideOut } : { x: "100%", transition: slideOut }}
            >
              {title || closeLabel ? (
                <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-6 py-4">
                  {title ? (
                    <h2 id={titleId} className="text-h5">
                      {title}
                    </h2>
                  ) : (
                    <span />
                  )}
                  {closeLabel ? (
                    <button
                      type="button"
                      data-drawer-close
                      onClick={() => onCloseRef.current()}
                      className="inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-body-sm text-text-secondary hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {closeLabel}
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6" data-lenis-prevent>
                {children}
              </div>
              {footer ? <div className="border-t border-border-subtle px-6 py-4">{footer}</div> : null}
            </m.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

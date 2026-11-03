"use client";

import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils/cn";

/**
 * Phones only: a "Check my address" bar pinned to the bottom once the hero has scrolled away, hidden again
 * whenever the address form itself is on screen.
 */
export function StickyCheckBar({ target }: { target: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById(target);
    if (!form) return;
    let formVisible = true;
    let pastTop = false;
    const update = () => setShow(pastTop && !formVisible);
    const io = new IntersectionObserver(([entry]) => {
      formVisible = entry.isIntersecting;
      update();
    });
    io.observe(form);
    const onScroll = () => {
      pastTop = window.scrollY > window.innerHeight * 0.6;
      update();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [target]);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-nav landing-sticky border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-base ease-out md:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <a href={`#${target}`} tabIndex={show ? undefined : -1} className={buttonClasses("primary", "lg", "w-full")}>
        Check my address
      </a>
    </div>
  );
}

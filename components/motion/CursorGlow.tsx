"use client";
import { useEffect, useRef } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/motion/reduced-motion";

export function CursorGlow() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !fine) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, fine]);

  if (reduced || !fine) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-toast cursor-glow-spot"
    />
  );
}

"use client";
/**
 * A7 — Cursor follower (React Bits <TargetCursor>), lazy-loaded after idle.
 * Desktop fine pointer only; never on touch, never under reduced motion.
 * Snaps brackets onto interactive targets (links/buttons/[data-cursor-target]) =>
 * "what to look at". No idle spin (spinDuration 0) and native cursor kept (a11y).
 */
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/motion/reduced-motion";

const TargetCursor = dynamic(() => import("./reactbits/TargetCursor"), { ssr: false });

export function CursorFollower() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (reduced || !fine) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setIdle(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 3000 });
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(go, 1500);
    return () => clearTimeout(t);
  }, [reduced, fine]);

  if (reduced || !fine || !idle) return null;
  return (
    <TargetCursor
      targetSelector="a[href], button:not([disabled]), [data-cursor-target]"
      spinDuration={0}
      hoverDuration={0.18}
      hideDefaultCursor={false}
      cursorColor="#ffffff"
      cursorColorOnTarget="#ED1C24"
      size={28}
      cornerSize={10}
      thickness={2}
      padding={6}
      dotSize={4}
      showLabel={false}
      parallaxOn={false}
      blendMode="normal"
    />
  );
}

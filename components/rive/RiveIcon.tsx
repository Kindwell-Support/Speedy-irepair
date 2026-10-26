"use client";
/**
 * A6 / M7 — <RiveIcon>: service icon with a state machine (idle -> hover -> click).
 * Same API whether backed by a real .riv (lazy, IntersectionObserver-gated, shared WASM)
 * or by the code-driven SVG fallback (Framer Motion variants on the accent group).
 *
 * Inputs come from (in priority): controlled `hover` prop, else the closest ancestor
 * with [data-rive-host] or Design's [data-rive] (e.g. the whole service card / HoverCard), else the icon itself.
 * Reduced motion: static SVG, no Rive mount, no transitions.
 */
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolveRiveIcon, type RiveIconKey } from "./manifest";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { FM_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils/cn";
import { cssVars } from "@/lib/utils/css-vars";

const RiveCanvas = dynamic(() => import("./RiveCanvas"), { ssr: false });

type Props = {
  /** manifest id ("smartphone-repair") or Design alias from data-rive ("icon-repair") */
  id: RiveIconKey;
  size?: number;
  /** accessible label; omit when the icon is decorative next to a visible title */
  label?: string;
  hover?: boolean;
  className?: string;
  /** override state machine name */
  stateMachine?: string;
};

export function RiveIcon({ id, size = 40, label, hover: hoverProp, className, stateMachine }: Props) {
  const icon = resolveRiveIcon(id);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [hostHover, setHostHover] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [inView, setInView] = useState(false);
  const [riveReady, setRiveReady] = useState(false);
  const hover = hoverProp ?? hostHover;
  const useRiv = !!icon.riveSrc && !reduced;

  // Bind to host (card) pointer/focus/click events.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = (el.closest("[data-rive-host], [data-rive]") as HTMLElement | null) ?? el;
    const on = () => setHostHover(true);
    const off = () => setHostHover(false);
    const click = () => setClicks((c) => c + 1);
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    host.addEventListener("click", click);
    return () => {
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
      host.removeEventListener("click", click);
    };
  }, []);

  // Only mount Rive when near the viewport.
  useEffect(() => {
    if (!useRiv || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), {
      rootMargin: "200px",
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [useRiv]);

  const state = reduced ? "idle" : hover ? "hover" : "idle";

  return (
    <span
      ref={ref}
      className={cn("relative inline-grid h-[var(--icon-size)] w-[var(--icon-size)] flex-none", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-rive-icon={icon.id}
      data-rive-mode={useRiv ? "rive" : "svg"}
      data-state={state}
      style={cssVars({ "--icon-size": `${size}px` })}
    >
      {(!useRiv || !riveReady) && (
        <FallbackSvg art={icon.art} size={size} state={state} clicks={reduced ? 0 : clicks} />
      )}
      {useRiv && inView && (
        <span className={cn("[grid-area:1/1]", riveReady ? "opacity-100" : "opacity-0")}>
          <RiveCanvas
            src={icon.riveSrc!}
            stateMachine={stateMachine ?? icon.stateMachine}
            hover={hover}
            clickCount={clicks}
            onReady={() => setRiveReady(true)}
            size={size}
          />
        </span>
      )}
    </span>
  );
}

function FallbackSvg({
  art,
  size,
  state,
  clicks,
}: {
  art: { base: ReactNode; accent: ReactNode };
  size: number;
  state: "idle" | "hover";
  clicks: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="overflow-visible [grid-area:1/1]"
      aria-hidden
    >
      <g stroke="currentColor">{art.base}</g>
      {/* click trigger: keyed remount replays the pulse */}
      <motion.g
        key={clicks}
        stroke="var(--color-brand)"
        className="origin-center [transform-box:fill-box]"
        initial={clicks ? { scale: 0.82 } : false}
        animate={state === "hover" ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
        transition={
          clicks
            ? { type: "spring", stiffness: 700, damping: 18 }
            : { duration: 0.2, ease: FM_EASE.outSoft }
        }
      >
        {art.accent}
      </motion.g>
    </svg>
  );
}

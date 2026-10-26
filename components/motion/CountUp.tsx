"use client";
/**
 * CountUp: a number that counts from `from` to `value` once, when it enters the viewport.
 * Design: home-internet.responsive-and-motion.md ("$40 figure: counts 0 -> 40 in 600ms, tabular-nums")
 * and home.animation-intent.md (Why choose us "45" / "90", 480ms).
 *
 *  - SSR / no-JS / reduced motion: the FINAL value is rendered as text (SEO, no layout shift).
 *  - Screen readers always get the final value: an sr-only copy of it (`ariaLabel` overrides the text).
 *    The ticking digits are aria-hidden, so intermediate numbers are never announced. aria-label on a
 *    plain <span> is not reliably read, hence sr-only text rather than aria-label.
 *  - rAF + IntersectionObserver (no GSAP: nothing extra to load). Writes textContent, so React does not
 *    re-render per frame. ease-out cubic. `tabular-nums` prevents width jitter.
 *  - Runs once. If the element is already on screen at hydration it still counts (from `from`).
 *
 * Hook: [data-countup][data-countup-state="idle|running|done"], data-countup-value = final value.
 */
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { cn } from "@/lib/utils/cn";

export type CountUpProps = {
  value: number;
  from?: number;
  /** seconds, clamped to 0.3–1.2 (default 0.6) */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** screen-reader text (sr-only); defaults to `${prefix}${formatted value}${suffix}` */
  ariaLabel?: string;
  className?: string;
  /** IntersectionObserver threshold (default 0.4) */
  threshold?: number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  value,
  from = 0,
  duration = 0.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  ariaLabel,
  className,
  threshold = 0.4,
}: CountUpProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const finalText = fmt(value);

  useEffect(() => {
    const root = rootRef.current;
    const num = numRef.current;
    if (!root || !num) return;
    const done = () => {
      num.textContent = finalText;
      root.setAttribute("data-countup-state", "done");
    };
    if (prefersReducedMotion() || document.documentElement.dataset.motion !== "ok" || !("IntersectionObserver" in window)) {
      done();
      return;
    }
    const ms = Math.min(1.2, Math.max(0.3, duration)) * 1000;
    let raf = 0;
    let started = false;
    const run = () => {
      started = true;
      root.setAttribute("data-countup-state", "running");
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        num.textContent = fmt(from + (value - from) * easeOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(tick);
        else done();
      };
      num.textContent = fmt(from);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting && !started) {
          io.disconnect();
          run();
        } else if (!started) {
          // below the fold: show the start value until it scrolls in
          num.textContent = fmt(from);
          root.setAttribute("data-countup-state", "idle");
        }
      },
      { threshold },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      num.textContent = finalText;
    };
    // fmt is derived from `decimals`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, duration, decimals, threshold, finalText]);

  return (
    <span
      ref={rootRef}
      data-countup
      data-countup-value={value}
      className={cn("tabular-nums", className)}
    >
      <span className="sr-only">{ariaLabel ?? `${prefix}${finalText}${suffix}`}</span>
      <span aria-hidden>
        {prefix}
        <span ref={numRef}>{finalText}</span>
        {suffix}
      </span>
    </span>
  );
}

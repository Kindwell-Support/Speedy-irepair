"use client";
/**
 * A5 / M6 — Hero device: static poster (server-rendered LCP element, fixed aspect box, CLS 0)
 * + lazily mounted R3F scene that cross-fades in on its first rendered frame.
 *
 * Mount gate (all must pass): not reduced-motion, not low-power/saveData/reduced-data,
 * hardware WebGL available, window `load` fired, browser idle, hero in viewport.
 * Runtime degrade: FPS < 30 after warm-up or context loss -> unmount, keep poster.
 * Pauses (frameloop "never") when offscreen or tab hidden.
 */
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { decide3D } from "./capabilities";
import { cn } from "@/lib/utils/cn";
import { cssVars } from "@/lib/utils/css-vars";

const PhoneScene = dynamic(() => import("./PhoneScene"), { ssr: false, loading: () => null });

export type HeroPoster = {
  avif?: string;
  webp?: string;
  png: string;
  width: number;
  height: number;
};

export const DEFAULT_POSTER: HeroPoster = {
  avif: "/hero/phone-poster.avif",
  webp: "/hero/phone-poster.webp",
  png: "/hero/phone-poster.png",
  width: 960,
  height: 1200,
};

type Props = { poster?: HeroPoster; alt?: string; className?: string };

type Phase = "poster" | "mounting" | "live" | "degraded";

export function HeroDevice({
  poster = DEFAULT_POSTER,
  alt = "Smartphone showing a completed 45-minute screen repair",
  className,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("poster");
  const [env, setEnv] = useState({ mobile: false, force: false });
  const [active, setActive] = useState(true);

  useEffect(() => {
    const d = decide3D();
    box.current?.setAttribute("data-3d", d.ok ? "pending" : `off:${d.reason}`);
    if (!d.ok) return;
    setEnv({ mobile: d.mobile, force: d.force });
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const whenIdle = (cb: () => void) =>
      w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 300);
    const start = () =>
      whenIdle(() => {
        if (cancelled || !box.current) return;
        io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) {
            io?.disconnect();
            setPhase("mounting");
          }
        });
        io.observe(box.current);
      });
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      io?.disconnect();
      window.removeEventListener("load", start);
    };
  }, []);

  // pause when offscreen / hidden
  useEffect(() => {
    if (phase !== "mounting" && phase !== "live") return;
    const el = box.current!;
    let visible = true;
    const update = () => setActive(visible && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [phase]);

  const live = phase === "live";
  return (
    <div
      ref={box}
      className={cn("relative aspect-[var(--hero-ar)] w-full", className)}
      data-hero-device
      data-phase={phase}
      style={cssVars({ "--hero-ar": `${poster.width} / ${poster.height}` })}
    >
      <picture>
        {poster.avif && <source srcSet={poster.avif} type="image/avif" />}
        {poster.webp && <source srcSet={poster.webp} type="image/webp" />}
        <img
          src={poster.png}
          alt={alt}
          width={poster.width}
          height={poster.height}
          fetchPriority="high"
          decoding="async"
          data-testid="hero-poster"
          className={cn(
            "absolute inset-0 h-full w-full object-contain transition-opacity duration-base ease-out",
            live ? "opacity-0" : "opacity-100",
          )}
        />
      </picture>
      {(phase === "mounting" || live) && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 transition-opacity duration-base ease-out",
            live ? "opacity-100" : "opacity-0",
          )}
        >
          <Suspense fallback={null}>
            <PhoneScene
              active={active}
              interactive={!env.mobile}
              mobile={env.mobile}
              skipFpsGuard={env.force}
              onFirstFrame={() => setPhase((p) => (p === "mounting" ? "live" : p))}
              onDegrade={(reason) => {
                box.current?.setAttribute("data-3d", `off:${reason}`);
                setPhase("degraded");
              }}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

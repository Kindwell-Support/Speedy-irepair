"use client";

/**
 * SplineScene: Architect contract stub (Motion lane owns components/3d; adopt/replace freely).
 * - Spline runtime (~600 kB) is NEVER in a route's first-load JS: loaded via next/dynamic, ssr:false,
 *   only after the container is near the viewport (IntersectionObserver), and never under
 *   prefers-reduced-motion or Save-Data. The poster is always the LCP element.
 * - `scene` is a Sanity-editable URL (e.g. homePage.splineSceneUrl); unset => poster only.
 */
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

type Props = {
  scene?: string | null;
  poster: { src: string; width: number; height: number; alt: string };
  className?: string;
  priority?: boolean;
};

export function SplineScene({ scene, poster, className, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!scene || !ref.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [scene]);

  return (
    <div ref={ref} className={["relative", className].filter(Boolean).join(" ")}>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={poster.alt}
        priority={priority}
        className={["h-auto w-full transition-opacity duration-slow", ready ? "opacity-0" : "opacity-100"].join(" ")}
      />
      {load && scene ? (
        <div className="absolute inset-0" aria-hidden="true">
          <Spline scene={scene} onLoad={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}

export default SplineScene;

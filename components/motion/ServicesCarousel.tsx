"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "./reactbits/CircularGallery";
import { useLenis } from "./LenisProvider";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { buttonClasses } from "@/components/ui/ButtonLink";

const CircularGallery = dynamic(() => import("./reactbits/CircularGallery"), { ssr: false });

export type ServiceTile = { tone: "brand" | "dark"; big: string; small: string };

export type ServiceSlide = {
  id: string;
  /** Short name drawn under the card in the gallery; `title` is the full name in the panel below. */
  label: string;
  title: string;
  href: string;
  description: string;
  /** Slides with a photo show it; the rest get a drawn text tile. */
  photo?: { src: string; alt: string };
  tile?: ServiceTile;
};

const TONES = {
  brand: { bg: "#ED1C24", ink: "#ffffff", soft: "rgba(255,255,255,0.82)", accent: "#ffffff" },
  dark: { bg: "#161616", ink: "#ffffff", soft: "#b8b8b8", accent: "#ED1C24" },
};
/** Tiles match the gallery's card aspect (0.78) so nothing is cropped. */
const TILE_W = 780;
const TILE_H = 1000;
const PAD = 64;

/** Photos go through the Next image optimizer at phone width, so each texture is a small download. */
const photoUrl = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;

function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

/** Draws a text card in the site's type (Orbitron phrase over a Rajdhani line) and returns it as an image URL. */
async function drawTile(tile: ServiceTile): Promise<string> {
  const root = getComputedStyle(document.documentElement);
  const heading = root.getPropertyValue("--font-orbitron").trim() || "sans-serif";
  const body = root.getPropertyValue("--font-rajdhani").trim() || "sans-serif";
  await Promise.all([document.fonts.load(`900 104px ${heading}`), document.fonts.load(`600 40px ${body}`)]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = TILE_W;
  canvas.height = TILE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  const tone = TONES[tile.tone];
  const max = TILE_W - PAD * 2;

  ctx.fillStyle = tone.bg;
  ctx.fillRect(0, 0, TILE_W, TILE_H);
  ctx.fillStyle = tone.accent;
  ctx.fillRect(PAD, PAD, 72, 10);

  ctx.font = `600 40px ${body}`;
  const small = wrapText(ctx, tile.small, max).slice(0, 2);
  ctx.fillStyle = tone.soft;
  small.forEach((line, i) => ctx.fillText(line, PAD, TILE_H - PAD - (small.length - 1 - i) * 48));

  let size = 112;
  let big: string[] = [];
  for (; size >= 56; size -= 4) {
    ctx.font = `900 ${size}px ${heading}`;
    big = wrapText(ctx, tile.big, max);
    if (big.length <= 3 && big.every((line) => ctx.measureText(line).width <= max)) break;
  }
  const bigBottom = TILE_H - PAD - (small.length - 1) * 48 - 32 - 40;
  ctx.fillStyle = tone.ink;
  big.forEach((line, i) => ctx.fillText(line, PAD, bigBottom - (big.length - 1 - i) * size * 1.04));

  return canvas.toDataURL("image/png");
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"} />
    </svg>
  );
}

/**
 * Services as a React Bits CircularGallery (WebGL2). The server and visitors without WebGL2 get a plain
 * swipeable row of linked cards; after mount the gallery replaces it once the text tiles are drawn.
 * Vertical wheel scrolling always goes to the page (forwarded to Lenis when it is running); the gallery
 * only turns on drag, swipe, sideways trackpad, the arrow buttons or the arrow keys. Clicking the centred
 * card opens its service; clicking a side card brings it to the centre first.
 */
export function ServicesCarousel({ slides }: { slides: ServiceSlide[] }) {
  const router = useRouter();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const probe = document.createElement("canvas").getContext("webgl2");
    probe?.getExtension("WEBGL_lose_context")?.loseContext();
    if (!probe) return;
    let alive = true;
    Promise.all(
      slides.map(async (s) => ({
        image: s.photo ? photoUrl(s.photo.src) : await drawTile(s.tile ?? { tone: "dark", big: s.label, small: s.description }),
        text: s.label,
        description: s.description,
        alt: s.photo?.alt ?? s.title,
      })),
    )
      .then((list) => alive && setItems(list))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [slides]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.stopPropagation();
      if (!lenis) return;
      e.preventDefault();
      window.dispatchEvent(new WheelEvent("wheel", e));
    };
    stage.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => stage.removeEventListener("wheel", onWheel, { capture: true });
  }, [lenis, items]);

  const step = (key: "ArrowLeft" | "ArrowRight") =>
    stageRef.current?.querySelector('[aria-roledescription="carousel"]')?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

  const current = slides[active] ?? slides[0];
  if (!current) return null;

  if (!items)
    return (
      <div className="flex h-[400px] items-center md:h-[500px]">
        <ul className="container-site flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2" aria-label="Services">
          {slides.map((s) => (
            <li key={s.id} className="relative isolate flex aspect-[78/100] w-[240px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-md bg-surface-2 p-6">
              {s.photo ? (
                <div className="photo-shade absolute inset-0 -z-10" aria-hidden>
                  <Image src={s.photo.src} alt="" fill sizes="240px" className="object-cover" />
                </div>
              ) : null}
              <h3 className="text-h4">
                <Link href={s.href} className="after:absolute after:inset-0">
                  {s.title}
                </Link>
              </h3>
              <p className="mt-2 text-body-sm text-text-secondary">{s.description}</p>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div>
      <div ref={stageRef} className="h-[400px] md:h-[500px]">
        <CircularGallery
          items={items}
          aria-label="Services"
          font="800 30px var(--font-orbitron), sans-serif"
          textColor="#ffffff"
          bend={2.5}
          autoScroll={reduced ? 0 : 0.5}
          intro={!reduced}
          snap
          openOnClick={false}
          onActiveChange={(i) => {
            activeRef.current = i;
            setActive(i);
          }}
          onItemClick={(_, i) => {
            if (i === activeRef.current) router.push(slides[i]!.href);
          }}
        />
      </div>
      <div className="container-site mt-6 flex flex-col items-center text-center md:mt-8">
        <p className="font-heading text-h4">{current.title}</p>
        <p className="mt-3 min-h-[3lh] max-w-[46ch] text-body-lg text-text-secondary">{current.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={() => step("ArrowLeft")} aria-label="Previous service" className="grid size-12 place-items-center rounded-full bg-surface-2 text-text transition-colors duration-fast hover:bg-surface-3">
            <Chevron dir="left" />
          </button>
          <Link href={current.href} className={buttonClasses("primary", "md")}>
            View service<span className="sr-only">: {current.title}</span>
          </Link>
          <button type="button" onClick={() => step("ArrowRight")} aria-label="Next service" className="grid size-12 place-items-center rounded-full bg-surface-2 text-text transition-colors duration-fast hover:bg-surface-3">
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

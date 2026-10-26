"use client";
/**
 * A7 — Text scramble on hover for nav items / section labels (React Bits <DecryptedText>).
 * Fast: ~6 iterations x 30ms. Off under reduced motion and on touch (plain text).
 * The real text is always in the DOM for SEO/AT (DecryptedText keeps an sr-only copy).
 */
import { lazy, Suspense } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/motion/reduced-motion";

/** Code-split: only fetched for fine-pointer, motion-OK visitors (SSR and touch render plain text). */
const DecryptedText = lazy(() => import("./reactbits/DecryptedText"));

type Props = { text: string; className?: string };

export function ScrambleText({ text, className }: Props) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const plain = <span className={className}>{text}</span>;
  if (reduced || !fine) return plain;
  return (
    <Suspense fallback={plain}>
      <DecryptedText
        text={text}
        animateOn="hover"
        speed={30}
        maxIterations={6}
        sequential
        revealDirection="start"
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        className={className}
        encryptedClassName="scramble-enc"
      />
    </Suspense>
  );
}

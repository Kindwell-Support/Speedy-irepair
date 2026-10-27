"use client";
/**
 * A7 — Text scramble on hover for nav items / section labels (React Bits <DecryptedText>).
 * Fast: ~6 iterations x 30ms. Off under reduced motion and on touch (plain text).
 * The real text is always in the DOM for SEO/AT (DecryptedText keeps an sr-only copy).
 */
import DecryptedText from "./reactbits/DecryptedText";
import { useFinePointer, useReducedMotion } from "@/lib/motion/reduced-motion";

type Props = { text: string; className?: string };

export function ScrambleText({ text, className }: Props) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  if (reduced || !fine) return <span className={className}>{text}</span>;
  return (
    <DecryptedText
      text={text}
      animateOn="hover"
      speed={30}
      maxIterations={6}
      sequential
      revealDirection="start"
      characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      className={className}
      // DecryptedText sets pre-wrap; a label never breaks across lines mid-scramble.
      parentClassName="!whitespace-nowrap"
      encryptedClassName="scramble-enc"
    />
  );
}

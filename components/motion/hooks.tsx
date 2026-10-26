/**
 * Zero-JS markup helpers for the data-animate hook contract (server components).
 * They only render attributes; behaviour is bound by PageTransition/useDataAnimate.
 * Frontend can use these OR write the attributes by hand (see docs/motion/HOOKS.md).
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Poly<E extends ElementType, P> = P & { as?: E; children?: ReactNode } & Omit<
    ComponentPropsWithoutRef<E>,
    keyof P | "as" | "children"
  >;

/** data-animate="reveal" — fade+rise on scroll (0.55s power3.out). */
export function Reveal<E extends ElementType = "div">({
  as,
  children,
  delay,
  onLoad,
  childrenStagger,
  ...rest
}: Poly<E, { delay?: number; onLoad?: boolean; childrenStagger?: boolean }>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      data-animate="reveal"
      data-reveal-delay={delay}
      data-reveal-trigger={onLoad ? "load" : undefined}
      data-reveal={childrenStagger ? "children" : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** data-animate="stagger" — direct children (or [data-animate-item]) reveal in sequence. */
export function Stagger<E extends ElementType = "div">({
  as,
  children,
  each,
  ...rest
}: Poly<E, { each?: number }>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag data-animate="stagger" data-stagger={each} {...rest}>
      {children}
    </Tag>
  );
}

/** data-animate="parallax" — put on the media INSIDE an overflow-hidden frame. */
export function Parallax<E extends ElementType = "div">({
  as,
  children,
  amount,
  ...rest
}: Poly<E, { amount?: number }>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag data-animate="parallax" data-parallax={amount} {...rest}>
      {children}
    </Tag>
  );
}

/** data-animate="split-heading" — SplitText reveal. Use plain text children. */
export function SplitHeading<E extends ElementType = "h2">({
  as,
  children,
  split = "words",
  onLoad,
  delay,
  ...rest
}: Poly<E, { split?: "chars" | "words" | "lines"; onLoad?: boolean; delay?: number }>) {
  const Tag = (as ?? "h2") as ElementType;
  return (
    <Tag
      data-animate="split-heading"
      data-split={split}
      data-split-trigger={onLoad ? "load" : undefined}
      data-split-delay={delay}
      {...rest}
    >
      {children}
    </Tag>
  );
}

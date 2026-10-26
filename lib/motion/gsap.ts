"use client";
/**
 * Central GSAP registration (A2/A3). Import gsap + plugins ONLY from here so
 * plugins are registered exactly once and tree-shaken consistently.
 * GSAP (incl. SplitText) is free since 3.13 — `gsap` npm package.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { EASE, DUR } from "./tokens";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: EASE.out, duration: DUR.reveal });
  // Avoid re-calculating on mobile URL-bar show/hide (prevents jumpy pins).
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger, SplitText };

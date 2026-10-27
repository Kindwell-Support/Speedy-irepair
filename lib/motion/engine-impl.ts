"use client";
/**
 * The heavy half of the motion layer, in ONE async chunk (never in first-load JS):
 * gsap core + ScrollTrigger + SplitText + Lenis + the data-attribute bindings (reveal, stagger,
 * parallax, split headings, PinnedSteps, /faq accordion). Import ONLY via loadMotionEngine().
 */
export { gsap, ScrollTrigger, SplitText, registerGsap } from "./gsap";
export { createLenisGsap, LENIS_DEFAULTS } from "./lenis-gsap";
export { bindAnimations } from "./bindings";
export { bindScrollSpy } from "./scroll-spy";

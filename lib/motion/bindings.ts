"use client";
/**
 * data-animate binder (A2/A3/M3). Scans a root element for the hook-contract
 * attributes (see /docs/motion/HOOKS.md) and binds GSAP behaviours.
 *
 * All behaviours are created inside gsap.matchMedia() so that:
 *  - prefers-reduced-motion users get NOTHING bound (content is already visible via CSS),
 *  - breakpoint-specific behaviour (How It Works: pin >= STEPS_PIN_MIN_PX, stacked reveal below)
 *    is torn down / rebuilt automatically on resize,
 *  - everything is reverted on route change/unmount (mm.revert()).
 */
import { gsap, ScrollTrigger, SplitText, registerGsap } from "./gsap";
import { getLenis } from "./lenis-gsap";
import { DUR, EASE, MQ, REVEAL_Y, STAGGER, STEPS_MQ, STEPS_PIN_VH } from "./tokens";

type Cleanup = () => void;

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T & Element>(sel)) as T[];

const num = (v: string | undefined, d: number) => {
  const n = v === undefined ? NaN : parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

/** Mark an element as handled so CSS "before" state is released even if no tween runs. */
const settle = (el: Element) => el.setAttribute("data-animated", "");

/* Selectors: data-animate="x" (motion contract) OR the Design/Frontend shorthand attributes
   already used in design/pages/home.html (data-stagger, data-split, data-pin, data-faq). */
export const SEL = {
  reveal: '[data-animate="reveal"]',
  stagger: '[data-animate="stagger"], [data-stagger]',
  parallax: '[data-animate="parallax"], [data-parallax]',
  split: '[data-animate="split-heading"], [data-split]',
  steps: '[data-animate="steps"], [data-pin="how"]',
  faq: "[data-faq]",
} as const;

/* ---------------------------------------------------------------- reveal */
function bindReveal(root: ParentNode) {
  q(root, SEL.reveal).forEach((el) => {
    const delay = num(el.dataset.revealDelay, 0);
    const onLoad = el.dataset.revealTrigger === "load";
    const childrenMode = el.dataset.reveal === "children";
    const targets = childrenMode ? Array.from(el.children) : [el];
    settle(el);
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: REVEAL_Y },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR.reveal,
        ease: EASE.out,
        delay,
        stagger: childrenMode ? STAGGER.items : 0,
        clearProps: "transform",
        scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 85%", once: true },
      },
    );
  });
}

/* --------------------------------------------------------------- stagger */
function bindStagger(root: ParentNode) {
  q(root, SEL.stagger).forEach((group) => {
    const explicit = q(group, "[data-animate-item]");
    const items = explicit.length ? explicit : (Array.from(group.children) as HTMLElement[]);
    const each = num(group.dataset.stagger || undefined, STAGGER.items);
    settle(group);
    gsap.set(items, { autoAlpha: 0, y: REVEAL_Y });
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: DUR.reveal,
          ease: EASE.out,
          stagger: each,
          overwrite: true,
          clearProps: "transform",
        }),
    });
  });
}

/* -------------------------------------------------------------- parallax */
function bindParallax(root: ParentNode) {
  q(root, SEL.parallax).forEach((el) => {
    const amount = num(el.dataset.parallax || undefined, 8); // percent of element height
    settle(el);
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

/* --------------------------------------------------------- split heading */
function bindSplitHeadings(root: ParentNode): Cleanup[] {
  const cleanups: Cleanup[] = [];
  q(root, SEL.split).forEach((el) => {
    const mode = (el.dataset.split || "words") as "chars" | "words" | "lines";
    const onLoad = el.dataset.splitTrigger === "load";
    const delay = num(el.dataset.splitDelay, 0);
    const type = mode === "chars" ? "words,chars" : mode === "lines" ? "lines" : "lines,words";
    const split = SplitText.create(el, {
      type,
      mask: mode === "chars" ? "words" : "lines",
      autoSplit: true, // re-split on resize / font load; the returned tween is reverted + rebuilt
      aria: "auto", // aria-label on the element, split pieces aria-hidden
      onSplit(self) {
        gsap.set(el, { autoAlpha: 1 });
        settle(el);
        const targets = mode === "chars" ? self.chars : mode === "lines" ? self.lines : self.words;
        return gsap.from(targets, {
          yPercent: 110,
          duration: mode === "chars" ? 0.45 : DUR.reveal,
          ease: EASE.out,
          delay,
          stagger: mode === "chars" ? STAGGER.chars : mode === "lines" ? 0.08 : STAGGER.words,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 85%", once: true },
        });
      },
    });
    cleanups.push(() => split.revert());
  });
  return cleanups;
}

/* ------------------------------------------------- how it works (steps) */
/**
 * Markup (FE HowItWorks / design home.html §3): section[data-testid=how-it-works] > [data-pin="how"]
 * > [data-steps-pin] > ([data-steps-progress] | .progress__fill) + ol > li[data-step] x4.
 * All tiles are rendered and visible without JS / under reduced motion (static list).
 *
 * mode "pin"   (>= STEPS_PIN_MIN_PX): row pinned for STEPS_PIN_VH x 100vh, scrub 0.3, snap per
 *              step. The rail fills 0 -> 100 % (scaleX). The active tile lifts; the previous tile tips
 *              like a domino (rotate -6deg at its bottom-left origin) and settles to "done".
 *              Clicking a tile scrolls to its position.
 * mode "stack" (< STEPS_PIN_MIN_PX): no pin. Each card fades and rises on enter (stagger 60 ms); the rail is static.
 * State hooks: is-active / is-done (+ data-active / data-done, aria-current="step") in pin mode,
 * data-steps-mode="pin|stack" and data-pinned="true|false" on [data-pin] AND on the closest
 * [data-testid="how-it-works"] (QA selector).
 */
function bindSteps(root: ParentNode, mode: "pin" | "stack"): Cleanup[] {
  const cleanups: Cleanup[] = [];
  q(root, SEL.steps).forEach((section) => {
    const pin = section.querySelector<HTMLElement>("[data-steps-pin]") ?? section;
    const steps = q(section, "[data-step]");
    const bar = section.querySelector<HTMLElement>("[data-steps-progress], .progress__fill");
    const n = steps.length;
    if (!n) return;
    const hosts = [section, section.closest<HTMLElement>('[data-testid="how-it-works"]')].filter(
      (h, i, a): h is HTMLElement => !!h && a.indexOf(h) === i,
    );
    const mark = (pinned: boolean) =>
      hosts.forEach((h) => {
        h.setAttribute("data-steps-mode", mode);
        h.setAttribute("data-pinned", String(pinned));
      });
    settle(section);

    if (mode === "stack") {
      mark(false);
      gsap.set(steps, { autoAlpha: 0, y: 16 });
      const batch = ScrollTrigger.batch(steps, {
        start: "top 88%",
        once: true,
        onEnter: (b) =>
          gsap.to(b, { autoAlpha: 1, y: 0, duration: DUR.card, ease: EASE.out, stagger: 0.06, overwrite: true }),
      });
      cleanups.push(() => {
        batch.forEach((t) => t.kill());
        hosts.forEach((h) => h.removeAttribute("data-steps-mode"));
      });
      return;
    }

    let current = -1;
    const setActive = (i: number) => {
      if (i === current) return;
      current = i;
      steps.forEach((s, j) => {
        s.classList.toggle("is-active", j === i);
        s.classList.toggle("is-done", j < i);
        s.toggleAttribute("data-active", j === i);
        s.toggleAttribute("data-done", j < i);
        if (j === i) s.setAttribute("aria-current", "step");
        else s.removeAttribute("aria-current");
      });
    };

    mark(true);
    if (bar) gsap.set(bar, { width: "100%", scaleX: 0, transformOrigin: "left center" });
    gsap.set(steps, { transformOrigin: "0% 100%" });
    setActive(0);
    const tl = gsap.timeline({
      defaults: { ease: EASE.inOut, duration: 1 },
      scrollTrigger: {
        trigger: pin,
        // Row pinned at 30 % of the viewport: clear of the sticky header, centred-high.
        start: "top 30%",
        end: () => `+=${window.innerHeight * STEPS_PIN_VH}`,
        pin: true,
        scrub: 0.3,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.35 }, ease: EASE.inOut, delay: 0.05 },
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))),
        onKill: () => hosts.forEach((h) => h.removeAttribute("data-pinned")),
      },
    });
    gsap.set(steps[0]!, { y: -8 });
    for (let i = 1; i < n; i++) {
      const at = i - 1;
      // previous tile: domino tip (<= 8deg at bottom-left), then settles flat and dimmed ("done")
      tl.to(steps[i - 1]!, { rotation: -6, y: 0, duration: 0.3, ease: EASE.out }, at + 0.15)
        .to(steps[i - 1]!, { rotation: 0, autoAlpha: 0.6, duration: 0.35 }, at + 0.45)
        .fromTo(steps[i]!, { y: 0 }, { y: -8, duration: 0.5, ease: EASE.out }, at + 0.35);
      if (bar) tl.to(bar, { scaleX: i / (n - 1), ease: "none", duration: 0.8 }, at + 0.1);
    }

    // Click on a tile jumps to its scroll position (Lenis when present, otherwise native). Pointer
    // convenience only: tiles stay non-focusable list items (keyboard users scroll through the pin).
    const st = tl.scrollTrigger!;
    const offs = steps.map((s, i) => {
      const go = () => {
        const y = st.start + ((st.end - st.start) * i) / (n - 1);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 0.6 });
        else window.scrollTo({ top: y, behavior: "smooth" });
      };
      s.addEventListener("click", go);
      s.setAttribute("data-step-jump", "");
      return () => {
        s.removeEventListener("click", go);
        s.removeAttribute("data-step-jump");
      };
    });
    cleanups.push(() => {
      offs.forEach((o) => o());
      steps.forEach((s) => {
        s.classList.remove("is-active", "is-done");
        s.removeAttribute("data-active");
        s.removeAttribute("data-done");
        s.removeAttribute("aria-current");
      });
      hosts.forEach((h) => h.removeAttribute("data-steps-mode"));
    });
  });
  return cleanups;
}

/* ------------------------------------------------------ FAQ (GSAP accordion) */
/**
 * Progressive enhancement of native <details>/<summary> (data-faq on the wrapper).
 * Without JS / reduced motion the native element works as-is (find-in-page, a11y intact).
 * With motion: height + content fade/slide. data-faq="single" closes siblings.
 * Height is the one non-transform property animated in the motion layer; the panel is
 * isolated with `contain: layout paint` (motion.css) so it cannot thrash the page.
 */
function bindFaq(root: ParentNode): Cleanup[] {
  const cleanups: Cleanup[] = [];
  q(root, SEL.faq).forEach((wrap) => {
    const single = wrap.dataset.faq === "single";
    const items = q<HTMLDetailsElement>(wrap, "details");
    settle(wrap);
    const panelOf = (d: HTMLDetailsElement) =>
      d.querySelector<HTMLElement>("[data-accordion-panel], .accordion__panel") ??
      (d.querySelector("summary")?.nextElementSibling as HTMLElement | null);

    const close = (d: HTMLDetailsElement) => {
      const panel = panelOf(d);
      if (!panel || !d.open) return;
      gsap.killTweensOf(panel);
      d.removeAttribute("data-open");
      gsap.fromTo(
        panel,
        { height: panel.offsetHeight },
        { height: 0, autoAlpha: 0, duration: DUR.microLong, ease: EASE.inOut, onComplete: () => { d.open = false; gsap.set(panel, { clearProps: "height,opacity,visibility" }); } },
      );
    };
    const open = (d: HTMLDetailsElement) => {
      const panel = panelOf(d);
      if (!panel) return;
      gsap.killTweensOf(panel);
      d.open = true;
      d.setAttribute("data-open", "");
      const h = panel.scrollHeight;
      gsap.fromTo(panel, { height: 0, autoAlpha: 0 }, { height: h, autoAlpha: 1, duration: DUR.revealLong * 0.6, ease: EASE.out, onComplete: () => { gsap.set(panel, { clearProps: "height" }); ScrollTrigger.refresh(); } });
      const kids = Array.from(panel.children);
      if (kids.length) gsap.fromTo(kids, { y: -6 }, { y: 0, duration: DUR.microLong, ease: EASE.out, clearProps: "transform" });
    };

    items.forEach((d) => {
      const summary = d.querySelector("summary");
      if (!summary) return;
      if (d.open) d.setAttribute("data-open", "");
      const onClick = (e: Event) => {
        e.preventDefault();
        if (d.hasAttribute("data-open")) close(d);
        else {
          if (single) items.forEach((o) => o !== d && close(o));
          open(d);
        }
      };
      summary.addEventListener("click", onClick);
      cleanups.push(() => summary.removeEventListener("click", onClick));
    });
  });
  return cleanups;
}

/**
 * Bind every data-animate hook under `root`. Returns a cleanup that reverts all
 * tweens, ScrollTriggers, pins and SplitText instances.
 */
export function bindAnimations(root: HTMLElement): Cleanup {
  registerGsap();
  const mm = gsap.matchMedia(root);
  let splitCleanups: Cleanup[] = [];

  const allowed = () => document.documentElement.dataset.motion === "ok";

  // General reveals: bound once per page (not rebuilt on breakpoint changes).
  mm.add(MQ.motionOk, () => {
    if (!allowed()) return;
    bindReveal(root);
    bindStagger(root);
    bindParallax(root);
    splitCleanups = [...bindSplitHeadings(root), ...bindFaq(root)];
    return () => {
      splitCleanups.forEach((c) => c());
      splitCleanups = [];
    };
  });

  // How It Works: pinned >= STEPS_PIN_MIN_PX, stacked reveal below. Rebuilt across the breakpoint.
  mm.add(`${MQ.motionOk} and ${STEPS_MQ.pin}`, () => {
    if (!allowed()) return;
    const c = bindSteps(root, "pin");
    return () => c.forEach((f) => f());
  });
  mm.add(`${MQ.motionOk} and ${STEPS_MQ.stack}`, () => {
    if (!allowed()) return;
    const c = bindSteps(root, "stack");
    return () => c.forEach((f) => f());
  });

  document.documentElement.setAttribute("data-motion-ready", "");
  // Fonts can shift layout -> refresh trigger positions once they're in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

  return () => mm.revert();
}

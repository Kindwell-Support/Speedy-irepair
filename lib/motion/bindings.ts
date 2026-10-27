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
  // data-scroll-trigger: generic "reveal when scrolled into view" alias (Frontend hook name).
  reveal: '[data-animate="reveal"], [data-scroll-trigger]',
  // data-stagger-group: alias of data-stagger (items = [data-animate-item] / [data-stagger-item] or children).
  stagger: '[data-animate="stagger"], [data-stagger], [data-stagger-group]',
  countup: '[data-animate="countup"]',
  parallax: '[data-animate="parallax"], [data-parallax]',
  split: '[data-animate="split-heading"], [data-split]',
  steps: '[data-animate="steps"], [data-pin="how"]',
  faq: "[data-faq]",
} as const;


/* ------------------------------------------------------ reveal failsafe (BUG-008/009)
   Once revealed, stay revealed. ScrollTrigger callbacks can be skipped (a jump past start+end in
   one frame, a refresh/resize between batches, Firefox/WebKit scroll timing), so after every
   scrollEnd / refresh / resize we force-show any still-hidden item whose top is already above the
   viewport bottom. No per-frame work: these are coarse events. */
/** Show only targets that are still hidden and not mid-tween (never restarts a running reveal). */
function forceShow(targets: Element[], duration: number) {
  const stuck = targets.filter((t) => !gsap.isTweening(t) && Number(gsap.getProperty(t, "opacity")) < 1);
  if (stuck.length)
    gsap.to(stuck, { autoAlpha: 1, y: 0, duration, ease: EASE.out, overwrite: true, clearProps: "transform" });
}
type Failsafe = { off: Cleanup; shown: (els: Element[]) => void };
function revealFailsafe(items: HTMLElement[], show: (els: HTMLElement[]) => void): Failsafe {
  const pending = new Set(items);
  const sweep = () => {
    if (!pending.size) return;
    const vh = window.innerHeight;
    const due: HTMLElement[] = [];
    pending.forEach((el) => {
      if (!el.isConnected) return void pending.delete(el);
      if (el.getBoundingClientRect().top < vh) due.push(el);
    });
    if (!due.length) return;
    due.forEach((el) => pending.delete(el));
    show(due);
  };
  ScrollTrigger.addEventListener("scrollEnd", sweep);
  ScrollTrigger.addEventListener("refresh", sweep);
  window.addEventListener("resize", sweep, { passive: true });
  const t = window.setTimeout(sweep, 1500); // initial safety net after load
  const off = () => {
    ScrollTrigger.removeEventListener("scrollEnd", sweep);
    ScrollTrigger.removeEventListener("refresh", sweep);
    window.removeEventListener("resize", sweep);
    window.clearTimeout(t);
  };
  return { off, shown: (els) => els.forEach((el) => pending.delete(el as HTMLElement)) };
}

/* ---------------------------------------------------------------- reveal */
function bindReveal(root: ParentNode, failsafes: Cleanup[]) {
  q(root, SEL.reveal).forEach((el) => {
    const delay = num(el.dataset.revealDelay, 0);
    const onLoad = el.dataset.revealTrigger === "load" || el.dataset.scrollTrigger === "load";
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
    if (!onLoad) failsafes.push(revealFailsafe([el], () => forceShow(targets, DUR.reveal)).off);
  });
}

/* --------------------------------------------------------------- stagger */
function bindStagger(root: ParentNode, failsafes: Cleanup[]) {
  q(root, SEL.stagger).forEach((group) => {
    const explicit = q(group, "[data-animate-item], [data-stagger-item]");
    const items = explicit.length ? explicit : (Array.from(group.children) as HTMLElement[]);
    const each = num(group.dataset.stagger || group.dataset.staggerGroup || undefined, STAGGER.items);
    settle(group);
    gsap.set(items, { autoAlpha: 0, y: REVEAL_Y });
    const show = (batch: Element[]) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: DUR.reveal,
        ease: EASE.out,
        stagger: each,
        overwrite: true,
        clearProps: "transform",
      });
    const fs = revealFailsafe(items, (els) => forceShow(els, DUR.reveal));
    failsafes.push(fs.off);
    ScrollTrigger.batch(items, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => {
        fs.shown(batch);
        show(batch);
      },
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

/* ---------------------------------------------- split heading: text + name */
/**
 * QA BUG-003: headings built from block line spans (`<span class="block">Cracked screen?</span>
 * <span class="block">Dead battery?</span>...`) have no whitespace between lines, so textContent and
 * SplitText's `aria: "auto"` label read "screen?Dead". For every split heading, in BOTH motion
 * modes, we (1) insert a single space text node between adjacent block-level children that have no
 * whitespace between them (textContent / innerText / SEO-on-render now see the sentence) and
 * (2) set aria-label to the spaced, whitespace-collapsed text unless the author set one.
 * SplitText's own label is overwritten with ours after every (re-)split and after revert.
 */
const BLOCKY = /^(block|flex|grid|list-item|table|flow-root)/;
const isBlocky = (n: Node | null): n is HTMLElement =>
  !!n && n.nodeType === 1 && BLOCKY.test(getComputedStyle(n as HTMLElement).display);
export function spacedText(el: Element): string {
  const walk = (n: Node): string => {
    if (n.nodeType === 3) return n.nodeValue ?? "";
    if (n.nodeType !== 1) return "";
    const inner = Array.from(n.childNodes).map(walk).join("");
    return n !== el && isBlocky(n) ? ` ${inner} ` : inner;
  };
  return walk(el).replace(/\s+/g, " ").trim();
}
const splitLabels = new WeakMap<HTMLElement, string>();
function normaliseSplitHeadings(root: ParentNode): Cleanup {
  const added: Text[] = [];
  const labelled: HTMLElement[] = [];
  q(root, SEL.split).forEach((el) => {
    Array.from(el.children).forEach((child) => {
      const prev = child.previousSibling;
      if (!prev || !(isBlocky(child) || isBlocky(prev))) return;
      const before = prev.nodeType === 3 ? prev.nodeValue ?? "" : (prev.textContent ?? "");
      const after = child.textContent ?? "";
      if (/\s$/.test(before) || /^\s/.test(after)) return;
      const space = document.createTextNode(" ");
      el.insertBefore(space, child);
      added.push(space);
    });
    if (el.hasAttribute("aria-label") && !splitLabels.has(el)) return; // author label wins
    const label = spacedText(el);
    splitLabels.set(el, label);
    el.setAttribute("aria-label", label);
    labelled.push(el);
  });
  return () => {
    added.forEach((t) => t.remove());
    labelled.forEach((el) => {
      splitLabels.delete(el);
      el.removeAttribute("aria-label");
    });
  };
}
const applySplitLabel = (el: HTMLElement) => {
  const label = splitLabels.get(el);
  if (label) el.setAttribute("aria-label", label);
};

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
        applySplitLabel(el); // spaced sentence, not SplitText's run-together textContent
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
    cleanups.push(() => {
      split.revert();
      applySplitLabel(el); // revert drops SplitText's label; keep ours (e.g. switch to reduced motion)
    });
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
      const show = (b: Element[]) => {
        b.forEach((el) => el.setAttribute("data-revealed", ""));
        gsap.to(b, { autoAlpha: 1, y: 0, duration: DUR.card, ease: EASE.out, stagger: 0.06, overwrite: true });
      };
      const fs = revealFailsafe(steps, (els) => {
        els.forEach((el) => el.setAttribute("data-revealed", ""));
        forceShow(els, DUR.card);
      });
      const batch = ScrollTrigger.batch(steps, {
        start: "top 88%",
        once: true,
        onEnter: (b) => {
          fs.shown(b);
          show(b);
        },
      });
      cleanups.push(() => {
        fs.off();
        steps.forEach((el) => el.removeAttribute("data-revealed"));
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
        // "done": settles flat; no opacity dim (text must keep >= 4.5:1). The dimmed look is a
        // colour token swap in motion.css keyed on data-done.
        .to(steps[i - 1]!, { rotation: 0, duration: 0.35 }, at + 0.45)
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

/* --------------------------------------------------------------- countup */
/* data-animate="countup" on an element whose text is a number ("40", "$40", "4.9", "1,200+").
   SSR text is the final value (reduced motion / no JS = final number). We only rewrite the
   existing text node's nodeValue (React keeps its node), and always restore the original text. */
const NUM_RE = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s;
function bindCountUps(root: ParentNode): Cleanup[] {
  return q(root, SEL.countup).map((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Text | null = null;
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      if (/\d/.test(t.nodeValue ?? "")) {
        node = t;
        break;
      }
    }
    const original = node?.nodeValue ?? "";
    const m = original.match(NUM_RE);
    if (!node || !m) return () => {};
    const [, pre, digits, post] = m;
    const target = Number(digits.replace(/,/g, ""));
    const decimals = (digits.split(".")[1] ?? "").length;
    const grouped = digits.includes(",");
    const from = num(el.dataset.countupFrom, 0);
    const duration = Math.min(1.2, Math.max(0.3, num(el.dataset.countupDuration, DUR.countUp)));
    const fmt = (v: number) =>
      grouped
        ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : v.toFixed(decimals);
    const state = { v: from };
    const textNode = node;
    el.dataset.countupState = "idle";
    textNode.nodeValue = pre + fmt(from) + post;
    const tween = gsap.to(state, {
      v: target,
      duration,
      ease: "power3.out",
      paused: true,
      onStart: () => {
        el.dataset.countupState = "running";
      },
      onUpdate: () => {
        textNode.nodeValue = pre + fmt(state.v) + post;
      },
      onComplete: () => {
        textNode.nodeValue = original;
        el.dataset.countupState = "done";
      },
    });
    const st = ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => tween.play() });
    return () => {
      st.kill();
      tween.kill();
      textNode.nodeValue = original;
      delete el.dataset.countupState;
    };
  });
}

/**
 * Bind every data-animate hook under `root`. Returns a cleanup that reverts all
 * tweens, ScrollTriggers, pins and SplitText instances.
 */
export function bindAnimations(root: HTMLElement): Cleanup {
  registerGsap();
  // Both modes (reduced motion included): spaced textContent + accessible name for split headings.
  const unNormalise = normaliseSplitHeadings(root);
  const mm = gsap.matchMedia(root);
  let splitCleanups: Cleanup[] = [];

  const allowed = () => document.documentElement.dataset.motion === "ok";

  // General reveals: bound once per page (not rebuilt on breakpoint changes).
  mm.add(MQ.motionOk, () => {
    if (!allowed()) return;
    const failsafes: Cleanup[] = [];
    bindReveal(root, failsafes);
    bindStagger(root, failsafes);
    bindParallax(root);
    splitCleanups = [...bindSplitHeadings(root), ...bindFaq(root), ...bindCountUps(root)];
    return () => {
      failsafes.forEach((c) => c());
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

  return () => {
    mm.revert();
    unNormalise();
  };
}

"use client";
/**
 * data-animate binder (A2/A3/M3). Scans a root element for the hook-contract
 * attributes (see /docs/motion/HOOKS.md) and binds GSAP behaviours.
 *
 * All behaviours are created inside gsap.matchMedia() so that:
 *  - prefers-reduced-motion users get NOTHING bound (content is already visible via CSS),
 *  - breakpoint-specific behaviour (How-It-Works pin on >=768px, stacked reveal on mobile)
 *    is torn down / rebuilt automatically on resize,
 *  - everything is reverted on route change/unmount (mm.revert()).
 */
import { gsap, ScrollTrigger, SplitText, registerGsap } from "./gsap";
import { DUR, EASE, MQ, REVEAL_Y, STAGGER } from "./tokens";

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
  heroEntrance: "[data-hero-entrance]",
  heroRepair: "[data-hero-repair]",
  rating: "[data-rating]",
  wipe: "[data-wipe]",
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

/* ---------------------------------------------------------------- rating */
/**
 * Google rating: [data-rating-value] counts up from 0 and each [data-rating-star] fills from grey to
 * brand red in turn, once, when the block scrolls in. Static markup already reads "4.9" with filled stars.
 */
function bindRating(root: ParentNode) {
  q(root, SEL.rating).forEach((el) => {
    const value = el.querySelector<HTMLElement>("[data-rating-value]");
    const stars = q(el, "[data-rating-star]");
    settle(el);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    if (value) {
      const target = parseFloat(value.textContent ?? "") || 0;
      const counter = { val: 0 };
      value.textContent = (0).toFixed(1);
      tl.to(counter, {
        val: target,
        duration: 1.1,
        ease: EASE.outSoft,
        onUpdate: () => {
          value.textContent = counter.val.toFixed(1);
        },
      }, 0);
    }
    if (stars.length) {
      const filled = getComputedStyle(stars[0]!).color;
      tl.fromTo(
        stars,
        { color: "#555555", scale: 0.7 },
        { color: filled, scale: 1, duration: 0.35, ease: EASE.out, stagger: 0.12, clearProps: "color,transform" },
        0.2,
      );
    }
  });
}

/* ------------------------------------------------------------------ wipe */
/** [data-wipe] > [data-wipe-fill]: the fill layer wipes in left to right as the element scrolls up into view. */
function bindWipe(root: ParentNode) {
  q(root, SEL.wipe).forEach((el) => {
    const fill = el.querySelector<HTMLElement>("[data-wipe-fill]");
    if (!fill) return;
    settle(el);
    gsap.fromTo(
      fill,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.4 } },
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
 * Markup (design/pages/home.html §3): section[data-pin="how"] > ... > ol > li.step[data-step] x4,
 * optional .progress__fill / [data-steps-progress]. All 4 tiles are always rendered and visible
 * (no-JS / reduced = static row). Motion only drives state: active tile lifts, previous tiles
 * "tip over" (rotateX, domino), progress fill scales. Classes is-active / is-done are the
 * Design CSS hooks; data-active / data-done mirror them.
 */
function bindSteps(root: ParentNode, desktop: boolean) {
  q(root, SEL.steps).forEach((section) => {
    const pin = section.querySelector<HTMLElement>("[data-steps-pin]") ?? section;
    const steps = q(section, "[data-step]");
    const bar = section.querySelector<HTMLElement>("[data-steps-progress], .progress__fill");
    const n = steps.length;
    if (!n) return;
    settle(section);
    section.setAttribute("data-testid", section.getAttribute("data-testid") ?? "how-it-works");

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

    if (bar) gsap.set(bar, { width: "100%", scaleX: 0, transformOrigin: "left center" });

    if (!desktop) {
      // Mobile (<768px): pinned CARD STACK. motion.css grid-stacks the tiles (only when
      // html[data-motion=ok], so no-JS/reduced users get the plain vertical list). Each step the
      // current card tips over and fades while the next rises in; progress bar scrubs.
      section.setAttribute("data-pinned", "true");
      gsap.set(steps, { transformPerspective: 900, transformOrigin: "50% 100%" });
      gsap.set(steps.slice(1), { autoAlpha: 0, y: REVEAL_Y });
      setActive(0);
      const tlm = gsap.timeline({
        defaults: { ease: EASE.inOut },
        scrollTrigger: {
          trigger: pin,
          start: "top top+=64",
          end: () => `+=${(n - 1) * window.innerHeight * 0.55}`,
          pin: true,
          scrub: 0.4,
          snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.3 }, ease: EASE.inOut, delay: 0.05 },
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))),
          onKill: () => section.removeAttribute("data-pinned"),
        },
      });
      for (let i = 1; i < n; i++) {
        const at = i - 1;
        tlm.to(steps[i - 1]!, { rotationX: 18, y: -12, autoAlpha: 0, duration: 0.5 }, at + 0.15)
          .to(steps[i]!, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.out }, at + 0.4);
        if (bar) tlm.to(bar, { scaleX: i / (n - 1), ease: "none", duration: 0.8 }, at + 0.1);
      }
      return;
    }

    // Desktop: pin + scrubbed state timeline, ~60vh of scroll per step. Snaps to steps. Card states
    // (widen, photo, number fill, done tick) are CSS transitions on the classes; scroll drives the bar
    // and the repair timer. Centred in the viewport, but never tucked under the floating nav.
    section.setAttribute("data-pinned", "true");
    setActive(0);
    const timer = section.querySelector<HTMLElement>("[data-step-timer]");
    const timerLabel = section.querySelector<HTMLElement>("[data-step-timer-label]");
    const timerAt = timer ? steps.findIndex((s) => s.contains(timer)) : -1;
    const navClear = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h-desktop")) || 76) + 16;
    // 45:00 counts down over the half-step before the timer's card settles; 00:00 at rest reads "Ready".
    const setTimer = (p: number) => {
      if (!timer || timerAt < 1) return;
      const t = Math.min(1, Math.max(0, (p * (n - 1) - (timerAt - 0.5)) / 0.5));
      const secs = Math.round(45 * 60 * (1 - t));
      timer.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
      if (timerLabel) {
        timerLabel.textContent = secs ? "Repair timer" : "Ready";
        timerLabel.toggleAttribute("data-done", !secs);
      }
    };
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: () => `top ${Math.max(navClear(), (window.innerHeight - pin.offsetHeight) / 2)}px`,
        end: () => `+=${(n - 1) * window.innerHeight * 0.6}`,
        pin: true,
        scrub: 0.4,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.35 }, ease: EASE.inOut, delay: 0.05 },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setActive(Math.round(self.progress * (n - 1)));
          setTimer(self.progress);
        },
        onKill: () => {
          section.removeAttribute("data-pinned");
          if (timer) timer.textContent = "45:00";
          if (timerLabel) {
            timerLabel.textContent = "Repair timer";
            timerLabel.removeAttribute("data-done");
          }
        },
      },
    });
    if (bar) tl.to(bar, { scaleX: 1, duration: n - 1 });
    else tl.to({}, { duration: n - 1 });
  });
}

/* -------------------------------------------------- hero entrance sequence */
/**
 * Orchestrated hero entrance: headline SplitText is bound separately (bindSplitHeadings).
 * This timeline staggers in the remaining hero elements on page load:
 * background glow → subline → 3D device → CTAs → trust bar (with number counters).
 * Total ≤ DUR.heroTotal (1.5s).
 */
function bindHeroEntrance(root: ParentNode) {
  q(root, SEL.heroEntrance).forEach((section) => {
    const subline = section.querySelector<HTMLElement>("[data-hero-subline]");
    const ctas = section.querySelector<HTMLElement>("[data-hero-ctas]");
    const trust = section.querySelector<HTMLElement>("[data-trust-bar]");
    const device = section.querySelector<HTMLElement>("[data-hero-device]");
    const shardLayer = section.querySelector<HTMLElement>("[data-shard-layer]");

    settle(section);

    const tl = gsap.timeline({ defaults: { ease: EASE.out } });

    if (shardLayer) {
      tl.fromTo(shardLayer, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.revealLong }, 0.2);
    }

    if (subline) {
      tl.fromTo(
        subline,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: DUR.reveal * 0.7, clearProps: "transform" },
        0.25,
      );
    }

    if (device) {
      tl.fromTo(
        device,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1, duration: DUR.reveal, clearProps: "transform" },
        0.35,
      );
    }

    if (ctas) {
      const buttons = Array.from(ctas.children) as HTMLElement[];
      tl.fromTo(
        buttons,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: DUR.micro, stagger: STAGGER.tight, clearProps: "transform" },
        0.45,
      );
    }

    const fades = q(section, "[data-hero-fade]");
    if (fades.length) {
      tl.fromTo(
        fades,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: DUR.reveal * 0.7, stagger: STAGGER.tight, clearProps: "transform" },
        0.5,
      );
    }

    if (trust) {
      const items = Array.from(trust.children) as HTMLElement[];
      tl.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: DUR.reveal * 0.6, stagger: STAGGER.tight, clearProps: "transform" },
        0.6,
      );
    }

    // Count-ups: the hero's big figure and the trust row both start once their boxes have faded in.
    q(section, "[data-counter]").forEach((el) => {
      const target = parseFloat(el.dataset.counter!);
      const isDecimal = target % 1 !== 0;
      const counter = { val: 0 };
      el.textContent = "0"; // still hidden (pre-hidden in motion.css), so the count never flicks back from the final value
      tl.to(
        counter,
        {
          val: target,
          duration: 0.8,
          ease: EASE.outSoft,
          onUpdate() {
            el.textContent = isDecimal
              ? counter.val.toFixed(1)
              : Math.round(counter.val).toLocaleString("en-US");
          },
        },
        0.65,
      );
    });
  });
}

/* ------------------------------------------------------------ hero repair */
type RepairParts = {
  section: HTMLElement;
  phone: HTMLElement;
  shards: HTMLElement[];
  fixed: HTMLElement | null;
  flash: HTMLElement | null;
  light: HTMLElement | null;
};

function repairParts(section: HTMLElement): RepairParts | null {
  const phone = section.querySelector<HTMLElement>("[data-hero-phone]");
  if (!phone) return null;
  return {
    section,
    phone,
    // Hidden (mobile-only-off) shards have no box; leave them out of the flight.
    shards: q(section, "[data-shard]").filter((el) => el.offsetWidth > 0),
    fixed: phone.querySelector<HTMLElement>("[data-phone-fixed]"),
    flash: phone.querySelector<HTMLElement>("[data-phone-flash]"),
    light: section.querySelector<HTMLElement>("[data-phone-glow]"),
  };
}

/**
 * Pinned scrub: every shard flies back into the impact point (data-tx/ty = fraction of the phone box)
 * and vanishes into the glass; with the last landings the repaired screen heals outward from the
 * impact (--heal radial mask), and the bench light swells.
 */
function bindHeroRepair(root: ParentNode) {
  q(root, SEL.heroRepair).forEach((section) => {
    const p = repairParts(section);
    if (!p) return;
    const header = document.querySelector<HTMLElement>("header");
    const top = () => header?.offsetHeight ?? 0;

    // Shards are absolutely placed in a layer covering the section, so offsets share its origin.
    // Measured from layout boxes (offset*), so the shard's own transform never skews the target.
    const delta = (el: HTMLElement) => {
      const s = section.getBoundingClientRect();
      const r = p.phone.getBoundingClientRect();
      return {
        x: r.left - s.left + num(el.dataset.tx, 0.5) * r.width - (el.offsetLeft + el.offsetWidth / 2),
        y: r.top - s.top + num(el.dataset.ty, 0.5) * r.height - (el.offsetTop + el.offsetHeight / 2),
      };
    };

    // Pin only when the whole hero fits on screen; on tall stacked (phone) layouts pinning would hold
    // the CTAs below the fold, so the repair plays over the first half-screen of normal scroll instead.
    const pin = section.offsetHeight + top() <= window.innerHeight;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: () => `top top+=${top()}`,
        end: () => `+=${Math.round(window.innerHeight * (pin ? 1.3 : 0.55))}`,
        pin,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    const FLY = 0.5;
    const GAP = 0.04;
    p.shards.forEach((el, i) => {
      const at = i * GAP;
      const spin = (i % 2 ? 1 : -1) * (90 + ((i * 37) % 120));
      tl.to(
        el,
        { x: () => delta(el).x, y: () => delta(el).y, rotation: spin, scale: 0.18, duration: FLY, ease: "power3.in" },
        at,
      );
      tl.to(el, { autoAlpha: 0, duration: 0.04 }, at + FLY - 0.03);
    });

    const landed = (p.shards.length - 1) * GAP + FLY;
    const heal = landed - 0.2;
    if (p.flash) {
      tl.fromTo(p.flash, { opacity: 0 }, { opacity: 1, duration: 0.05 }, heal)
        .to(p.flash, { opacity: 0, duration: 0.3, ease: "power1.out" }, heal + 0.05);
    }
    if (p.fixed) tl.fromTo(p.fixed, { "--heal": "0%" }, { "--heal": "170%", duration: 0.45, ease: "power2.out" }, heal);
    if (p.light) tl.to(p.light, { opacity: 1, scale: 1.12, duration: 0.35 }, heal);
    tl.to({}, { duration: 0.25 });
  });
}

/** Reduced motion: no travel or pin. Shards fade and the screen heals in place as the hero scrolls away. */
function bindHeroRepairReduced(root: ParentNode) {
  q(root, SEL.heroRepair).forEach((section) => {
    const p = repairParts(section);
    if (!p) return;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top top", end: "60% top", scrub: true },
    });
    tl.to(p.shards, { opacity: 0 }, 0);
    if (p.fixed) tl.fromTo(p.fixed, { "--heal": "0%" }, { "--heal": "170%" }, 0);
  });
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
    bindHeroEntrance(root);
    bindReveal(root);
    bindStagger(root);
    bindParallax(root);
    bindRating(root);
    bindWipe(root);
    splitCleanups = [...bindSplitHeadings(root), ...bindFaq(root)];
    return () => {
      splitCleanups.forEach((c) => c());
      splitCleanups = [];
    };
  });

  // Hero repair: rebuilt on any media change so shard deltas match the new layout.
  mm.add(MQ.motionOk, () => {
    if (allowed()) bindHeroRepair(root);
  });
  mm.add(MQ.reduce, () => {
    bindHeroRepairReduced(root);
  });

  // How It Works: pinned on >=768px, stacked reveal below. Rebuilt across the breakpoint.
  mm.add(`${MQ.motionOk} and (min-width: 768px)`, () => {
    if (allowed()) bindSteps(root, true);
  });
  mm.add(`${MQ.motionOk} and (max-width: 767.98px)`, () => {
    if (allowed()) bindSteps(root, false);
  });

  document.documentElement.setAttribute("data-motion-ready", "");
  // Fonts can shift layout -> refresh trigger positions once they're in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  // Client sections that change height after mount (the services gallery, maps) would leave every trigger
  // below them stale (the rating count-up never fired), so re-measure whenever the page height settles.
  let height = root.offsetHeight;
  let timer = 0;
  const ro = new ResizeObserver(() => {
    if (Math.abs(root.offsetHeight - height) < 2) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      height = root.offsetHeight;
      ScrollTrigger.refresh();
    }, 200);
  });
  ro.observe(root);

  return () => {
    ro.disconnect();
    window.clearTimeout(timer);
    mm.revert();
  };
}

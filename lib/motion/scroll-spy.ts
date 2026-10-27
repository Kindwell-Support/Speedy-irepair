/**
 * Scroll-spy for in-page contents lists (Frontend hooks, docs/motion/HOOKS.md):
 *   - container: [data-animate="toc-spy"] (services index >=lg, policy TOC >=lg)
 *   - links:     a[data-toc-link="<section id>"] anywhere in the root (also /services jump
 *                chips <lg and the policy <details> list, which have no toc-spy container)
 *
 * Sets aria-current="true" on every link whose target is the active section (Frontend styles
 * that state with aria-[current=true]:). Not an animation, so it runs under reduced motion too.
 * Inside a toc-spy container it also adds a sliding active bar ([data-toc-indicator], 200ms)
 * that is transform-only; reduced motion = no transition (CSS).
 *
 * No GSAP: plain scroll listener + rAF (Lenis drives native scroll, so scroll events fire).
 * Exported through engine-impl (async engine chunk); useDataAnimate binds it per page. No-op when
 * the page has no [data-toc-link] (first-load flat).
 */
export type Cleanup = () => void;

const ACTIVE_LINE = 0.3; // a section is active once its top crosses 30% of the viewport

export function bindScrollSpy(root: HTMLElement): Cleanup {
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[data-toc-link]"));
  if (!links.length) return () => {};
  const ids = Array.from(new Set(links.map((a) => a.dataset.tocLink!).filter(Boolean)));
  const targets = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  if (!targets.length) return () => {};

  const navs = Array.from(root.querySelectorAll<HTMLElement>('[data-animate="toc-spy"]'));
  const indicators = navs.map((nav) => {
    const bar = document.createElement("span");
    bar.setAttribute("aria-hidden", "true");
    bar.setAttribute("data-toc-indicator", "");
    nav.appendChild(bar);
    nav.setAttribute("data-toc-ready", "");
    return { nav, bar };
  });

  let active: string | null = null;
  let raf = 0;

  const place = () => {
    for (const { nav, bar } of indicators) {
      const link = active
        ? nav.querySelector<HTMLElement>(`a[data-toc-link="${CSS.escape(active)}"]`)
        : null;
      if (!link || !nav.offsetParent) {
        bar.removeAttribute("data-visible");
        continue;
      }
      const n = nav.getBoundingClientRect();
      const l = link.getBoundingClientRect();
      // Imperative transform/height on a Motion-owned node (allowed in lib/motion).
      bar.style.transform = `translate3d(${l.left - n.left}px, ${l.top - n.top}px, 0)`;
      bar.style.height = `${l.height}px`;
      bar.setAttribute("data-visible", "");
    }
  };

  const setActive = (id: string | null) => {
    if (id === active) return;
    active = id;
    for (const a of links) {
      if (a.dataset.tocLink === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
    place();
    // Keep the active jump chip visible in its horizontal scroller (never scrolls the page).
    for (const a of links) {
      if (a.dataset.tocLink !== id) continue;
      const scroller = a.closest<HTMLElement>("nav");
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth || !scroller.offsetParent) continue;
      const s = scroller.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      if (r.left < s.left || r.right > s.right) {
        scroller.scrollTo({ left: scroller.scrollLeft + (r.left - s.left) - 16, behavior: "auto" });
      }
    }
  };

  const compute = () => {
    raf = 0;
    const line = window.innerHeight * ACTIVE_LINE;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let id: string | null = null;
    if (atBottom) id = targets[targets.length - 1].id;
    else
      for (const t of targets) {
        if (t.getBoundingClientRect().top - line <= 0) id = t.id;
        else break;
      }
    setActive(id);
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(compute);
  };
  const onResize = () => {
    onScroll();
    place();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  compute();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    if (raf) cancelAnimationFrame(raf);
    for (const a of links) a.removeAttribute("aria-current");
    for (const { nav, bar } of indicators) {
      bar.remove();
      nav.removeAttribute("data-toc-ready");
    }
  };
}

/**
 * Pre-hydration motion gate (server component; render inside <head>).
 *
 * Sets html[data-motion] BEFORE first paint:
 *   "ok"       -> JS on, motion allowed: [data-animate] elements start in their CSS "before" state.
 *   "reduce"   -> prefers-reduced-motion (or ?motion=reduce): everything visible, no motion.
 *   "fallback" -> failsafe: JS/hydration did not mark motion ready within 2.5s -> reveal everything.
 * No-JS users never get the attribute, so all content is visible (CSS gates on [data-motion="ok"]).
 * The motion runtime sets html[data-motion-ready] once bindings are live.
 */
const BOOT = `(function(){var d=document.documentElement;try{var q=/[?&]motion=reduce/.test(location.search);var r=q||matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-motion',r?'reduce':'ok');if(!r){setTimeout(function(){if(!d.hasAttribute('data-motion-ready'))d.setAttribute('data-motion','fallback')},2500)}}catch(e){}})();`;

export function MotionBootScript() {
  return <script id="motion-boot" dangerouslySetInnerHTML={{ __html: BOOT }} />;
}

export const MOTION_BOOT_SCRIPT = BOOT;

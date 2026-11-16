import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export interface GsapBundle {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
}

let pending: Promise<GsapBundle> | null = null;
let gate: Promise<void> | null = null;

/**
 * Resolves on the first scroll / pointer / key interaction or when the browser is idle (max ~2.5 s),
 * whichever comes first — scroll choreography is never on the critical rendering path.
 */
export function afterFirstInteraction(): Promise<void> {
  if (typeof window === 'undefined') return new Promise(() => {});
  if (!gate) {
    gate = new Promise(resolve => {
      const events = ['scroll', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
      const done = () => {
        events.forEach(e => window.removeEventListener(e, done));
        resolve();
      };
      events.forEach(e => window.addEventListener(e, done, { passive: true, once: true }));
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(done, { timeout: 2500 });
      else window.setTimeout(done, 1500);
    });
  }
  return gate;
}

/** loadGsap(), but only after the first interaction / idle period. */
export function loadGsapDeferred(): Promise<GsapBundle> {
  return afterFirstInteraction().then(loadGsap);
}

/** Lazily loads GSAP + ScrollTrigger once (separate chunk; never blocks first paint). */
export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
      const gsap = g.gsap;
      const ScrollTrigger = st.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      installRefreshLifecycle(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return pending;
}

/**
 * Keeps trigger positions correct when layout changes after they were measured:
 *  - web fonts finishing (text reflow),
 *  - lazily mounted content changing the document height (LazyMount, route changes),
 *  - mobile address-bar show/hide is ignored (no jitter from viewport-height resizes).
 */
function installRefreshLifecycle(ScrollTrigger: GsapBundle['ScrollTrigger']): void {
  if (typeof window === 'undefined') return;
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  let timer = 0;
  let lastHeight = document.documentElement.scrollHeight;
  const ro = new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
  });
  ro.observe(document.body);
}

import type Lenis from 'lenis';
import { hasFinePointer, prefersReducedMotion } from './prefs';
import { afterFirstInteraction, loadGsap } from './gsap';
import { DURATION } from './motion-tokens';

const SECTION_SCROLL_DURATION = DURATION.scroll;

/**
 * Scrolling utilities. Native scroll is the baseline everywhere; Lenis smoothing is layered on top only for
 * fine-pointer devices without a reduced-motion preference, and is wired into GSAP's ticker so ScrollTrigger
 * stays in sync.
 */
let lenis: Lenis | null = null;
/** Settles once a pending Lenis initialisation has finished (or failed); null when none is in flight. */
let lenisSettling: Promise<void> | null = null;
let lockCount = 0;
/** Ref-counted shared instance: every caller gets a release function; the last release destroys Lenis. */
let users = 0;
let creating: Promise<void> | null = null;
let teardown: (() => void) | null = null;

function destroyIfUnused() {
  if (users > 0 || !teardown) return;
  teardown();
  teardown = null;
  creating = null;
}

/**
 * Starts (or joins) the shared smooth scroller. Overlapping calls — e.g. React StrictMode mounting an effect twice —
 * share one instance instead of creating a second one whose teardown would break the first.
 */
export function initSmoothScroll(): Promise<() => void> {
  if (typeof window === 'undefined' || prefersReducedMotion() || !hasFinePointer()) return Promise.resolve(() => {});
  users += 1;
  if (!creating) {
    const run = createSmoothScroll().then(
      t => {
        teardown = t;
        destroyIfUnused();
      },
      () => {
        if (creating === run) creating = null;
      },
    );
    creating = run;
    lenisSettling = run;
    void run.then(() => {
      if (lenisSettling === run) lenisSettling = null;
    });
  }
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    users -= 1;
    destroyIfUnused();
  };
  return creating.then(() => release);
}

async function createSmoothScroll(): Promise<() => void> {
  await afterFirstInteraction();
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), loadGsap()]);
  const instance = new LenisCtor({ lerp: 0.12, smoothWheel: true, anchors: false, autoRaf: false });
  lenis = instance;
  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  if (lockCount > 0) instance.stop();
  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

export function scrollToElement(el: HTMLElement | null, opts: { immediate?: boolean } = {}): void {
  if (!el) return;
  const immediate = opts.immediate || prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(el, { immediate, duration: SECTION_SCROLL_DURATION });
    return;
  }
  if (lenisSettling && !immediate) {
    // Lenis and GSAP load on the first interaction, which is often the very click that asked for this scroll.
    // A native smooth scroll started now would be cancelled by ScrollTrigger.refresh(), which restores the
    // scroll position with an instant scrollTo — so wait for the smooth scroller (or its failure) instead.
    void lenisSettling.then(() => scrollToElement(el, opts));
    return;
  }
  el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' });
}

export function scrollToId(id: string, opts: { immediate?: boolean } = {}): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToElement(el, opts);
  return true;
}

/** Instant by default (scroll restoration); `smooth` uses the same easing as section navigation. */
export function scrollToY(y: number, opts: { smooth?: boolean } = {}): void {
  const smooth = Boolean(opts.smooth) && !prefersReducedMotion();
  if (lenis) {
    // Restores run right after a page swap, before Lenis' ResizeObserver has seen the new document height: its
    // cached scroll limit (of the previous, shorter page) would clamp the target. Re-measure first.
    lenis.resize();
    lenis.scrollTo(y, smooth ? { duration: SECTION_SCROLL_DURATION } : { immediate: true, force: true });
  } else window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
}

/** Ref-counted scroll lock for dialogs / the mobile menu. Preserves the scrollbar gutter to avoid layout shift. */
export function lockScroll(): () => void {
  lockCount += 1;
  if (lockCount === 1) {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-gap', `${gap}px`);
    document.documentElement.classList.add('is-scroll-locked');
    lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) {
      document.documentElement.classList.remove('is-scroll-locked');
      document.documentElement.style.removeProperty('--scrollbar-gap');
      lenis?.start();
    }
  };
}

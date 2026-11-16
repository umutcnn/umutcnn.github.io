import type Lenis from 'lenis';
import { hasFinePointer, prefersReducedMotion } from './prefs';
import { afterFirstInteraction, loadGsap } from './gsap';

/**
 * Scrolling utilities. Native scroll is the baseline everywhere; Lenis smoothing is layered on top only for
 * fine-pointer devices without a reduced-motion preference, and is wired into GSAP's ticker so ScrollTrigger
 * stays in sync.
 */
let lenis: Lenis | null = null;
let lockCount = 0;

export async function initSmoothScroll(): Promise<() => void> {
  if (typeof window === 'undefined' || lenis || prefersReducedMotion() || !hasFinePointer()) return () => {};
  await afterFirstInteraction();
  if (lenis) return () => {};
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
    lenis.scrollTo(el, { immediate, duration: 1.1 });
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

export function scrollToY(y: number): void {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: 'auto' });
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

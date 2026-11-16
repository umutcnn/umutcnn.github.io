import { useEffect, type RefObject } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../../lib/prefs';

/**
 * Writes pointer position into CSS custom properties on the element:
 *   --gx / --gy  : pointer position in px (for a spotlight radial-gradient)
 *   --rx / --ry  : -1 … 1 relative position (for a subtle 3D tilt)
 * Transform/opacity-only consumers in CSS keep this compositor-friendly.
 */
export function usePointerGlow(ref: RefObject<HTMLElement | null>, enabled = true): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !hasFinePointer() || prefersReducedMotion()) return;
    let raf = 0;
    let lastEvent: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!lastEvent) return;
      const r = el.getBoundingClientRect();
      const x = lastEvent.clientX - r.left;
      const y = lastEvent.clientY - r.top;
      el.style.setProperty('--gx', `${x.toFixed(1)}px`);
      el.style.setProperty('--gy', `${y.toFixed(1)}px`);
      el.style.setProperty('--rx', ((x / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty('--ry', ((y / r.height) * 2 - 1).toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      lastEvent = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = () => el.classList.add('is-pointer');
    const onLeave = () => {
      el.classList.remove('is-pointer');
      el.style.setProperty('--rx', '0');
      el.style.setProperty('--ry', '0');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, enabled]);
}

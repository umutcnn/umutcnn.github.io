import { useEffect, useRef, type RefObject } from 'react';
import { acquirePointer, pointer, type PointerState } from '../lib/pointer';
import { hasFinePointer, prefersReducedMotion } from '../lib/prefs';

/**
 * Shared pointer position for rAF-driven effects. Returns the mutable singleton (no React state, no re-renders);
 * read it inside your own animation frame.
 */
export function usePointerPosition(): PointerState {
  useEffect(() => acquirePointer(), []);
  return pointer;
}

/**
 * Magnetic hover: the element drifts toward the pointer (max `strength` px) with a spring. Fine pointers only, no
 * effect under reduced motion. The shift is a fraction of the offset, so the hit area never leaves the cursor.
 */
export function useMagneticInteraction<T extends HTMLElement>(strength = 10): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2))) * strength;
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2))) * strength * 0.6;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
    };
  }, [strength]);
  return ref;
}

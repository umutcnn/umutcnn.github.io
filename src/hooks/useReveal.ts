import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * One shared IntersectionObserver for every reveal-on-scroll element (cheap: no per-element observers).
 * Elements receive the `is-in` class once and are then unobserved.
 */
let shared: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  if (!shared) {
    shared = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          shared?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
  }
  return shared;
}

export function observeReveal(el: Element, onReveal?: () => void): () => void {
  const io = getObserver();
  if (!io) {
    el.classList.add('is-in');
    onReveal?.();
    return () => {};
  }
  if (onReveal) callbacks.set(el, onReveal);
  io.observe(el);
  return () => {
    callbacks.delete(el);
    io.unobserve(el);
  };
}

export function useReveal<T extends Element>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeReveal(el);
  }, []);
  return ref;
}

/** Boolean "has been in view" — for starting work lazily (canvas loops, lazy modules). */
export function useInView<T extends Element>(rootMargin = '200px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView];
}

/** Live visibility (true/false as it scrolls) — for pausing animation loops off-screen. */
export function useVisibility<T extends Element>(rootMargin = '0px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, visible];
}

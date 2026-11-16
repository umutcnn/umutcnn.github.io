import { useEffect, useRef, type RefObject } from 'react';

/**
 * Horizontal scrollers with a hidden scrollbar (tab strips) give no hint that more items exist. This marks the
 * element with `data-more-start` / `data-more-end` while content is hidden on that side (CSS draws an edge fade),
 * and scrolls the selected tab (`[aria-selected="true"]`) into view when `selectedKey` changes.
 */
export function useOverflowFade<T extends HTMLElement>(selectedKey?: unknown): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.toggleAttribute('data-more-start', el.scrollLeft > 2);
      el.toggleAttribute('data-more-end', max - el.scrollLeft > 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(el);
    // tab labels change width on a language switch without resizing the strip itself
    Array.from(el.children).forEach(child => ro?.observe(child));
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const tab = el.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!tab) return;
    const left = tab.offsetLeft - el.offsetLeft;
    const target = Math.min(
      Math.max(0, left - (el.clientWidth - tab.offsetWidth) / 2),
      el.scrollWidth - el.clientWidth,
    );
    el.scrollTo({ left: target, behavior: 'auto' });
  }, [selectedKey]);

  return ref;
}

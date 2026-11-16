import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => !el.hasAttribute('inert') && el.getClientRects().length > 0,
  );
}

/**
 * Traps Tab focus inside `ref` while active, closes on Escape, and restores focus to the element that
 * was focused before opening (or `returnFocus`) when deactivated.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  opts: { initialFocus?: RefObject<HTMLElement | null>; returnFocus?: RefObject<HTMLElement | null> } = {},
): void {
  const { initialFocus, returnFocus } = opts;
  // Keep the latest callback without making it an effect dependency (a new closure must not re-run the trap).
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const returnTarget = returnFocus?.current ?? null;

    const first = initialFocus?.current ?? focusables(root)[0] ?? root;
    first.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        escapeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables(root);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0]!;
      const lastEl = items[items.length - 1]!;
      if (e.shiftKey && (document.activeElement === firstEl || !root.contains(document.activeElement))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      const target = returnTarget ?? previouslyFocused;
      if (target && document.contains(target)) target.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus, returnFocus]);
}

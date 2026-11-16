import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../lib/prefs';

/**
 * Route transitions via the View Transitions API (progressive enhancement).
 *  - Unsupported browser or reduced motion → the update runs immediately, nothing else changes.
 *  - A new navigation while one is animating skips the running transition (no stacked/broken states).
 *  - Shared elements: any element with `data-vt-media="<key>"` / `data-vt-title="<key>"` matching the transition key
 *    gets a `view-transition-name` on both the old and the new page, so a project card visual morphs into the
 *    case-study hero (and back).
 */
type ViewTransitionLike = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => ViewTransitionLike };

let current: ViewTransitionLike | null = null;

function tagShared(key: string | null) {
  document.querySelectorAll<HTMLElement>('[data-vt-tagged]').forEach(el => {
    el.style.removeProperty('view-transition-name');
    el.removeAttribute('data-vt-tagged');
  });
  if (!key) return;
  const tag = (selector: string, name: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    el.style.setProperty('view-transition-name', name);
    el.setAttribute('data-vt-tagged', '');
  };
  tag(`[data-vt-media="${CSS.escape(key)}"]`, 'vt-project-media');
  tag(`[data-vt-title="${CSS.escape(key)}"]`, 'vt-project-title');
}

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof (document as DocWithVT).startViewTransition === 'function';
}

/**
 * Runs a synchronous React update inside a view transition when possible.
 * `sharedKey` is the project slug whose visual/title should morph between the two pages.
 */
export function runPageTransition(update: () => void, sharedKey: string | null = null): Promise<void> {
  const doc = document as DocWithVT;
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }
  current?.skipTransition();
  tagShared(sharedKey);
  const vt = doc.startViewTransition!(() => {
    flushSync(update);
    tagShared(sharedKey);
  });
  current = vt;
  // A skipped transition rejects `ready`; that is expected (a newer navigation won), not an error.
  vt.ready.catch(() => {});
  vt.updateCallbackDone.catch(() => {});
  return vt.finished
    .catch(() => {})
    .finally(() => {
      if (current === vt) current = null;
      tagShared(null);
    });
}

export function usePageTransition() {
  return useCallback((update: () => void, sharedKey: string | null = null) => runPageTransition(update, sharedKey), []);
}

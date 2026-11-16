import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS, storage } from '../../lib/storage';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

/**
 * First visit always opens in the light theme (owner's choice); dark only after the visitor picks it,
 * and that choice is remembered.
 */
export function resolveInitialTheme(stored: string | null): Theme {
  return stored === 'dark' ? 'dark' : 'light';
}

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  storage.set(STORAGE_KEYS.theme, theme);
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Server snapshot is 'light'; the inline head script has already set the real theme before paint. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light');
}

/**
 * Inline script for index.html: applies the stored theme (default light) before first paint (no flash).
 * Kept in sync with resolveInitialTheme by the unit tests.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('${STORAGE_KEYS.theme}');var t=s==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='light';}document.documentElement.classList.add('js');})();`;

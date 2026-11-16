import { useCallback, useEffect } from 'react';
import { getDict, pick } from '../../lib/i18n';
import { buildPath } from '../../lib/router';
import { STORAGE_KEYS, storage } from '../../lib/storage';
import type { Locale, Localized } from '../../types/content';
import { BASE, useRouter } from './RouterProvider';

/** The URL is the single source of truth for the language (`/` = TR, `/en/` = EN). */
export function useLocale() {
  const { locale } = useRouter();
  const t = getDict(locale);
  const l = useCallback(<T,>(value: Localized<T>) => pick(value, locale), [locale]);
  return { locale, t, l };
}

/** Switches language on the current route, keeping the scroll position and section hash. */
export function useSwitchLocale() {
  const { route, navigate } = useRouter();
  return useCallback(
    (next: Locale) => {
      storage.set(STORAGE_KEYS.locale, next);
      const path = buildPath(next, route.name === 'notFound' ? { name: 'home' } : route, BASE);
      // Section links update the hash with replaceState, so read the live URL rather than router state.
      const hash = window.location.hash;
      navigate(`${path}${hash}`, { replace: true, scroll: 'preserve' });
    },
    [route, navigate],
  );
}

/**
 * Applies a stored language preference once, on the default-language URL only
 * (an explicit /en/ link is always respected). Also keeps <html lang> in sync.
 */
export function LocaleSync() {
  const { locale, route, navigate } = useRouter();

  useEffect(() => {
    const stored = storage.get(STORAGE_KEYS.locale);
    const explicitPrefix = /^\/(en|tr)(\/|$)/.test(window.location.pathname.slice(BASE.length - 1));
    if (stored === 'en' && locale === 'tr' && !explicitPrefix) {
      navigate(`${buildPath('en', route, BASE)}${window.location.hash}`, { replace: true, scroll: 'preserve' });
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

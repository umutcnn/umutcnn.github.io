import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { buildPath, parsePath, type Location, type Route } from '../../lib/router';
import { scrollToId, scrollToY } from '../../lib/scroll';
import { runPageTransition } from '../../motion/page-transition';
import type { Locale } from '../../types/content';

export const BASE = import.meta.env.BASE_URL;

/** What to do with the scroll position after navigation. */
export type ScrollIntent = 'top' | 'preserve' | { id: string } | { y: number };

interface NavigateOptions {
  replace?: boolean;
  scroll?: ScrollIntent;
}

interface RouterValue extends Location {
  hash: string;
  navigate: (to: string, opts?: NavigateOptions) => void;
  hrefFor: (locale: Locale, route: Route) => string;
}

const RouterContext = createContext<RouterValue | null>(null);

type Loc = Location & { hash: string };

/**
 * Optional async step before a route renders (e.g. loading a route chunk), so the page can switch in one
 * synchronous update inside a view transition instead of flashing a loading state.
 */
let preparer: ((next: Location) => Promise<void> | void) | null = null;
export function setNavigationPreparer(fn: typeof preparer): void {
  preparer = fn;
}

const pageKey = (l: Location) => `${l.locale}:${l.route.name}:${l.route.name === 'case' ? l.route.slug : ''}`;

/** Slug of the case study involved in a transition (new page first, else the page we leave). */
function sharedSlug(prev: Location, next: Location): string | null {
  if (next.route.name === 'case') return next.route.slug;
  if (prev.route.name === 'case') return prev.route.slug;
  return null;
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function readLocation(): Location & { hash: string } {
  return { ...parsePath(window.location.pathname, BASE), hash: window.location.hash.slice(1) };
}

export function RouterProvider({ initialPath, children }: { initialPath?: string; children: ReactNode }) {
  const [loc, setLoc] = useState<Location & { hash: string }>(() =>
    // The hash is not part of the server render, so it starts empty and is read after mount (hydration-safe).
    initialPath !== undefined ? { ...parsePath(initialPath, BASE), hash: '' } : { ...readLocation(), hash: '' },
  );
  const pendingScroll = useRef<ScrollIntent | null>(null);
  const locRef = useRef(loc);
  useIsoLayoutEffect(() => {
    locRef.current = loc;
  }, [loc]);
  const navToken = useRef(0);

  /** Applies a location: prepare (async) → single synchronous update, in a view transition when the page changes. */
  const commit = useCallback(async (next: Loc, intent: ScrollIntent) => {
    const token = ++navToken.current;
    const prev = locRef.current;
    const pageChanges = pageKey(prev) !== pageKey(next);
    if (pageChanges && preparer) await preparer(next);
    if (token !== navToken.current) return; // a newer navigation won
    const apply = () => {
      pendingScroll.current = intent;
      setLoc(next);
    };
    if (pageChanges && intent !== 'preserve') void runPageTransition(apply, sharedSlug(prev, next));
    else apply();
  }, []);

  // Initial deep link with a hash (e.g. /#work) → scroll after first paint.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      requestAnimationFrame(() => {
        setLoc(prev => ({ ...prev, hash: initialHash }));
        scrollToId(initialHash, { immediate: true });
      });
    } else {
      // Manual restoration also applies to reloads / returning visits: restore the saved position ourselves.
      const saved = (history.state as { scrollY?: number } | null)?.scrollY;
      if (typeof saved === 'number' && saved > 0) requestAnimationFrame(() => scrollToY(saved));
    }

    const onPop = (e: PopStateEvent) => {
      const state = e.state as { scrollY?: number } | null;
      const next = readLocation();
      let intent: ScrollIntent = typeof state?.scrollY === 'number' ? { y: state.scrollY } : 'top';
      if (next.hash && !(typeof state?.scrollY === 'number')) intent = { id: next.hash };
      void commit(next, intent);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [commit]);

  // Keep the current entry's scroll position up to date so back/forward can restore it.
  useEffect(() => {
    let t = 0;
    const save = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const state = (history.state as Record<string, unknown> | null) ?? {};
        history.replaceState({ ...state, scrollY: window.scrollY }, '');
      }, 120);
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', save);
    };
  }, []);

  useIsoLayoutEffect(() => {
    const intent = pendingScroll.current;
    if (!intent) return;
    pendingScroll.current = null;
    if (intent === 'preserve') return;
    if (intent === 'top') {
      scrollToY(0);
      return;
    }
    if ('y' in intent) {
      // Restore now (so a view transition captures the right position) and once more after layout settles.
      // The second pass is skipped if anything scrolled in between (the visitor already moved on): re-applying it
      // would yank the page back down and auto-hide the navbar.
      scrollToY(intent.y);
      const settled = window.scrollY;
      requestAnimationFrame(() => {
        if (window.scrollY === settled) scrollToY(intent.y);
      });
      return;
    }
    requestAnimationFrame(() => {
      if (!scrollToId(intent.id, { immediate: false })) scrollToY(0);
    });
  }, [loc]);

  const navigate = useCallback(
    (to: string, opts: NavigateOptions = {}) => {
      const url = new URL(to, window.location.href);
      const same = url.pathname === window.location.pathname;
      const state = (history.state as Record<string, unknown> | null) ?? {};
      history.replaceState({ ...state, scrollY: window.scrollY }, '');
      const target = `${url.pathname}${url.search}${url.hash}`;
      if (opts.replace) history.replaceState({ scrollY: window.scrollY, from: state.from }, '', target);
      // `from`: the page this entry was opened from, so "back" links can return there with history.back()
      else history.pushState({ scrollY: 0, from: window.location.pathname }, '', target);

      const hash = url.hash.slice(1);
      let intent: ScrollIntent = opts.scroll ?? (hash ? { id: hash } : 'top');
      if (same && hash && !opts.scroll) intent = { id: hash };
      void commit({ ...parsePath(url.pathname, BASE), hash }, intent);
    },
    [commit],
  );

  const hrefFor = useCallback((locale: Locale, route: Route) => buildPath(locale, route, BASE), []);

  const value = useMemo<RouterValue>(() => ({ ...loc, navigate, hrefFor }), [loc, navigate, hrefFor]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>');
  return ctx;
}

/** True when the previous history entry is `pathname` inside this app (so history.back() returns there). */
export function cameFrom(pathname: string): boolean {
  return (history.state as { from?: unknown } | null)?.from === pathname;
}

function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean; scroll?: ScrollIntent };

/** In-app link: real <a href> (works without JS, crawlable), intercepted for client-side navigation. */
export function Link({ to, replace, scroll, onClick, target, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      target={target}
      onClick={e => {
        onClick?.(e);
        if (!isPlainLeftClick(e) || (target && target !== '_self')) return;
        const url = new URL(to, window.location.href);
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        navigate(to, { replace, scroll });
      }}
      {...rest}
    />
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { Dict } from '../locales/tr';
import { scrollToId } from '../lib/scroll';
import { useRouter } from './providers/RouterProvider';

export const SECTION_IDS = [
  'home',
  'about',
  'work',
  'research',
  'achievements',
  'stack',
  'journey',
  'lab',
  'contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Desktop navigation (mirrors the brief); the mobile menu lists every section. */
export const PRIMARY_NAV: SectionId[] = ['about', 'work', 'research', 'achievements', 'lab', 'contact'];

export function sectionLabel(t: Dict, id: SectionId): string {
  return t.nav[id];
}

/** While a navigation-triggered scroll runs, the navbar must not auto-hide. */
export const navScrollLock = { until: 0 };

/** Navigate to a home-page section from anywhere (keeps URL hash in sync without polluting history). */
export function useGoToSection() {
  const { route, locale, hrefFor, navigate } = useRouter();
  return useCallback(
    (id: SectionId) => {
      navScrollLock.until = performance.now() + 1800;
      const home = hrefFor(locale, { name: 'home' });
      if (route.name === 'home') {
        const target = id === 'home' ? home : `${home}#${id}`;
        history.replaceState(history.state, '', target);
        scrollToId(id);
        const el = document.getElementById(id);
        // Move keyboard focus to the section for screen-reader and keyboard users.
        el?.focus({ preventScroll: true });
      } else {
        navigate(id === 'home' ? home : `${home}#${id}`);
      }
    },
    [route.name, locale, hrefFor, navigate],
  );
}

/** Which section currently sits under the reading line (≈ 40% from the top). */
export function useActiveSection(enabled: boolean): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    const els = SECTION_IDS.map(id => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

/** Light/dark tone of the section under the navbar, so the bar always keeps its contrast. */
export function useNavTone(dep: unknown): 'paper' | 'night' {
  const [tone, setTone] = useState<'paper' | 'night'>('paper');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-tone]'));
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setTone((e.target as HTMLElement).dataset.navTone === 'night' ? 'night' : 'paper');
        }
      },
      { rootMargin: '0px 0px -96% 0px' },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
  return tone;
}

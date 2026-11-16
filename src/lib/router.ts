import { DEFAULT_LOCALE, type Locale } from '../types/content';

export type Route = { name: 'home' } | { name: 'case'; slug: string } | { name: 'notFound' };

export interface Location {
  locale: Locale;
  route: Route;
}

/** Ensures a base like "/" or "/repo/" always starts and ends with a slash. */
export function normalizeBase(base: string): string {
  let b = base || '/';
  if (!b.startsWith('/')) b = `/${b}`;
  if (!b.endsWith('/')) b = `${b}/`;
  return b;
}

/** Parses a pathname (without query/hash) into locale + route. */
export function parsePath(pathname: string, base = '/'): Location {
  const b = normalizeBase(base);
  let rest = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\/+/, '');
  rest = rest.replace(/index\.html$/, '');
  const segments = rest
    .split('/')
    .filter(Boolean)
    .map(s => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });

  let locale: Locale = DEFAULT_LOCALE;
  if (segments[0] === 'en') {
    locale = 'en';
    segments.shift();
  } else if (segments[0] === 'tr') {
    // Turkish is the default and lives at the root; /tr/… is accepted as an alias.
    segments.shift();
  }

  if (segments.length === 0) return { locale, route: { name: 'home' } };
  if (segments[0] === 'work' && segments.length === 2 && /^[a-z0-9-]+$/.test(segments[1] ?? '')) {
    return { locale, route: { name: 'case', slug: segments[1]! } };
  }
  return { locale, route: { name: 'notFound' } };
}

/** Builds the canonical pathname for a locale + route (always with trailing slash). */
export function buildPath(locale: Locale, route: Route, base = '/'): string {
  const b = normalizeBase(base);
  const prefix = locale === DEFAULT_LOCALE ? '' : `${locale}/`;
  switch (route.name) {
    case 'home':
      return `${b}${prefix}`;
    case 'case':
      return `${b}${prefix}work/${route.slug}/`;
    case 'notFound':
      return `${b}${prefix}404/`;
  }
}

export function routesEqual(a: Route, b: Route): boolean {
  if (a.name !== b.name) return false;
  if (a.name === 'case' && b.name === 'case') return a.slug === b.slug;
  return true;
}

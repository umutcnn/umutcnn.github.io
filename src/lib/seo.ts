import { PROFILE } from '../content/profile';
import { findProjectBySlug } from '../content/projects';
import { AWARDS } from '../content/awards';
import { LOCALES, type Locale } from '../types/content';
import { buildPath, type Route } from './router';
import { getDict, pick } from './i18n';

export interface RouteMeta {
  lang: Locale;
  title: string;
  description: string;
  /** Absolute canonical URL; null for routes that must not be indexed (404). */
  canonical: string | null;
  alternates: { hreflang: string; href: string }[];
  ogImage: string;
  ogImageAlt: string;
  ogLocale: string;
  ogType: 'website' | 'article';
  robots: string;
  jsonLd: Record<string, unknown> | null;
}

const SITE = PROFILE.siteUrl.replace(/\/$/, '');
/** Deployment base path ("/" for the user site, "/repo/" for a project site). */
const BASE = import.meta.env.BASE_URL;
const path = (locale: Locale, route: Route) => buildPath(locale, route, BASE);

function abs(pathname: string): string {
  return `${SITE}${pathname}`;
}

/** Search engines show ~155–160 characters; longer text is cut at the last word boundary and ends with "…". */
export const DESCRIPTION_MAX = 160;
export function truncateAtWord(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max); // room for the ellipsis: the trimmed part below is always shorter than `max`
  const end = cut.search(/[\s,;:]+\S*$/);
  return `${(end > 0 ? cut.slice(0, end) : cut.slice(0, max - 1)).replace(/[\s,;:.]+$/, '')}…`;
}

/** Resolves a route; unknown case slugs or projects without a case study resolve to 404. */
export function resolveRoute(route: Route): Route {
  if (route.name === 'case') {
    const p = findProjectBySlug(route.slug);
    if (!p || !p.hasCaseStudy) return { name: 'notFound' };
  }
  return route;
}

export function personJsonLd(locale: Locale): Record<string, unknown> {
  const d = getDict(locale);
  const sameAs = [PROFILE.github, PROFILE.linkedin].filter(l => l.enabled).map(l => l.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: pick(PROFILE.role, locale),
    description: d.meta.description,
    url: abs(path(locale, { name: 'home' })),
    image: abs(`${BASE}profile/umut-can-yildiz-640.webp`),
    email: PROFILE.email.enabled ? PROFILE.email.value : undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Bursa', addressCountry: 'TR' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: locale === 'tr' ? PROFILE.education.university : PROFILE.education.universityEn,
    },
    award: AWARDS.filter(a => a.id.startsWith('teknofest')).map(
      a => `${pick(a.title, locale)} — ${pick(a.rank, locale)} (${a.year})`,
    ),
    knowsAbout: [
      'Artificial Intelligence',
      'Computer Vision',
      'Machine Learning',
      'Deep Learning',
      'Federated Learning',
      'Software Engineering',
    ],
    sameAs,
  };
}

export function getRouteMeta(locale: Locale, rawRoute: Route): RouteMeta {
  const route = resolveRoute(rawRoute);
  const d = getDict(locale);
  const base = {
    lang: locale,
    ogImage: abs(`${BASE}og-image.png`),
    ogImageAlt: d.meta.ogImageAlt,
    ogLocale: d.meta.ogLocale,
  };

  if (route.name === 'notFound') {
    return {
      ...base,
      title: d.meta.notFoundTitle,
      description: d.meta.description,
      canonical: null,
      alternates: [],
      ogType: 'website',
      robots: 'noindex, follow',
      jsonLd: null,
    };
  }

  const alternates: RouteMeta['alternates'] = LOCALES.map(l => ({ hreflang: l, href: abs(path(l, route)) }));
  alternates.push({ hreflang: 'x-default', href: abs(path('tr', route)) });

  if (route.name === 'case') {
    const p = findProjectBySlug(route.slug)!;
    const title = pick(p.title, locale);
    return {
      ...base,
      title: d.meta.caseTitle(title),
      description: truncateAtWord(`${pick(p.subtitle, locale)}. ${pick(p.overview, locale)}`),
      canonical: abs(path(locale, route)),
      alternates,
      ogType: 'article',
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: title,
        headline: pick(p.subtitle, locale),
        about: pick(p.overview, locale),
        dateCreated: p.year.slice(0, 4),
        inLanguage: locale,
        author: { '@type': 'Person', name: PROFILE.name, url: abs(path(locale, { name: 'home' })) },
        url: abs(path(locale, route)),
      },
    };
  }

  return {
    ...base,
    title: d.meta.title,
    description: d.meta.description,
    canonical: abs(path(locale, route)),
    alternates,
    ogType: 'website',
    robots: 'index, follow',
    jsonLd: personJsonLd(locale),
  };
}

/** Client-side head sync after in-app navigation (the static HTML already carries the initial tags). */
export function applyRouteMeta(meta: RouteMeta): void {
  const head = document.head;
  document.title = meta.title;
  document.documentElement.lang = meta.lang;
  // Upsert or remove one tag. Mirrors headFor() in scripts/prerender-routes.mjs.
  const meta_ = (key: 'name' | 'property', id: string, value: string | null) => {
    let el = head.querySelector(`meta[${key}="${id}"]`);
    if (value === null) return el?.remove();
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(key, id);
      head.appendChild(el);
    }
    el.setAttribute('content', value);
  };
  meta_('name', 'description', meta.description);
  meta_('name', 'robots', meta.robots);
  meta_('property', 'og:type', meta.ogType);
  meta_('property', 'og:title', meta.title);
  meta_('property', 'og:description', meta.description);
  meta_('property', 'og:locale', meta.ogLocale);
  meta_('property', 'og:image', meta.ogImage);
  meta_('property', 'og:image:alt', meta.ogImageAlt);
  meta_('property', 'og:url', meta.canonical);
  meta_('name', 'twitter:title', meta.title);
  meta_('name', 'twitter:description', meta.description);
  meta_('name', 'twitter:image', meta.ogImage);

  let canonical = head.querySelector('link[rel="canonical"]');
  if (!meta.canonical) canonical?.remove();
  else {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.canonical);
  }

  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  for (const alt of meta.alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = alt.hreflang;
    link.href = alt.href;
    head.appendChild(link);
  }

  head.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
  if (meta.jsonLd) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(meta.jsonLd);
    head.appendChild(script);
  }
}

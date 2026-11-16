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
      description: `${pick(p.subtitle, locale)}. ${pick(p.overview, locale)}`.slice(0, 300),
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
  document.title = meta.title;
  document.documentElement.lang = meta.lang;
  const set = (selector: string, attr: string, value: string | null) => {
    const el = document.head.querySelector(selector);
    if (el && value !== null) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', 'content', meta.description);
  set('meta[property="og:title"]', 'content', meta.title);
  set('meta[property="og:description"]', 'content', meta.description);
  set('meta[property="og:locale"]', 'content', meta.ogLocale);
  set('meta[name="robots"]', 'content', meta.robots);
  if (meta.canonical) {
    set('link[rel="canonical"]', 'href', meta.canonical);
    set('meta[property="og:url"]', 'content', meta.canonical);
  }
}

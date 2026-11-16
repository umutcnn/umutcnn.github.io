import { beforeEach, describe, expect, it } from 'vitest';
import { CASE_STUDIES } from '../../src/content/projects';
import { applyRouteMeta, getRouteMeta, truncateAtWord } from '../../src/lib/seo';
import { LOCALES } from '../../src/types/content';

describe('meta descriptions', () => {
  it('truncates at a word boundary with an ellipsis', () => {
    expect(truncateAtWord('short text', 160)).toBe('short text');
    expect(truncateAtWord('alpha beta gamma delta', 14)).toBe('alpha beta…');
    expect(truncateAtWord('alpha, beta gamma', 12)).toBe('alpha, beta…');
  });

  it('keeps every case-study description within 160 characters and never cuts a word', () => {
    for (const locale of LOCALES)
      for (const p of CASE_STUDIES) {
        const { description } = getRouteMeta(locale, { name: 'case', slug: p.slug });
        expect(description.length, `${locale} ${p.slug}`).toBeLessThanOrEqual(160);
        if (description.endsWith('…')) {
          const kept = description.slice(0, -1);
          const full = `${p.subtitle[locale]}. ${p.overview[locale]}`;
          expect(full.startsWith(kept), `${locale} ${p.slug}`).toBe(true);
          expect(/[\s,;:]/.test(full.charAt(kept.length)), `${locale} ${p.slug} cut mid-word`).toBe(true);
        }
      }
  });
});

describe('applyRouteMeta (client-side navigation)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  const q = (s: string) => document.head.querySelector(s);
  const qa = (s: string) => Array.from(document.head.querySelectorAll(s));

  it('creates and updates every route-dependent tag', () => {
    applyRouteMeta(getRouteMeta('tr', { name: 'home' }));
    applyRouteMeta(getRouteMeta('en', { name: 'case', slug: 'maks-cad-intelligence' }));
    const canonical = 'https://umutcnn.github.io/en/work/maks-cad-intelligence/';
    expect(document.documentElement.lang).toBe('en');
    expect(q('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical);
    expect(q('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical);
    expect(q('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(q('meta[name="twitter:title"]')?.getAttribute('content')).toMatch(/MAKS CAD Intelligence/);
    expect(q('meta[name="twitter:description"]')?.getAttribute('content')).toBe(
      q('meta[name="description"]')?.getAttribute('content'),
    );
    expect(qa('link[rel="alternate"][hreflang]').map(l => l.getAttribute('hreflang'))).toEqual([
      'tr',
      'en',
      'x-default',
    ]);
    const ld = qa('script[type="application/ld+json"]');
    expect(ld).toHaveLength(1);
    expect(JSON.parse(ld[0]!.textContent!)['@type']).toBe('CreativeWork');
  });

  it('drops canonical, alternates and structured data on a 404', () => {
    applyRouteMeta(getRouteMeta('tr', { name: 'case', slug: 'maks-cad-intelligence' }));
    applyRouteMeta(getRouteMeta('tr', { name: 'notFound' }));
    expect(q('link[rel="canonical"]')).toBeNull();
    expect(q('meta[property="og:url"]')).toBeNull();
    expect(qa('link[rel="alternate"][hreflang]')).toHaveLength(0);
    expect(qa('script[type="application/ld+json"]')).toHaveLength(0);
    expect(q('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });
});

import { describe, expect, it } from 'vitest';
import { en } from '../../src/locales/en';
import { tr } from '../../src/locales/tr';
import { formatMonth, getDict, pick, upper } from '../../src/lib/i18n';
import { buildPath, normalizeBase, parsePath, routesEqual } from '../../src/lib/router';

describe('router', () => {
  it('parses home, english home and case routes', () => {
    expect(parsePath('/')).toEqual({ locale: 'tr', route: { name: 'home' } });
    expect(parsePath('/en/')).toEqual({ locale: 'en', route: { name: 'home' } });
    expect(parsePath('/en')).toEqual({ locale: 'en', route: { name: 'home' } });
    expect(parsePath('/work/autonomous-robotaxi/')).toEqual({
      locale: 'tr',
      route: { name: 'case', slug: 'autonomous-robotaxi' },
    });
    expect(parsePath('/en/work/autonomous-robotaxi')).toEqual({
      locale: 'en',
      route: { name: 'case', slug: 'autonomous-robotaxi' },
    });
  });

  it('accepts /tr/ as an alias and index.html suffixes', () => {
    expect(parsePath('/tr/work/x/')).toEqual({ locale: 'tr', route: { name: 'case', slug: 'x' } });
    expect(parsePath('/index.html')).toEqual({ locale: 'tr', route: { name: 'home' } });
  });

  it('returns notFound for unknown or malformed paths', () => {
    expect(parsePath('/nope/').route).toEqual({ name: 'notFound' });
    expect(parsePath('/work/').route).toEqual({ name: 'notFound' });
    expect(parsePath('/work/a/b/').route).toEqual({ name: 'notFound' });
    expect(parsePath('/work/Bad_Slug/').route).toEqual({ name: 'notFound' });
    expect(parsePath('/work/%E0%A4%A/').route).toEqual({ name: 'notFound' });
  });

  it('round-trips through buildPath, including a sub-folder base', () => {
    const routes = [{ name: 'home' }, { name: 'case', slug: 'maks-enterprise-erp' }] as const;
    for (const base of ['/', '/repo/']) {
      for (const locale of ['tr', 'en'] as const) {
        for (const route of routes) {
          const p = buildPath(locale, route, base);
          expect(p.startsWith(base)).toBe(true);
          expect(p.endsWith('/')).toBe(true);
          expect(parsePath(p, base)).toEqual({ locale, route });
        }
      }
    }
  });

  it('normalizes bases and compares routes', () => {
    expect(normalizeBase('repo')).toBe('/repo/');
    expect(normalizeBase('')).toBe('/');
    expect(routesEqual({ name: 'case', slug: 'a' }, { name: 'case', slug: 'a' })).toBe(true);
    expect(routesEqual({ name: 'case', slug: 'a' }, { name: 'case', slug: 'b' })).toBe(false);
    expect(routesEqual({ name: 'home' }, { name: 'notFound' })).toBe(false);
  });
});

function shape(v: unknown): unknown {
  if (typeof v === 'function') return 'fn';
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object')
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map(k => [k, shape((v as Record<string, unknown>)[k])]),
    );
  return typeof v;
}

describe('i18n', () => {
  it('has identical dictionary shapes in TR and EN (incl. array lengths)', () => {
    expect(shape(en)).toEqual(shape(tr));
  });

  it('has no empty strings in either language', () => {
    const walk = (v: unknown, path: string) => {
      if (typeof v === 'string') expect(v.trim(), path).not.toBe('');
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    walk(tr, 'tr');
    walk(en, 'en');
  });

  it('picks values and falls back to Turkish', () => {
    expect(pick({ tr: 'a', en: 'b' }, 'en')).toBe('b');
    expect(pick({ tr: 'a' } as unknown as { tr: string; en: string }, 'en')).toBe('a');
    expect(getDict('en').nav.work).toBe('Work');
  });

  it('formats months per locale and keeps invalid input', () => {
    expect(formatMonth('2025-07', 'tr')).toBe('Tem 2025');
    expect(formatMonth('2025-07', 'en')).toBe('Jul 2025');
    expect(formatMonth('2025-13', 'en')).toBe('2025-13');
    expect(formatMonth('bad', 'tr')).toBe('bad');
  });

  it('upper-cases with Turkish dotted İ only in Turkish', () => {
    expect(upper('bilişim', 'tr')).toBe('BİLİŞİM');
    expect(upper('engineer', 'en')).toBe('ENGINEER');
  });
});

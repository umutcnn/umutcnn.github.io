import { en } from '../locales/en';
import { tr, type Dict } from '../locales/tr';
import type { Locale, Localized } from '../types/content';

const DICTS: Record<Locale, Dict> = { tr, en };

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}

/** Picks the value for `locale`, falling back to Turkish (the default, always complete). */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.tr;
}

/** "2025-07" → "Tem 2025" / "Jul 2025". Invalid input is returned unchanged. */
export function formatMonth(ym: string, locale: Locale): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  const month = Number(m[2]);
  const name = getDict(locale).common.months[month - 1];
  return name ? `${name} ${m[1]}` : ym;
}

/** Locale-aware upper-casing (Turkish dotted/dotless i). */
export function upper(text: string, locale: Locale): string {
  return text.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US');
}

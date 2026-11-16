import { Moon, Sun } from 'lucide-react';
import { useLocale, useSwitchLocale } from '../../app/providers/LocaleProvider';
import { setTheme, useTheme } from '../../app/providers/theme';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, t } = useLocale();
  const switchLocale = useSwitchLocale();
  const next = locale === 'tr' ? 'en' : 'tr';
  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={() => switchLocale(next)}
      aria-label={`TR / EN — ${t.a11y.switchTo}`}
      lang={next}
      data-testid="lang-toggle"
    >
      <span aria-hidden="true" className={locale === 'tr' ? 'is-on' : ''}>
        TR
      </span>
      <span aria-hidden="true" className="lang-toggle__sep">
        /
      </span>
      <span aria-hidden="true" className={locale === 'en' ? 'is-on' : ''}>
        EN
      </span>
    </button>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useLocale();
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? t.a11y.toDark : t.a11y.toLight}
      data-testid="theme-toggle"
    >
      <Sun className="theme-toggle__sun" aria-hidden="true" />
      <Moon className="theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}

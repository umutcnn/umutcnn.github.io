import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { SECTION_IDS, useGoToSection, type SectionId } from '../../app/navigation';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useRouter } from '../../app/providers/RouterProvider';
import { PROFILE } from '../../content/profile';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { prefersReducedMotion } from '../../lib/prefs';
import { lockScroll } from '../../lib/scroll';
import { LanguageToggle, ThemeToggle } from './Controls';

interface Props {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
  current: string | null;
}

export function MobileMenu({ open, onClose, returnFocus, current }: Props) {
  const { t } = useLocale();
  const { locale, hrefFor } = useRouter();
  const goTo = useGoToSection();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const homeHref = hrefFor(locale, { name: 'home' });
  // Keep the panel mounted while the CSS exit animation plays.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  const close = useCallback(() => onClose(), [onClose]);
  useFocusTrap(panel, open && mounted, close, { initialFocus: closeBtn, returnFocus });

  useEffect(() => {
    if (open || !mounted) return;
    const id = window.setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : 520);
    return () => window.clearTimeout(id);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    return lockScroll();
  }, [open]);

  // Close automatically when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && close();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open, close]);

  const onPick = (id: SectionId) => {
    close();
    // let the scroll lock release before scrolling
    requestAnimationFrame(() => goTo(id));
  };

  return (
    <>
      {mounted && (
        <div
          id="mobile-menu"
          ref={panel}
          className={`mobile-menu tone-night ${open ? 'is-open' : 'is-closing'}`}
          role="dialog"
          aria-modal="true"
          aria-label={t.a11y.sectionsNav}
          data-testid="mobile-menu"
        >
          <div className="mobile-menu__top container-x">
            <span className="navbar__logo-mark" aria-hidden="true">
              {PROFILE.monogram}
              <i>.</i>
            </span>
            <button ref={closeBtn} type="button" className="icon-btn" onClick={close} aria-label={t.a11y.closeMenu}>
              <X aria-hidden="true" />
            </button>
          </div>

          <nav className="mobile-menu__nav container-x" aria-label={t.a11y.sectionsNav}>
            <ol>
              {SECTION_IDS.map((id, i) => (
                <li key={id} style={{ '--i': i } as CSSProperties}>
                  <a
                    href={id === 'home' ? homeHref : `${homeHref}#${id}`}
                    aria-current={current === id ? 'location' : undefined}
                    onClick={e => {
                      e.preventDefault();
                      onPick(id);
                    }}
                  >
                    <span className="mobile-menu__num">{String(i + 1).padStart(2, '0')}</span>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mobile-menu__foot container-x">
            <div className="mobile-menu__controls">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {PROFILE.email.enabled && (
              <a className="mobile-menu__mail" href={PROFILE.email.href}>
                {PROFILE.email.value}
              </a>
            )}
            {PROFILE.cv.enabled && (
              <a
                className="label"
                href={`${import.meta.env.BASE_URL}${PROFILE.cv.href}`}
                target="_blank"
                rel="noopener"
              >
                {t.nav.cv} ↗<span className="sr-only"> {t.a11y.newTab}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

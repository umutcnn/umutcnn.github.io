import { Menu } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PRIMARY_NAV, navScrollLock, useActiveSection, useGoToSection, useNavTone } from '../../app/navigation';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useRouter } from '../../app/providers/RouterProvider';
import { PROFILE } from '../../content/profile';
import { LanguageToggle, ThemeToggle } from './Controls';
import { MobileMenu } from './MobileMenu';
import './Navbar.css';

export function Navbar() {
  const { t } = useLocale();
  const { route, locale, hrefFor, hash } = useRouter();
  const goTo = useGoToSection();
  const isHome = route.name === 'home';
  const active = useActiveSection(isHome);
  const tone = useNavTone(`${route.name}-${locale}`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        // hide while reading downwards, reveal on any upward intent
        if (performance.now() < navScrollLock.until) setHidden(false);
        else if (Math.abs(y - lastY) > 6) setHidden(y > lastY && y > window.innerHeight * 0.9);
        lastY = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const homeHref = hrefFor(locale, { name: 'home' });
  const current = isHome ? (active ?? (hash || null)) : null;

  return (
    <>
      <header
        className={`navbar ${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''}`}
        data-tone={tone}
        onFocus={() => setHidden(false)}
      >
        <div className="navbar__inner container-x">
          <a
            className="navbar__logo"
            href={homeHref}
            aria-label={`${PROFILE.monogram}. — ${t.a11y.home}`}
            onClick={e => {
              e.preventDefault();
              goTo('home');
            }}
          >
            <span className="navbar__logo-mark" aria-hidden="true">
              {PROFILE.monogram}
              <i>.</i>
            </span>
          </a>

          <nav className="navbar__links" aria-label={t.a11y.primaryNav}>
            <ul>
              {PRIMARY_NAV.map(id => (
                <li key={id}>
                  <a
                    href={`${homeHref}#${id}`}
                    className={current === id ? 'is-active' : ''}
                    aria-current={current === id ? 'location' : undefined}
                    onClick={e => {
                      e.preventDefault();
                      goTo(id);
                    }}
                  >
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar__controls">
            <LanguageToggle />
            <ThemeToggle />
            <button
              ref={menuButton}
              type="button"
              className="icon-btn navbar__menu-btn"
              aria-label={t.a11y.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
              data-testid="menu-open"
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} returnFocus={menuButton} current={current} />
    </>
  );
}

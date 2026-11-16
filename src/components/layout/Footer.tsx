import { ArrowUp } from 'lucide-react';
import { useGoToSection } from '../../app/navigation';
import { useLocale } from '../../app/providers/LocaleProvider';
import { PROFILE } from '../../content/profile';

export function Footer() {
  const { t } = useLocale();
  const goTo = useGoToSection();
  return (
    <footer className="site-footer tone-night" data-nav-tone="night">
      <div className="container-x site-footer__inner">
        <p className="label">
          © {PROFILE.year} {PROFILE.name}. {t.footer.rights}
        </p>
        <p className="label">{t.footer.built}</p>
        <button type="button" className="label site-footer__top" onClick={() => goTo('home')}>
          {t.footer.top} <ArrowUp aria-hidden="true" size={14} />
        </button>
      </div>
    </footer>
  );
}

export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true" />;
}

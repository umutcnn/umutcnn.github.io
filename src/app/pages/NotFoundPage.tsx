import { ArrowLeft } from 'lucide-react';
import { useLocale } from '../providers/LocaleProvider';
import { Link, useRouter } from '../providers/RouterProvider';

export function NotFoundPage() {
  const { t } = useLocale();
  const { locale, hrefFor } = useRouter();
  return (
    <section className="not-found tone-night grid-paper" data-nav-tone="night" aria-labelledby="nf-title">
      <div className="container-x not-found__inner">
        <p className="not-found__code" aria-hidden="true">
          {t.notFound.code}
        </p>
        <h1 id="nf-title" className="section-title">
          {t.notFound.title}
        </h1>
        <p className="lead">{t.notFound.body}</p>
        <Link className="btn btn--signal" to={hrefFor(locale, { name: 'home' })}>
          <span className="btn__icon" aria-hidden="true">
            <ArrowLeft />
          </span>
          {t.notFound.home}
        </Link>
      </div>
    </section>
  );
}

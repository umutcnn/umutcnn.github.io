import { Lock } from 'lucide-react';
import { GithubIcon } from '../../components/ui/BrandIcons';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { ARCHIVE_PROJECTS } from '../../content/projects';
import { TECHS } from '../../content/skills';
import type { ProjectCategory } from '../../types/content';

export function ProjectArchive() {
  const { t, l } = useLocale();
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all');
  const categories = useMemo(() => Array.from(new Set(ARCHIVE_PROJECTS.map(p => p.category))), []);
  const items = filter === 'all' ? ARCHIVE_PROJECTS : ARCHIVE_PROJECTS.filter(p => p.category === filter);

  return (
    <div className="archive" aria-labelledby="archive-title">
      <div className="archive__head">
        <div>
          <p className="label">{t.work.archiveLabel}</p>
          <h3 id="archive-title" className="archive__title">
            {t.work.archiveTitle}
          </h3>
        </div>
        <div className="archive__filters" role="group" aria-label={t.work.filterLabel}>
          {(['all', ...categories] as const).map(c => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${filter === c ? 'is-on' : ''}`}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c === 'all' ? t.work.filterAll : t.categories[c]}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {items.length}
      </p>
      {items.length === 0 ? (
        <p className="muted">{t.work.noResults}</p>
      ) : (
        <ul className="archive__grid" data-testid="archive-list">
          {items.map(p => (
            <li key={p.id} className="archive-card">
              <p className="label archive-card__meta">
                <span>{t.categories[p.category]}</span>
                <span>{p.year}</span>
              </p>
              <h4 className="archive-card__title">{l(p.title)}</h4>
              <p className="archive-card__sub">{l(p.subtitle)}</p>
              <p className="archive-card__text">{l(p.overview)}</p>
              <ul className="archive-card__tech">
                {p.technologies.map(id => (
                  <li key={id}>{TECHS[id].label}</li>
                ))}
              </ul>
              <div className="archive-card__foot">
                <span className="label">{l(p.role)}</span>
                {p.repositoryUrl?.enabled ? (
                  <a
                    className="archive-card__link"
                    href={p.repositoryUrl.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon size={14} /> {t.work.repository}
                    <span className="sr-only">
                      {' '}
                      — {l(p.title)} {t.a11y.newTab}
                    </span>
                  </a>
                ) : p.visibility === 'confidential' ? (
                  <span className="label archive-card__lock">
                    <Lock size={12} aria-hidden="true" /> {t.visibility.confidential}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

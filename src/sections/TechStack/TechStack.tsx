import { ArrowUpRight, X } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Link, useRouter } from '../../app/providers/RouterProvider';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DOMAINS, projectsForDomain } from '../../content/constellation';
import { ARCHIVE_PROJECTS, FEATURED_PROJECTS } from '../../content/projects';
import { projectsForTech } from '../../content/relations';
import { SKILL_CLUSTERS, TECHS } from '../../content/skills';
import { Constellation, type Selection } from './Constellation';
import './TechStack.css';

const ALL = [...FEATURED_PROJECTS, ...ARCHIVE_PROJECTS];

/**
 * Knowledge map. Wide screens: interactive constellation (domains → technologies → projects).
 * Narrow screens: the same data as filterable clusters (no complex graph forced onto a phone).
 * Both drive one shared "linked projects" panel; relations come from the content model.
 */
export function TechStack() {
  const { t, l } = useLocale();
  const { locale, hrefFor } = useRouter();
  const [selection, setSelection] = useState<Selection>(null);

  const linked =
    selection === null
      ? []
      : selection.kind === 'tech'
        ? projectsForTech(selection.id)
        : projectsForDomain(DOMAINS.find(d => d.id === selection.id)!);
  const linkedIds = new Set(linked.map(p => p.id));
  const selectionLabel =
    selection === null
      ? null
      : selection.kind === 'tech'
        ? t.stack.usedIn(TECHS[selection.id].label)
        : t.stack.inDomain(l(DOMAINS.find(d => d.id === selection.id)!.title));

  return (
    <section
      id="stack"
      className="section stack tone-paper"
      data-nav-tone="paper"
      aria-labelledby="stack-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader
          index={6}
          label={t.stack.label}
          title={t.stack.title}
          titleId="stack-title"
          intro={t.stack.intro}
        />

        <div className="stack__grid">
          <div className="stack__map">
            <Reveal className="stack__constellation">
              <Constellation selection={selection} onSelect={setSelection} />
            </Reveal>

            <div className="clusters">
              {SKILL_CLUSTERS.map((c, i) => (
                <Reveal key={c.id} className="cluster" index={i}>
                  <div className="cluster__head">
                    <span className="label">{c.index}</span>
                    <h3 className="cluster__title">{l(c.title)}</h3>
                  </div>
                  <p className="cluster__blurb">{l(c.blurb)}</p>
                  <ul className="cluster__techs">
                    {c.techs.map(id => {
                      const count = projectsForTech(id).length;
                      const on = selection?.kind === 'tech' && selection.id === id;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            className={`tech-btn ${on ? 'is-on' : ''} ${count === 0 ? 'is-empty' : ''}`}
                            aria-pressed={on}
                            onClick={() => setSelection(on ? null : { kind: 'tech', id })}
                            data-testid={`tech-${id}`}
                          >
                            {TECHS[id].label}
                            {count > 0 && (
                              <span className="tech-btn__count" aria-label={t.stack.projectsCount(count)}>
                                {count}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>

          <aside className="stack__panel tone-night" aria-labelledby="stack-panel-title">
            <div className="stack__panel-head">
              <p id="stack-panel-title" className="label">
                {selectionLabel ?? t.stack.selectHint}
              </p>
              {selection && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSelection(null)}
                  aria-label={t.stack.clear}
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              {selectionLabel ? `${selectionLabel}: ${t.stack.projectsCount(linked.length)}` : ''}
            </p>
            {selection && linked.length === 0 && <p className="stack__none">{t.stack.none}</p>}
            <ul className="stack__projects" data-testid="stack-projects">
              {ALL.map(p => {
                const on = linkedIds.has(p.id);
                const dim = selection !== null && !on;
                return (
                  <li
                    key={p.id}
                    className={`stack-row ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`}
                    aria-hidden={dim || undefined}
                  >
                    {p.hasCaseStudy ? (
                      <Link
                        to={hrefFor(locale, { name: 'case', slug: p.slug })}
                        className="stack-row__link"
                        tabIndex={dim ? -1 : undefined}
                      >
                        <span>{l(p.title)}</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="stack-row__link">
                        <span>{l(p.title)}</span>
                      </span>
                    )}
                    <span className="label stack-row__cat">{t.categories[p.category]}</span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

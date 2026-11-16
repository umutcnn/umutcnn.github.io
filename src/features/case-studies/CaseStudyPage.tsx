import { ArrowLeft, ArrowRight, ArrowUpRight, Lock } from 'lucide-react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Link, useRouter } from '../../app/providers/RouterProvider';
import { Reveal } from '../../components/motion/Reveal';
import { ArchitectureGraph, PermissionMatrix } from '../../components/visualizations/ArchitectureGraph';
import { ProjectVisual } from '../../components/visualizations/ProjectVisual';
import { findProjectBySlug } from '../../content/projects';
import { nextCaseStudy, relatedProjects } from '../../content/relations';
import { TECHS } from '../../content/skills';
import type { Localized } from '../../types/content';
import { Gallery } from './Gallery';
import './CaseStudy.css';

type SectionKey =
  | 'problem'
  | 'approach'
  | 'tech'
  | 'architecture'
  | 'implementation'
  | 'challenges'
  | 'results'
  | 'limitations'
  | 'learnings';

function Block({ id, title, children, index }: { id: string; title: string; children: ReactNode; index: number }) {
  return (
    <Reveal as="section" id={id} className="cs-block" index={0}>
      <h2 className="cs-block__title">
        <span className="label">{String(index).padStart(2, '0')}</span>
        {title}
      </h2>
      <div className="cs-block__body">{children}</div>
    </Reveal>
  );
}

export default function CaseStudyPage({ slug }: { slug: string }) {
  const { t, l } = useLocale();
  const { locale, hrefFor } = useRouter();
  const project = findProjectBySlug(slug)!;
  const next = nextCaseStudy(slug);
  const related = relatedProjects(project).filter(p => p.hasCaseStudy);
  const homeWork = `${hrefFor(locale, { name: 'home' })}#work`;
  const s = t.caseStudy.sections;

  const textSections: { key: SectionKey; value?: Localized<string[]> }[] = [
    { key: 'problem', value: project.problem },
    { key: 'approach', value: project.approach },
    { key: 'tech', value: project.techRationale },
    { key: 'architecture', value: project.architecture },
    { key: 'implementation', value: project.implementation },
    { key: 'challenges', value: project.challenges },
    { key: 'results', value: project.results },
    { key: 'limitations', value: project.limitations },
    { key: 'learnings', value: project.learnings },
  ];
  const present = textSections.filter(x => x.value && l(x.value).length > 0);
  const archItems = project.gallery.filter(g => g.kind === 'architecture');
  const toc = [
    ...present.map(x => ({ id: `cs-${x.key}`, label: s[x.key] })),
    ...(project.gallery.length ? [{ id: 'cs-gallery', label: s.gallery }] : []),
  ];

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <article className="case case--enter" aria-labelledby="case-title">
          <header className="case__hero tone-night grid-paper" data-nav-tone="night">
            <div className="container-x case__hero-inner">
              <Link to={homeWork} className="case__back label" data-testid="case-back">
                <ArrowLeft size={14} aria-hidden="true" /> {t.caseStudy.back}
              </Link>
              <p className="label case__kicker">
                {t.categories[project.category]} · {project.year}
              </p>
              <h1 id="case-title" className="case__title" data-vt-title={project.slug}>
                {l(project.title)}
              </h1>
              <p className="case__subtitle">{l(project.subtitle)}</p>
              <div className="case__tags">
                {project.badge && <span className="chip chip--signal">{l(project.badge)}</span>}
                {project.visibility !== 'public' && (
                  <span className="chip">
                    <Lock size={12} aria-hidden="true" /> {t.visibility[project.visibility]}
                  </span>
                )}
              </div>

              <dl className="case__facts">
                <div>
                  <dt className="label">{t.caseStudy.role}</dt>
                  <dd>{l(project.role)}</dd>
                </div>
                <div>
                  <dt className="label">{t.caseStudy.year}</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt className="label">{t.caseStudy.category}</dt>
                  <dd>{t.categories[project.category]}</dd>
                </div>
                <div>
                  <dt className="label">{t.caseStudy.stack}</dt>
                  <dd>
                    <ul className="case__tech">
                      {project.technologies.map(id => (
                        <li key={id}>{TECHS[id].label}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>

            {project.visual !== 'none' && (
              <div className="container-x case__visual" data-vt-media={project.slug}>
                <p className="label case__visual-label">{t.caseStudy.interactive}</p>
                <ProjectVisual kind={project.visual} />
              </div>
            )}
          </header>

          <div className="case__body tone-paper">
            <div className="container-x">
              {project.disclosure && (
                <p className="badge-note case__disclosure" role="note">
                  {l(project.disclosure)}
                </p>
              )}

              <Reveal as="p" className="case__overview">
                {l(project.overview)}
              </Reveal>

              {project.metrics.length > 0 && (
                <section className="case__metrics" aria-labelledby="cs-metrics">
                  <h2 id="cs-metrics" className="label">
                    {t.caseStudy.metrics}
                  </h2>
                  <ul>
                    {project.metrics.map(mt => (
                      <Reveal as="li" key={mt.value + mt.label.en} className="metric">
                        <p className="metric__value">{mt.value}</p>
                        <p className="metric__label">{l(mt.label)}</p>
                        <p className="metric__context">{l(mt.context)}</p>
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}

              <div className="case__layout">
                <nav className="case__toc" aria-label={t.a11y.sectionsNav}>
                  <ol>
                    {toc.map(item => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.label}</a>
                      </li>
                    ))}
                  </ol>
                </nav>

                <div className="case__content">
                  {present.map((x, i) => (
                    <Block key={x.key} id={`cs-${x.key}`} title={s[x.key]} index={i + 1}>
                      <ul className={`cs-list ${x.key === 'limitations' ? 'cs-list--warn' : ''}`}>
                        {l(x.value!).map(p => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      {x.key === 'architecture' && archItems[0]?.kind === 'architecture' && (
                        <div className="cs-arch">
                          <ArchitectureGraph id={archItems[0].architecture} />
                        </div>
                      )}
                      {x.key === 'architecture' && project.id === 'maks-erp' && <PermissionMatrix />}
                    </Block>
                  ))}

                  {project.gallery.length > 0 && (
                    <Block id="cs-gallery" title={s.gallery} index={present.length + 1}>
                      <Gallery items={project.gallery} />
                    </Block>
                  )}
                </div>
              </div>

              {related.length > 0 && (
                <section className="case__related" aria-labelledby="cs-related">
                  <h2 id="cs-related" className="label">
                    {t.caseStudy.related}
                  </h2>
                  <ul>
                    {related.map(p => (
                      <li key={p.id}>
                        <Link to={hrefFor(locale, { name: 'case', slug: p.slug })} className="related-card">
                          <span className="label">{t.categories[p.category]}</span>
                          <span className="related-card__title">{l(p.title)}</span>
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {next && (
            <Link
              to={hrefFor(locale, { name: 'case', slug: next.slug })}
              className="case__next tone-night"
              data-testid="case-next"
            >
              <span className="container-x case__next-inner">
                <span className="label">{t.caseStudy.next}</span>
                <span className="case__next-title">
                  {l(next.title)}
                  <ArrowRight aria-hidden="true" />
                </span>
              </span>
            </Link>
          )}
        </article>
      </MotionConfig>
    </LazyMotion>
  );
}

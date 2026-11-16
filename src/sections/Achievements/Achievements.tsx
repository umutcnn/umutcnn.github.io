import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Link, useRouter } from '../../app/providers/RouterProvider';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { AWARDS } from '../../content/awards';
import { findProjectBySlug } from '../../content/projects';
import './Achievements.css';

/**
 * Abstract, concept-matched compositions per milestone (no fake certificates or photos):
 * 2nd place → three podium bars with the second lit; three finals → three lit nodes; research → federated
 * clients around a server; graduation → stacked layers.
 */
function MilestoneGlyph({ id }: { id: string }) {
  if (id === 'teknofest-2023')
    return (
      <svg viewBox="0 0 240 160" className="glyph" aria-hidden="true">
        <rect x="30" y="80" width="56" height="60" className="glyph__muted" />
        <rect x="92" y="40" width="56" height="100" className="glyph__muted" />
        <rect x="154" y="100" width="56" height="40" className="glyph__muted" />
        <rect x="30" y="80" width="56" height="60" className="glyph__lit" />
        <text x="58" y="120" textAnchor="middle" className="glyph__num">
          2
        </text>
        <line x1="20" y1="140" x2="220" y2="140" className="glyph__line" />
      </svg>
    );
  if (id === 'teknofest-2024')
    return (
      <svg viewBox="0 0 240 160" className="glyph" aria-hidden="true">
        <path d="M40 120 L120 40 L200 120 Z" className="glyph__line" />
        {[
          [40, 120],
          [120, 40],
          [200, 120],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="16" className="glyph__lit" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </svg>
    );
  if (id === 'tubitak-2209a')
    return (
      <svg viewBox="0 0 240 160" className="glyph" aria-hidden="true">
        {[
          [40, 30],
          [40, 80],
          [40, 130],
        ].map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2="170" y2="80" className="glyph__line glyph__flow" />
            <rect x={x! - 14} y={y! - 12} width="28" height="24" rx="5" className="glyph__muted" />
          </g>
        ))}
        <circle cx="180" cy="80" r="26" className="glyph__violet" />
      </svg>
    );
  return (
    <svg viewBox="0 0 240 160" className="glyph" aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <rect
          key={i}
          x={50 + i * 10}
          y={110 - i * 26}
          width={140 - i * 20}
          height="20"
          rx="4"
          className={i === 3 ? 'glyph__lit' : 'glyph__muted'}
        />
      ))}
    </svg>
  );
}

/** Story-driven milestones: ARIA tabs (←/→/Home/End) switch a full chapter with a rolling year. */
export function Achievements() {
  const { t, l } = useLocale();
  const { locale, hrefFor } = useRouter();
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = AWARDS[index]!;
  const project = a.projectSlug ? findProjectBySlug(a.projectSlug) : undefined;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = AWARDS.length;
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % n,
      ArrowLeft: (index - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="achievements"
      className="section achievements tone-night"
      data-nav-tone="night"
      aria-labelledby="achievements-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader
          index={5}
          label={t.achievements.label}
          title={t.achievements.title}
          titleId="achievements-title"
        />

        <Reveal className="story">
          <div className="story__tabs" role="tablist" aria-label={t.achievements.label}>
            {AWARDS.map((m, i) => (
              <button
                key={m.id}
                ref={el => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`story-tab-${m.id}`}
                aria-selected={index === i}
                aria-controls="story-panel"
                tabIndex={index === i ? 0 : -1}
                className={`story__tab ${index === i ? 'is-on' : ''} ${m.highlight ? 'is-highlight' : ''}`}
                onClick={() => setIndex(i)}
                onKeyDown={onKey}
                data-testid={`story-tab-${m.id}`}
              >
                <span className="story__tab-year">{m.year}</span>
                <span className="story__tab-title">{l(m.title)}</span>
              </button>
            ))}
            <span className="story__rail" aria-hidden="true">
              <span style={{ transform: `scaleX(${(index + 1) / AWARDS.length})` }} />
            </span>
          </div>

          <div
            id="story-panel"
            role="tabpanel"
            aria-labelledby={`story-tab-${a.id}`}
            className={`story__panel ${a.highlight ? 'is-highlight' : ''}`}
            data-testid="story-panel"
          >
            <div className="story__visual">
              <p className="story__year" aria-hidden="true" key={`y-${a.id}`}>
                {Array.from(a.year).map((d, i) => (
                  <span key={i} style={{ animationDelay: `${i * 60}ms` }}>
                    {d}
                  </span>
                ))}
              </p>
              <div key={`g-${a.id}`} className="story__glyph">
                <MilestoneGlyph id={a.id} />
              </div>
            </div>

            <div className="story__body" key={`b-${a.id}`}>
              <p className="label">{l(a.title)}</p>
              <h3 className="story__rank">{l(a.rank)}</h3>
              <p className="story__summary">{l(a.summary)}</p>
              <ul className="story__details">
                {l(a.details).map(d => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <div className="story__links">
                {a.evidence?.enabled && (
                  <a
                    className="btn btn--ghost btn--small"
                    href={a.evidence.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l(a.evidence.label)}
                    <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only">{t.a11y.newTab}</span>
                  </a>
                )}
                {project?.hasCaseStudy && (
                  <Link
                    className="btn btn--signal btn--small"
                    to={hrefFor(locale, { name: 'case', slug: project.slug })}
                  >
                    {t.achievements.relatedProject}: {l(project.title)}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

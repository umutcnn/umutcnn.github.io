import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { CERTIFICATES, TIMELINE } from '../../content/timeline';
import { formatMonth } from '../../lib/i18n';
import type { TimelineEntry } from '../../types/content';
import './Journey.css';

function Entry({ e, i }: { e: TimelineEntry; i: number }) {
  const { t, l, locale } = useLocale();
  const ongoing = e.end === null;
  return (
    <Reveal as="li" className={`tl-entry ${ongoing ? 'is-ongoing' : ''}`} index={i % 3}>
      <p className="label tl-entry__date">
        <time dateTime={e.start}>{formatMonth(e.start, locale)}</time>
        {' — '}
        {ongoing ? t.journey.present : <time dateTime={e.end!}>{formatMonth(e.end!, locale)}</time>}
      </p>
      <h4 className="tl-entry__role">{l(e.role)}</h4>
      <p className="tl-entry__org">
        {e.organization} · {e.location}
      </p>
      <ul className="tl-entry__points">
        {l(e.points).map(p => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Journey() {
  const { t, l } = useLocale();
  const [certsOpen, setCertsOpen] = useState(false);
  const work = TIMELINE.filter(e => e.kind === 'work');
  const edu = TIMELINE.filter(e => e.kind === 'education');

  return (
    <section
      id="journey"
      className="section journey tone-paper"
      data-nav-tone="paper"
      aria-labelledby="journey-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader index={7} label={t.journey.label} title={t.journey.title} titleId="journey-title" />
        <div className="journey__grid">
          <div>
            <h3 className="label journey__col-title">{t.journey.work}</h3>
            <ol className="timeline">
              {work.map((e, i) => (
                <Entry key={e.id} e={e} i={i} />
              ))}
            </ol>
          </div>
          <div>
            <h3 className="label journey__col-title">{t.journey.education}</h3>
            <ol className="timeline">
              {edu.map((e, i) => (
                <Entry key={e.id} e={e} i={i} />
              ))}
            </ol>

            <div className="certs">
              <button
                type="button"
                className="certs__toggle"
                aria-expanded={certsOpen}
                aria-controls="certs-list"
                onClick={() => setCertsOpen(o => !o)}
              >
                <span className="label">{t.journey.certificates}</span>
                <span>{certsOpen ? t.journey.hideCertificates : t.journey.showCertificates(CERTIFICATES.length)}</span>
                <ChevronDown size={16} aria-hidden="true" className={certsOpen ? 'is-flipped' : ''} />
              </button>
              <ul id="certs-list" className="certs__list" hidden={!certsOpen}>
                {CERTIFICATES.map(c => (
                  <li key={c.title.en}>
                    <span>{l(c.title)}</span>
                    <span className="label">{c.issuer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

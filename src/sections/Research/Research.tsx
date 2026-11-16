import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Link, useRouter } from '../../app/providers/RouterProvider';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { langTerm } from '../../components/ui/langTerm';

/** Turkish name inside an upper-cased label: keep Turkish casing on the English page too. */
const ADVISOR = 'Ekin Ekinci';
import { ArchitectureGraph } from '../../components/visualizations/ArchitectureGraph';
import './Research.css';

export function Research() {
  const { t } = useLocale();
  const { locale, hrefFor } = useRouter();
  const r = t.research;
  return (
    <section
      id="research"
      className="section research tone-paper grid-paper"
      data-nav-tone="paper"
      aria-labelledby="research-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader index={4} label={r.label} title={r.title} titleId="research-title" intro={r.intro} />

        <div className="research__grid">
          <div className="research__main">
            <Reveal className="research__paper">
              <p className="label">{langTerm(r.meta, ADVISOR, 'tr')}</p>
              <h3 className="research__paper-title">{r.projectTitle}</h3>
            </Reveal>

            <Reveal className="research__block" index={1}>
              <p className="label">{r.methodLabel}</p>
              <ol className="method">
                {r.method.map((step, i) => (
                  <li key={i}>
                    <span className="method__n" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="research__block" index={2}>
              <p className="label">{r.algorithmsLabel}</p>
              <ul className="algos">
                {r.algorithms.map(a => (
                  <li key={a.name} className="algo">
                    <p className="algo__name">{a.name}</p>
                    <p className="algo__body">{a.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="research__side">
            <Reveal className="result-card tone-night">
              <p className="label">{r.resultLabel}</p>
              <p className="result-card__value">{r.resultValue}</p>
              <p className="result-card__caption">{r.resultCaption}</p>
              <div className="result-card__diagram" aria-hidden="true">
                <ArchitectureGraph id="federated" compact />
              </div>
            </Reveal>

            <Reveal className="limits" index={1}>
              <p className="label limits__label">
                <AlertTriangle size={14} aria-hidden="true" /> {r.limitsLabel}
              </p>
              <ul>
                {r.limits.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal index={2}>
              <Link className="btn" to={hrefFor(locale, { name: 'case', slug: 'federated-cataract-detection' })}>
                {r.openCase}
                <span className="btn__icon" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </Link>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
}

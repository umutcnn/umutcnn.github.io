import { GraduationCap } from 'lucide-react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Counter } from '../../components/motion/Counter';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { FACTS, PROFILE } from '../../content/profile';
import './About.css';

function Portrait() {
  const { t } = useLocale();
  const base = `${import.meta.env.BASE_URL}${PROFILE.photo.base}`;
  if (!PROFILE.photo.enabled) {
    return (
      <div className="portrait portrait--monogram" aria-hidden="true">
        <span>{PROFILE.monogram}</span>
      </div>
    );
  }
  return (
    <figure className="portrait">
      <div className="portrait__orbit" aria-hidden="true">
        <span className="portrait__node portrait__node--a" />
        <span className="portrait__node portrait__node--b" />
        <span className="portrait__node portrait__node--c" />
      </div>
      <div className="portrait__frame">
        <picture>
          <source
            type="image/avif"
            srcSet={`${base}-320.avif 320w, ${base}-640.avif 640w`}
            sizes="(min-width: 1024px) 340px, 60vw"
          />
          <source
            type="image/webp"
            srcSet={`${base}-320.webp 320w, ${base}-640.webp 640w`}
            sizes="(min-width: 1024px) 340px, 60vw"
          />
          <img
            src={`${base}-640.webp`}
            width={640}
            height={640}
            alt={t.about.photoAlt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <figcaption className="label portrait__caption">FIG. 01 — {PROFILE.name.toLocaleUpperCase('tr-TR')}</figcaption>
    </figure>
  );
}

export function About() {
  const { t, l } = useLocale();
  return (
    <section
      id="about"
      className="section about tone-paper"
      data-nav-tone="paper"
      aria-labelledby="about-title"
      tabIndex={-1}
    >
      <div className="container-x about__grid">
        <div className="about__main">
          <SectionHeader index={2} label={t.about.label} title={t.about.title} titleId="about-title" />
          <div className="about__story">
            {t.about.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} index={i} className={i === 0 ? 'about__first' : undefined}>
                {p}
              </Reveal>
            ))}
          </div>

          <div className="about__philosophy">
            <Reveal as="p" className="label">
              {t.about.philosophyLabel}
            </Reveal>
            <ol>
              {t.about.pillars.map((pillar, i) => (
                <Reveal as="li" key={pillar.title} index={i} className="pillar">
                  <span className="pillar__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="pillar__title">{pillar.title}</h3>
                  <p className="pillar__body">{pillar.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        <aside className="about__side" aria-label={t.about.educationLabel}>
          <Reveal>
            <Portrait />
          </Reveal>

          <Reveal className="about-card" index={1}>
            <p className="label about-card__label">
              <GraduationCap size={14} aria-hidden="true" /> {t.about.educationLabel}
            </p>
            <p className="about-card__title">
              {l({ tr: PROFILE.education.university, en: PROFILE.education.universityEn })}
            </p>
            <p className="about-card__meta">{l(PROFILE.education.department)}</p>
            <ul className="about-card__list">
              <li>{l(PROFILE.education.master)}</li>
              <li>{l(PROFILE.education.bachelor)}</li>
            </ul>
          </Reveal>

          <Reveal className="about-card" index={2}>
            <p className="label about-card__label">{t.about.focusLabel}</p>
            <ul className="about-card__chips">
              {PROFILE.focus.map(f => (
                <li key={f.en} className="chip">
                  {l(f)}
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </div>

      <div className="container-x">
        <Reveal as="p" className="label about__facts-label">
          {t.about.factsLabel}
        </Reveal>
        <dl className="facts">
          {FACTS.map((f, i) => (
            <Reveal key={f.label.en} className="fact" index={i}>
              <dt className="fact__label">{l(f.label)}</dt>
              <dd className="fact__value">
                <Counter value={f.value} suffix={f.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

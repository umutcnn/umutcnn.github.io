import { ArrowDownRight, ArrowRight, Trophy } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useGoToSection, type SectionId } from '../../app/navigation';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Magnetic } from '../../components/motion/Magnetic';
import { ParticleField, type FieldController } from '../../components/visualizations/ParticleField';
import { PROFILE } from '../../content/profile';
import { loadGsapDeferred } from '../../lib/gsap';
import { upper } from '../../lib/i18n';
import { prefersReducedMotion } from '../../lib/prefs';
import { KineticName, type KineticNameHandle } from './KineticName';
import './Hero.css';

const SIGNAL_TARGETS: SectionId[] = ['work', 'research'];

export function Hero() {
  const { t, l } = useLocale();
  const goTo = useGoToSection();
  const root = useRef<HTMLElement>(null);
  const field = useRef<FieldController | null>(null);
  const name = useRef<KineticNameHandle>(null);

  // Hero → About: the name lifts and shrinks, the intelligence field disperses (driven by scroll, never locks it).
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let cleanup = () => {};
    let cancelled = false;
    loadGsapDeferred().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: true, // direct mapping: a refresh can never leave it mid-tween
            onUpdate: self => field.current?.setExit(self.progress),
          },
        });
        // fromTo with explicit start values: GSAP must not read a transform mid-way through the CSS entrance.
        tl.fromTo(
          '.hero__center',
          { yPercent: 0, scale: 1, opacity: 1 },
          { yPercent: -16, scale: 0.92, opacity: 0.1, ease: 'none' },
          0,
        ).fromTo('.hero__bottom', { y: 0, opacity: 1 }, { y: -40, opacity: 0, ease: 'none' }, 0);
      }, el);
      ScrollTrigger.refresh();
      cleanup = () => {
        ctx.revert();
        field.current?.setExit(0);
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // Touch has no hover: a tap on the hero sends a ripple through the name and the field instead.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    field.current?.burst(e.clientX, e.clientY);
    name.current?.ripple(e.clientX, e.clientY);
  };

  return (
    <section
      ref={root}
      id="home"
      className="hero tone-paper"
      data-nav-tone="paper"
      aria-labelledby="hero-title"
      tabIndex={-1}
      onPointerDown={onPointerDown}
    >
      <div className="hero__field grid-paper" aria-hidden="true">
        <ParticleField className="hero__canvas" controllerRef={field} />
      </div>

      <div className="hero__frame container-x">
        <div className="hero__instrument">
          <p className="label">{t.hero.kickerLeft}</p>
          <p className="label">
            {/* a Turkish place name: Turkish casing in every language (TÜRKİYE, not TÜRKIYE) */}
            {upper(l(PROFILE.location), 'tr')} — {PROFILE.year}
          </p>
        </div>

        <div className="hero__center">
          <p className="hero__role label">{t.hero.discipline}</p>
          <KineticName ref={name} name={PROFILE.name} lines={PROFILE.nameLines} />
          <p className="hero__tagline">{t.hero.tagline}</p>
        </div>

        <div className="hero__bottom">
          <ul className="hero__signals" aria-label={t.hero.signalsLabel}>
            <li>
              <a
                className="hero__award"
                href="#achievements"
                onClick={e => {
                  e.preventDefault();
                  goTo('achievements');
                }}
              >
                <span className="hero__award-icon" aria-hidden="true">
                  <Trophy size={15} />
                </span>
                <span>
                  <strong>{t.hero.award}</strong>
                  <span className="hero__award-sub">{t.hero.awardSub}</span>
                </span>
              </a>
            </li>
            {t.hero.signals.map((s, i) => (
              <li key={s.title}>
                <a
                  className="hero__signal"
                  href={`#${SIGNAL_TARGETS[i]}`}
                  onClick={e => {
                    e.preventDefault();
                    goTo(SIGNAL_TARGETS[i]!);
                  }}
                >
                  <span className="hero__signal-dot" aria-hidden="true" />
                  <span>
                    <strong>{s.title}</strong>
                    <span className="hero__award-sub">{s.sub}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="hero__lede">{t.hero.lede}</p>

          <div className="hero__ctas">
            <Magnetic>
              <a
                className="btn"
                href="#work"
                onClick={e => {
                  e.preventDefault();
                  goTo('work');
                }}
              >
                {t.hero.ctaWork}
                <span className="btn__icon" aria-hidden="true">
                  <ArrowRight />
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                className="btn btn--ghost"
                href="#contact"
                onClick={e => {
                  e.preventDefault();
                  goTo('contact');
                }}
              >
                {t.hero.ctaContact}
                <span className="btn__icon" aria-hidden="true">
                  <ArrowDownRight />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <p className="hero__scroll label" aria-hidden="true">
          <span className="hero__scroll-line" />
          {t.hero.scroll}
        </p>
      </div>
    </section>
  );
}

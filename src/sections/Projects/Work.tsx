import { ArrowUpRight, Lock } from 'lucide-react';
import { loadCaseStudyPage } from '../../features/case-studies/load';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { Link, useRouter } from '../../app/providers/RouterProvider';
import { Reveal } from '../../components/motion/Reveal';
import { LazyMount } from '../../components/motion/LazyMount';
import { usePointerGlow } from '../../components/motion/usePointerGlow';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { LazyVisual } from '../../components/visualizations/LazyVisual';
import { FEATURED_PROJECTS } from '../../content/projects';
import { TECHS } from '../../content/skills';
import { loadGsapDeferred } from '../../lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '../../lib/prefs';
import { scrollToY } from '../../lib/scroll';
import { holdNavDuringScroll } from '../../app/navigation';
import type { Project } from '../../types/content';
import { ProjectArchive } from './ProjectArchive';
import './Work.css';

const N = FEATURED_PROJECTS.length;

function ProjectMeta({ project, index }: { project: Project; index: number }) {
  const { t, l } = useLocale();
  const { locale, hrefFor } = useRouter();
  const href = hrefFor(locale, { name: 'case', slug: project.slug });
  return (
    <div className="work-item__info">
      <p className="label work-item__meta">
        <span>{t.work.stageCounter(index + 1, N)}</span>
        <span>{t.categories[project.category]}</span>
        <span>{project.year}</span>
      </p>
      <h3 className="work-item__title">
        <Link to={href} className="work-item__title-link" data-vt-title={project.slug}>
          {l(project.title)}
        </Link>
      </h3>
      <p className="work-item__subtitle">{l(project.subtitle)}</p>
      <div className="work-item__tags">
        {project.badge && <span className="chip chip--signal">{l(project.badge)}</span>}
        {project.visibility === 'confidential' && (
          <span className="chip">
            <Lock size={12} aria-hidden="true" /> {t.visibility.confidential}
          </span>
        )}
      </div>
      <ul className="work-item__tech" aria-label={t.caseStudy.stack}>
        {project.technologies.slice(0, 6).map(id => (
          <li key={id}>{TECHS[id].label}</li>
        ))}
      </ul>
      <Link to={href} className="btn btn--signal work-item__cta" aria-label={`${t.work.viewCase}: ${l(project.title)}`}>
        {t.work.viewCase}
        <span className="btn__icon" aria-hidden="true">
          <ArrowUpRight />
        </span>
      </Link>
    </div>
  );
}

function WorkItem({
  project,
  index,
  active,
  pinned,
}: {
  project: Project;
  index: number;
  active: boolean;
  pinned: boolean;
}) {
  const { t } = useLocale();
  const { locale, hrefFor } = useRouter();
  const visualRef = useRef<HTMLDivElement>(null);
  usePointerGlow(visualRef);
  const href = hrefFor(locale, { name: 'case', slug: project.slug });
  return (
    <article
      // prefetch the case-study chunk on intent, so opening it is instant
      onPointerEnter={() => void loadCaseStudyPage()}
      onFocus={() => void loadCaseStudyPage()}
      className={`work-item ${active ? 'is-active' : ''}`}
      aria-labelledby={`work-${project.id}`}
      data-index={index}
      style={{ '--i': index } as CSSProperties}
      inert={pinned && !active ? true : undefined}
    >
      <div ref={visualRef} className="work-item__visual" data-vt-media={project.slug}>
        {/* Pointer/touch shortcut onto the visual. Keyboard and screen readers use the title link and CTA. */}
        <Link to={href} className="work-item__hit" tabIndex={-1} aria-hidden="true">
          <span className="work-item__cursor label">{t.work.viewCase} ↗</span>
        </Link>
        <span className="work-item__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="work-item__visual-inner">
          <LazyMount
            ratio={
              project.visual === 'cad-wireframe'
                ? 640 / 400
                : project.visual === 'erp-architecture'
                  ? 100 / 60
                  : project.visual === 'coil-detection'
                    ? 640 / 400
                    : project.visual === 'federated'
                      ? 640 / 360
                      : 640 / 380
            }
          >
            <LazyVisual kind={project.visual} compact active={active || !pinned} />
          </LazyMount>
        </div>
        <span className="work-item__note label">{t.work.visualNote}</span>
      </div>
      <div id={`work-${project.id}`} className="work-item__body">
        <ProjectMeta project={project} index={index} />
      </div>
    </article>
  );
}

const PIN_QUERY = '(min-width: 1024px) and (min-height: 640px)';
const shouldPin = () => window.matchMedia(PIN_QUERY).matches && hasFinePointer() && !prefersReducedMotion();
const isHydrated = () => typeof document !== 'undefined' && document.documentElement.dataset.hydrated === '1';

export function Work() {
  const { t, l } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  // Hydration must match the server markup (not pinned). After that — e.g. coming back from a case study — the
  // layout is decided on the first render: starting unpinned would make the page ~5 viewports shorter and the
  // restored scroll position would be clamped before the section grows.
  const [pinned, setPinned] = useState(() => isHydrated() && shouldPin());
  const [active, setActive] = useState(0);

  // Pinned storytelling only for wide, fine-pointer screens without reduced motion; everything else scrolls natively.
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => setPinned(shouldPin());
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let cleanup = () => {};
    let cancelled = false;
    loadGsapDeferred().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        if (!prefersReducedMotion()) {
          // panel rises out of the paper surface: inset clip → full bleed
          gsap.fromTo(
            section,
            { clipPath: 'inset(6% 3% 0% 3% round 36px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 0px)',
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: true },
            },
          );
        }
        if (pinned) {
          ScrollTrigger.create({
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: self => {
              const idx = Math.min(N - 1, Math.floor(self.progress * N * 0.9999));
              setActive(idx);
              progressRef.current?.style.setProperty('transform', `scaleY(${self.progress.toFixed(4)})`);
            },
          });
        }
      }, section);
      ScrollTrigger.refresh();
      cleanup = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pinned]);

  const goToProject = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = track.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / N) * span;
    // same scroller and easing as section links, and keep the navbar from hiding during the jump
    holdNavDuringScroll();
    scrollToY(y, { smooth: true });
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`section work tone-night ${pinned ? 'work--pinned' : ''}`}
      data-nav-tone="night"
      aria-labelledby="work-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader index={3} label={t.work.label} title={t.work.title} titleId="work-title" intro={t.work.intro} />
      </div>

      <div ref={trackRef} className="work__track" style={{ '--n': N } as CSSProperties}>
        <div className="work__stage container-x">
          <nav className="work__index" aria-label={t.work.label}>
            <span className="work__progress" aria-hidden="true">
              <span ref={progressRef} />
            </span>
            <ol>
              {FEATURED_PROJECTS.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={active === i && pinned ? 'is-active' : ''}
                    aria-current={active === i && pinned ? 'true' : undefined}
                    onClick={() => goToProject(i)}
                  >
                    <span className="label">{String(i + 1).padStart(2, '0')}</span>
                    {l(p.title)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="work__items">
            {FEATURED_PROJECTS.map((p, i) => (
              <WorkItem key={p.id} project={p} index={i} active={!pinned || active === i} pinned={pinned} />
            ))}
          </div>
        </div>
      </div>

      <div className="container-x">
        <Reveal>
          <ProjectArchive />
        </Reveal>
      </div>
    </section>
  );
}

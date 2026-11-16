import { lazy, Suspense, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { LazyMount } from '../../components/motion/LazyMount';
import { Reveal } from '../../components/motion/Reveal';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useOverflowFade } from '../../hooks/useOverflowFade';
import './Lab.css';

const LabPanel = lazy(() => import('./LabPanels'));

type Tab = 'fl' | 'cv' | 'arch';
const TABS: Tab[] = ['fl', 'cv', 'arch'];

/** ARIA tabs with roving focus (←/→/Home/End). */
export function Lab() {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('fl');
  const strip = useOverflowFade<HTMLDivElement>(tab);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ fl: null, cv: null, arch: null });

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(tab);
    let next: Tab | null = null;
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length]!;
    if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length]!;
    if (e.key === 'Home') next = TABS[0]!;
    if (e.key === 'End') next = TABS[TABS.length - 1]!;
    if (next) {
      e.preventDefault();
      setTab(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <section
      id="lab"
      className="section lab tone-night"
      data-nav-tone="night"
      aria-labelledby="lab-title"
      tabIndex={-1}
    >
      <div className="container-x">
        <SectionHeader index={8} label={t.lab.label} title={t.lab.title} titleId="lab-title" intro={t.lab.intro} />

        <Reveal className="lab__shell">
          <div ref={strip} className="lab__tabs scroll-fade" role="tablist" aria-label={t.lab.tablistLabel}>
            {TABS.map((id, i) => (
              <button
                key={id}
                ref={el => {
                  tabRefs.current[id] = el;
                }}
                type="button"
                role="tab"
                id={`lab-tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`lab-panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                className={`lab__tab ${tab === id ? 'is-on' : ''}`}
                onClick={() => setTab(id)}
                onKeyDown={onKey}
                data-testid={`lab-tab-${id}`}
              >
                <span className="label">{String.fromCharCode(65 + i)}</span>
                {t.lab.tabs[id]}
              </button>
            ))}
          </div>

          {TABS.map(id => (
            <div
              key={id}
              id={`lab-panel-${id}`}
              role="tabpanel"
              aria-labelledby={`lab-tab-${id}`}
              hidden={tab !== id}
              className="lab__panel"
              tabIndex={0}
            >
              {tab === id && (
                <LazyMount ratio={16 / 9} rootMargin="600px">
                  <Suspense fallback={<div className="visual-loading" aria-hidden="true" />}>
                    <LabPanel id={id} />
                  </Suspense>
                </LazyMount>
              )}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

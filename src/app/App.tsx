import {
  createContext,
  createElement,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Footer, ScrollProgress } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { applyRouteMeta, getRouteMeta, resolveRoute } from '../lib/seo';
import { initSmoothScroll } from '../lib/scroll';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LocaleSync, useLocale } from './providers/LocaleProvider';
import { RouterProvider, setNavigationPreparer, useRouter } from './providers/RouterProvider';
import { loadCaseStudyPage } from '../features/case-studies/load';
import { ToastProvider } from './providers/ToastProvider';

export type CaseStudyComponent = ComponentType<{ slug: string }>;

/** Must match the `reveal-failsafe` animation delay in globals.css. */
const REVEAL_FAILSAFE_MS = 3500;

/** Code-split route chunk for client-side navigation. */
const LazyCaseStudyPage = lazy(loadCaseStudyPage);
/**
 * Pre-loaded case-study component. The server always provides it, and the client provides it when it hydrates a
 * case-study URL (main.tsx loads the chunk first). Rendering it without a Suspense boundary keeps the markup
 * identical on both sides — React 19's prerender would otherwise outline a large boundary into a hidden segment.
 */
const CaseStudyContext = createContext<CaseStudyComponent | null>(null);

function RouteView() {
  const { route } = useRouter();
  const Preloaded = useContext(CaseStudyContext);
  const resolved = resolveRoute(route);
  if (resolved.name === 'case') {
    if (Preloaded) return createElement(Preloaded, { key: resolved.slug, slug: resolved.slug });
    return (
      <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
        <LazyCaseStudyPage key={resolved.slug} slug={resolved.slug} />
      </Suspense>
    );
  }
  if (resolved.name === 'notFound') return <NotFoundPage />;
  return <HomePage />;
}

function AppShell() {
  const { route, locale } = useRouter();
  const { t } = useLocale();
  // Skip the first sync only when the static HTML for this exact path was hydrated (its <head> is already right).
  const first = useRef(true);

  // After an in-app page change, move focus to the new page heading (or the target section) so keyboard and
  // screen-reader users continue from the new content. Language switches keep focus where it is.
  const { hash } = useRouter();
  const routeKey = route.name === 'case' ? `case:${route.slug}` : route.name;
  // Compare with the previous page key (not a "first run" flag): StrictMode runs effects twice on mount.
  const focusedKey = useRef(routeKey);
  useEffect(() => {
    if (focusedKey.current === routeKey) return;
    focusedKey.current = routeKey;
    const target =
      (hash && document.getElementById(hash)) ||
      document.querySelector<HTMLElement>('main h1') ||
      document.getElementById('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only page changes move focus
  }, [routeKey]);

  // Head tags are pre-rendered per route; keep them in sync after client-side navigation.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      const here = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
      if (document.getElementById('root')?.dataset.route === here) return;
    }
    applyRouteMeta(getRouteMeta(locale, route));
  }, [locale, route]);

  // Hydration marker (tests and diagnostics wait for it; the entry script loads after first paint). It also ends the
  // CSS reveal fail-safe (globals.css). If hydration came late and the fail-safe already showed the content on
  // screen, keep that content shown instead of hiding it for a frame and replaying its reveal.
  useEffect(() => {
    const root = document.documentElement;
    if (performance.now() >= REVEAL_FAILSAFE_MS) {
      for (const el of document.querySelectorAll('[data-reveal]:not(.is-in), .split:not(.is-in)'))
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
    }
    root.dataset.hydrated = '1';
  }, []);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    initSmoothScroll().then(d => {
      if (cancelled) d();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skip}
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary
          fallback={reset => (
            <div className="section container-x" role="alert">
              <p className="section-title">{t.common.error}</p>
              <button type="button" className="btn" onClick={() => (reset(), window.location.reload())}>
                {t.common.reload}
              </button>
            </div>
          )}
        >
          <RouteView />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

export function App({ initialPath, caseStudyPage }: { initialPath?: string; caseStudyPage?: CaseStudyComponent }) {
  const [casePage, setCasePage] = useState<CaseStudyComponent | null>(() => caseStudyPage ?? null);

  // Before navigating to a case study, load its chunk so the page renders in one synchronous update
  // (inside the view transition) instead of showing a loading state.
  useEffect(() => {
    setNavigationPreparer(async next => {
      if (resolveRoute(next.route).name !== 'case') return;
      const mod = await loadCaseStudyPage();
      setCasePage(() => mod.default);
    });
    return () => setNavigationPreparer(null);
  }, []);

  const shell = (
    <RouterProvider initialPath={initialPath}>
      <ToastProvider>
        <LocaleSync />
        <AppShell />
      </ToastProvider>
    </RouterProvider>
  );
  return <CaseStudyContext.Provider value={casePage}>{shell}</CaseStudyContext.Provider>;
}

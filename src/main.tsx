import './styles/fonts.css';
import './styles/globals.css';
import './styles/layout.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { parsePath } from './lib/router';
import { resolveRoute } from './lib/seo';

const container = document.getElementById('root')!;
const here = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;

async function start() {
  // Case-study URLs are rendered without a Suspense boundary on the server, so load that chunk before hydrating
  // to produce identical markup (see CaseStudyContext in App.tsx).
  const { route } = parsePath(window.location.pathname, import.meta.env.BASE_URL);
  const caseStudyPage =
    resolveRoute(route).name === 'case' ? (await import('./features/case-studies/CaseStudyPage')).default : undefined;
  const app = (
    <StrictMode>
      <App caseStudyPage={caseStudyPage} />
    </StrictMode>
  );
  // Pre-rendered pages (scripts/prerender-routes.mjs) are hydrated when the markup belongs to this URL.
  // Dev serves an empty root, and 404.html is served for any unknown path → render from scratch in those cases.
  if (container.firstElementChild && container.dataset.route === here) hydrateRoot(container, app);
  else {
    container.textContent = '';
    createRoot(container).render(app);
  }
}

void start();

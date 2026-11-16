import { prerender } from 'react-dom/static';
import { StrictMode } from 'react';
import { App } from './app/App';
import CaseStudyPage from './features/case-studies/CaseStudyPage';
import { CASE_STUDIES } from './content/projects';
import { PROFILE } from './content/profile';
import { buildPath, parsePath } from './lib/router';
import { getRouteMeta, resolveRoute, type RouteMeta } from './lib/seo';
import { LOCALES } from './types/content';

const BASE = import.meta.env.BASE_URL;
/** Single source for the site origin (also used by scripts/prerender-routes.mjs for robots.txt). */
export const SITE_URL = PROFILE.siteUrl.replace(/\/$/, '');

export interface PrerenderedPage {
  /** Output path relative to dist/, e.g. "en/work/x/index.html" */
  file: string;
  html: string;
  meta: RouteMeta;
  /** Case-study page: the prerender script inlines the lazy route chunk's CSS into it. */
  isCase: boolean;
}

/** All statically generated routes: home + every case study, in every locale, plus the 404 page. */
export function listRoutes(): string[] {
  const paths: string[] = [];
  for (const locale of LOCALES) {
    paths.push(buildPath(locale, { name: 'home' }, BASE));
    for (const p of CASE_STUDIES) paths.push(buildPath(locale, { name: 'case', slug: p.slug }, BASE));
  }
  return paths;
}

export async function renderPath(pathname: string, file: string): Promise<PrerenderedPage> {
  const { locale, route } = parsePath(pathname, BASE);
  // The case-study page is passed in statically (no Suspense): a hidden `<div hidden id="S:…">` segment would only
  // be revealed by an inline script (invisible without JS, slower to paint). See CaseStudyContext in App.tsx.
  const { prelude } = await prerender(
    <StrictMode>
      <App initialPath={pathname} caseStudyPage={CaseStudyPage} />
    </StrictMode>,
  );
  const html = await new Response(prelude).text();
  if (html.includes('<div hidden id="S:')) throw new Error(`${pathname}: Suspense content was not rendered inline`);
  return { file, html, meta: getRouteMeta(locale, route), isCase: resolveRoute(route).name === 'case' };
}

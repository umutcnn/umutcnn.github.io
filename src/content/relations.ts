import type { Project, TechId } from '../types/content';
import { PROJECTS } from './projects';

/** Projects that use a technology — the single source is each project's `technologies` list. */
export function projectsForTech(tech: TechId, projects: Project[] = PROJECTS): Project[] {
  return projects.filter(p => p.technologies.includes(tech)).sort((a, b) => a.order - b.order);
}

export function relatedProjects(project: Project, projects: Project[] = PROJECTS): Project[] {
  return project.relatedProjects
    .map(slug => projects.find(p => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
}

/** Next case study in order (wraps around). */
export function nextCaseStudy(slug: string, projects: Project[] = PROJECTS): Project | undefined {
  const cases = projects.filter(p => p.hasCaseStudy).sort((a, b) => a.order - b.order);
  const i = cases.findIndex(p => p.slug === slug);
  if (i < 0 || cases.length < 2) return undefined;
  return cases[(i + 1) % cases.length];
}

/** The case-study route chunk. Calling it again returns the cached module, so it doubles as a prefetch. */
export const loadCaseStudyPage = () => import('./CaseStudyPage');

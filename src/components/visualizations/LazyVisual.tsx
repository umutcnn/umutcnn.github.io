import { lazy, Suspense } from 'react';
import type { VisualKind } from '../../types/content';

const ProjectVisual = lazy(() => import('./ProjectVisual').then(m => ({ default: m.ProjectVisual })));

/** Code-split project visual: the visualisation code is fetched only when a LazyMount brings it near view. */
export function LazyVisual(props: { kind: VisualKind; compact?: boolean; active?: boolean }) {
  return (
    <Suspense fallback={<div className="visual-loading" aria-hidden="true" />}>
      <ProjectVisual {...props} />
    </Suspense>
  );
}

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useReveal';

/**
 * Mounts heavy, below-the-fold visuals only when they approach the viewport.
 * Server render and first client render both output the sized placeholder, so hydration always matches
 * and layout never shifts (the placeholder reserves the visual's aspect ratio).
 */
export function LazyMount({
  children,
  ratio,
  className = '',
  rootMargin = '400px',
}: {
  children: ReactNode;
  /** width / height of the eventual content, used to reserve space */
  ratio: number;
  className?: string;
  rootMargin?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(rootMargin);
  return (
    <div
      ref={ref}
      className={`lazy-mount ${className}`}
      style={inView ? undefined : ({ aspectRatio: String(ratio) } as CSSProperties)}
    >
      {inView ? children : null}
    </div>
  );
}

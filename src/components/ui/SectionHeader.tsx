import type { ReactNode } from 'react';
import { Reveal, SplitWords } from '../motion/Reveal';

interface Props {
  index: number;
  total?: number;
  label: string;
  title: string;
  titleId: string;
  intro?: ReactNode;
  className?: string;
}

/** "[03] / 09 — WORK" instrument label + word-reveal headline + optional intro. */
export function SectionHeader({ index, total = 9, label, title, titleId, intro, className = '' }: Props) {
  return (
    <header className={`section-head ${className}`}>
      <Reveal as="p" className="label section-index">
        <span>
          [{String(index).padStart(2, '0')}] / {String(total).padStart(2, '0')}
        </span>
        <span aria-hidden="true">—</span>
        <span>{label}</span>
      </Reveal>
      <SplitWords as="h2" id={titleId} className="section-title" text={title} />
      {intro && (
        <Reveal as="p" className="lead" index={1}>
          {intro}
        </Reveal>
      )}
    </header>
  );
}

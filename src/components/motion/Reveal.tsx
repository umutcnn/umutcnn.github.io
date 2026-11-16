import { createElement, Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useReveal } from '../../hooks/useReveal';

interface RevealProps {
  as?: ElementType;
  index?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
}

/** Fades/slides content in once it enters the viewport. Visible without JS and with reduced motion. */
export function Reveal({ as = 'div', index = 0, className, style, children, id }: RevealProps) {
  const ref = useReveal<HTMLElement>();
  return createElement(
    as,
    { ref, id, className, 'data-reveal': '', style: { ...style, '--reveal-i': index } as CSSProperties },
    children,
  );
}

interface SplitWordsProps {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
}

/** Headline revealed word by word (mask + translate). Screen readers get the plain sentence. */
export function SplitWords({ text, as = 'h2', className, id }: SplitWordsProps) {
  const ref = useReveal<HTMLElement>();
  const words = text.split(/\s+/).filter(Boolean);
  return createElement(
    as,
    { ref, id, className: `split ${className ?? ''}`, 'aria-label': text },
    words.map((w, i) => (
      <Fragment key={`${w}-${i}`}>
        <span className="split-word" aria-hidden="true">
          <span style={{ '--w': i } as CSSProperties}>{w}</span>
        </span>
        {i < words.length - 1 ? ' ' : null}
      </Fragment>
    )),
  );
}

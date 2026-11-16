import type { ReactNode } from 'react';
import { useMagneticInteraction } from '../../motion';

/** Magnetic wrapper for CTAs; the behaviour lives in the shared motion system (useMagneticInteraction). */
export function Magnetic({ children, strength = 10 }: { children: ReactNode; strength?: number }) {
  const ref = useMagneticInteraction<HTMLSpanElement>(strength);
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}

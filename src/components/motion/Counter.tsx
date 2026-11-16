import { useEffect, useRef, useState } from 'react';
import { observeReveal } from '../../hooks/useReveal';
import { prefersReducedMotion } from '../../lib/prefs';

/**
 * Counts up to a real value when it scrolls into view. Server/initial render shows the final value
 * (correct without JS); the count-up only runs if the counter starts off-screen.
 */
export function Counter({
  value,
  suffix = '',
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already visible → keep final value
    setDisplay(0);
    let raf = 0;
    const stop = observeReveal(el, () => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setDisplay(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
    </span>
  );
}

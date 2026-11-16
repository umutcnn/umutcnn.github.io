import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react';
import { acquirePointer, pointer } from '../../lib/pointer';
import { hasFinePointer } from '../../lib/prefs';
import { getAnimationQuality } from '../../motion/quality';
import { kineticParams, stepChar, targetOffset, type CharBody, type KineticParams } from './kinetic';

export interface KineticNameHandle {
  /** touch alternative to hover: a ripple from a tap point (viewport coordinates) */
  ripple(clientX: number, clientY: number): void;
}

function Line({ text, offset }: { text: string; offset: number }) {
  return (
    <span className="hero__line" aria-hidden="true">
      {Array.from(text).map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="hero__space" />
        ) : (
          <span key={i} className="hero__mask">
            <span className="hero__char" style={{ '--i': offset + i } as CSSProperties}>
              {ch}
            </span>
          </span>
        ),
      )}
    </span>
  );
}

/**
 * Kinetic name: masked staggered entrance (CSS), then pointer-driven character displacement with a subtle 3D tilt
 * and a scroll-velocity skew. One rAF loop that sleeps at rest; transforms only; no React state per frame.
 * Minimal quality / reduced motion → static text. The real name is in an sr-only span for assistive tech.
 */
export const KineticName = forwardRef<KineticNameHandle, { name: string; lines: readonly [string, string] }>(
  function KineticName({ name, lines }, handleRef) {
    const ref = useRef<HTMLHeadingElement>(null);
    const kick = useRef<(x: number, y: number) => void>(() => {});

    useImperativeHandle(handleRef, () => ({ ripple: (x, y) => kick.current(x, y) }), []);

    useEffect(() => {
      const el = ref.current;
      if (!el || getAnimationQuality() === 'minimal') return;
      const masks = Array.from(el.querySelectorAll<HTMLElement>('.hero__mask'));
      const rows = Array.from(el.querySelectorAll<HTMLElement>('.hero__line'));
      const fine = hasFinePointer();
      const release = fine ? acquirePointer() : () => {};
      let bodies: CharBody[] = masks.map(() => ({ cx: 0, cy: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0 }));
      let params: KineticParams = kineticParams(100);
      let raf = 0;
      let last = performance.now();
      let lastScroll = window.scrollY;
      let skew = 0;
      const tap = { x: 0, y: 0, until: 0 };

      const measure = () => {
        const box = el.getBoundingClientRect();
        params = kineticParams(parseFloat(getComputedStyle(el).fontSize) || 100);
        bodies = masks.map((m, i) => {
          const r = m.getBoundingClientRect();
          const b = bodies[i]!;
          return { ...b, cx: r.left + r.width / 2 - box.left - b.x, cy: r.top + r.height / 2 - box.top - b.y };
        });
      };

      const frame = (now: number) => {
        const k = Math.min(2.5, ((now - last) / 1000) * 60);
        last = now;
        const box = el.getBoundingClientRect();
        const tapping = now < tap.until;
        const px = (tapping ? tap.x : pointer.x) - box.left;
        const py = (tapping ? tap.y : pointer.y) - box.top;
        const near =
          tapping ||
          (fine &&
            pointer.active &&
            py > -params.radius &&
            py < box.height + params.radius &&
            now - pointer.lastMove < 3000);

        let moving = false;
        bodies.forEach((c, i) => {
          const t = near ? targetOffset(c, px, py, params) : { x: 0, y: 0, f: 0 };
          if (stepChar(c, t.x, t.y, t.f, params, k)) moving = true;
          const ry = (c.x / params.maxShift) * 14;
          const rx = -(c.y / params.maxShift) * 10;
          masks[i]!.style.transform =
            `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1 + c.rot * 0.05).toFixed(3)})`;
          masks[i]!.classList.toggle('is-near', c.rot > 0.3);
        });

        // velocity-driven skew: scrolling fast leans the name slightly, it settles when scrolling stops
        const y = window.scrollY;
        const v = (y - lastScroll) / Math.max(1, k);
        lastScroll = y;
        skew += (Math.max(-6, Math.min(6, -v * 0.12)) - skew) * 0.15 * k;
        if (Math.abs(skew) > 0.02) moving = true;
        rows.forEach(r => (r.style.transform = `skewX(${skew.toFixed(2)}deg)`));

        raf = moving || near ? requestAnimationFrame(frame) : 0;
      };
      const wake = () => {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      };

      kick.current = (x, y) => {
        tap.x = x;
        tap.y = y;
        tap.until = performance.now() + 380;
        wake();
      };

      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      document.fonts?.ready.then(measure).catch(() => {});
      const onMove = () => wake();
      const onScroll = () => wake();
      if (fine) window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
        release();
        kick.current = () => {};
        masks.forEach(m => {
          m.style.transform = '';
          m.classList.remove('is-near');
        });
        rows.forEach(r => (r.style.transform = ''));
      };
    }, []);

    return (
      <h1 ref={ref} id="hero-title" className="hero__name">
        <span className="sr-only">{name}</span>
        <Line text={lines[0]} offset={0} />
        <Line text={lines[1]} offset={lines[0].length} />
      </h1>
    );
  },
);

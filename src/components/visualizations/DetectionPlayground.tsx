import { useEffect, useId, useMemo, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useVisibility } from '../../hooks/useReveal';
import { getDeviceTier, useReducedMotion } from '../../lib/prefs';
import {
  SCENE_H,
  SCENE_W,
  countByClass,
  detectionsFor,
  filterDetections,
  generateCoilScene,
  type Coil,
} from './detection-model';
import './visualizations.css';

function CoilShape({ c }: { c: Coil }) {
  return (
    <g className="coil" transform={`translate(${c.x} ${c.y})`}>
      <circle r={c.r} className="coil__outer" />
      <circle r={c.r * 0.78} className="coil__wind" />
      <circle r={c.r * 0.58} className="coil__wind" />
      <circle r={c.r * 0.34} className="coil__core" />
      <circle r={c.r * 0.16} className="coil__hole" />
    </g>
  );
}

interface Props {
  compact?: boolean;
  active?: boolean;
}

/** Synthetic coil-stack scene with a confidence threshold. Visualisation only — no model inference. */
export function DetectionPlayground({ compact = false, active = true }: Props) {
  const { t } = useLocale();
  const c = t.lab.cv;
  const uid = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const coils = useMemo(() => generateCoilScene(42), []);
  const all = useMemo(() => detectionsFor(coils, 42), [coils]);
  const [threshold, setThreshold] = useState(0.5);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showScores, setShowScores] = useState(true);
  const [classes, setClasses] = useState({ coil: true, partial: true });
  const [ref, visible] = useVisibility<HTMLDivElement>();

  // Compact preview: the threshold sweeps slowly so the overlay "breathes".
  useEffect(() => {
    if (!compact || !active || !visible || reduced || getDeviceTier() === 'low') return;
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 100) return; // ~10 updates/s is plenty for a slow sweep
      last = now;
      const p = ((now - start) / 7000) % 1;
      setThreshold(Math.round((0.3 + 0.55 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2))) * 100) / 100);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [compact, active, visible, reduced]);

  const shown = filterDetections(all, threshold).filter(d => classes[d.cls]);
  const counts = countByClass(shown);
  const avg = shown.length ? shown.reduce((sum, d) => sum + d.confidence, 0) / shown.length : 0;

  const svg = (
    <svg className="det-svg" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} role="img" aria-label={c.sceneLabel(shown.length)}>
      <defs>
        <linearGradient id={`${uid}-floor`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="det-bg-top" />
          <stop offset="1" className="det-bg-bottom" />
        </linearGradient>
        <pattern id={`${uid}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" className="det-grid" />
        </pattern>
      </defs>
      <rect width={SCENE_W} height={SCENE_H} fill={`url(#${uid}-floor)`} />
      <rect width={SCENE_W} height={SCENE_H} fill={`url(#${uid}-grid)`} />
      <rect x="0" y={SCENE_H - 40} width={SCENE_W} height="40" className="det-pallet" />
      {[...coils].reverse().map(coil => (
        <CoilShape key={coil.id} c={coil} />
      ))}

      {showOverlay && (
        <g className="det-overlay">
          {shown.map(d => (
            <g key={d.id} className={`det-box det-box--${d.cls} ${d.falsePositive ? 'is-fp' : ''}`}>
              <rect x={d.x} y={d.y} width={d.w} height={d.h} rx="3" />
              {(showLabels || showScores) && (
                <g transform={`translate(${d.x} ${Math.max(10, d.y - 4)})`}>
                  <rect
                    y="-13"
                    width={(showLabels ? (d.cls === 'partial' ? 70 : 34) : 0) + (showScores ? 30 : 0) + 4}
                    height="15"
                    rx="2"
                    className="det-tag"
                  />
                  <text x="4" y="-2" className="det-tag__text">
                    {showLabels ? (d.cls === 'partial' ? c.partial : c.coil) : ''}
                    {showLabels && showScores ? ' ' : ''}
                    {showScores ? d.confidence.toFixed(2) : ''}
                  </text>
                </g>
              )}
            </g>
          ))}
        </g>
      )}
      <g className="det-hud" transform="translate(16 22)">
        <text className="det-hud__text">
          conf ≥ {threshold.toFixed(2)} · n={shown.length}
        </text>
      </g>
    </svg>
  );

  if (compact) {
    return (
      <div ref={ref} className="viz viz--compact det">
        {svg}
      </div>
    );
  }

  return (
    <div ref={ref} className="viz det">
      <p className="viz__title">{c.title}</p>
      <p className="badge-note">{c.badge}</p>
      <div className="viz__canvas">{svg}</div>

      <div className="viz__controls">
        <label className="range range--wide">
          <span className="label">
            {c.threshold}: <output data-testid="cv-threshold-value">{threshold.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min={0.1}
            max={0.95}
            step={0.01}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            data-testid="cv-threshold"
          />
        </label>

        <fieldset className="segmented">
          <legend className="label">{c.view}</legend>
          <label className={!showOverlay ? 'is-on' : ''}>
            <input type="radio" name={`${uid}-view`} checked={!showOverlay} onChange={() => setShowOverlay(false)} />
            {c.before}
          </label>
          <label className={showOverlay ? 'is-on' : ''}>
            <input type="radio" name={`${uid}-view`} checked={showOverlay} onChange={() => setShowOverlay(true)} />
            {c.after}
          </label>
        </fieldset>

        <fieldset className="toggles">
          <legend className="label">{c.options}</legend>
          <label className={`toggle ${showLabels ? 'is-on' : ''}`}>
            <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />
            {c.showLabels}
          </label>
          <label className={`toggle ${showScores ? 'is-on' : ''}`}>
            <input type="checkbox" checked={showScores} onChange={e => setShowScores(e.target.checked)} />
            {c.showScores}
          </label>
        </fieldset>

        <fieldset className="toggles">
          <legend className="label">{c.classFilter}</legend>
          {(['coil', 'partial'] as const).map(k => (
            <label key={k} className={`toggle ${classes[k] ? 'is-on' : ''}`}>
              <input
                type="checkbox"
                checked={classes[k]}
                onChange={e => setClasses(prev => ({ ...prev, [k]: e.target.checked }))}
                data-testid={`cv-class-${k}`}
              />
              <span className={`toggle__swatch toggle__swatch--${k}`} aria-hidden="true" />
              {c[k]}
            </label>
          ))}
        </fieldset>
      </div>

      <dl className="viz__stats" aria-live="polite">
        <div>
          <dt className="label">{c.detections}</dt>
          <dd data-testid="cv-count">{shown.length}</dd>
        </div>
        <div>
          <dt className="label">{c.coil}</dt>
          <dd>{counts.coil}</dd>
        </div>
        <div>
          <dt className="label">{c.partial}</dt>
          <dd>{counts.partial}</dd>
        </div>
        <div>
          <dt className="label">{c.avgConfidence}</dt>
          <dd data-testid="cv-avg">{avg.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="viz__fine">{c.explain}</p>
    </div>
  );
}

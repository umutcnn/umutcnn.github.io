import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { useEffect, useId, useReducer, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useVisibility } from '../../hooks/useReveal';
import { useReducedMotion } from '../../lib/prefs';
import {
  FL_ALGORITHMS,
  FL_LABEL,
  MAX_ROUNDS,
  MIN_ROUNDS,
  createFlState,
  driftAt,
  flReducer,
  syntheticWeights,
  type FlPhase,
} from './fl-model';
import './visualizations.css';

const PHASE_MS: Record<FlPhase, number> = { idle: 500, train: 1300, upload: 950, aggregate: 900, broadcast: 950 };
const CLIENT_Y = [70, 180, 290];
/** Illustrative data shares for the inspection panel (not experiment data). */
const SHARES = [0.49, 0.33, 0.18];
const SERVER = { x: 420, y: 180 };
const GLOBAL = { x: 572, y: 180 };

interface Props {
  /** compact = autoplaying, non-interactive preview (Work stage) */
  compact?: boolean;
  active?: boolean;
}

export function FederatedSim({ compact = false, active = true }: Props) {
  const { t } = useLocale();
  const f = t.lab.fl;
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(flReducer, undefined, () => createFlState('fedprox', compact ? 4 : 5));
  const [inspected, setInspected] = useState(0);
  const [ref, visible] = useVisibility<HTMLDivElement>('100px');
  const uid = useId().replace(/:/g, '');

  // Compact previews autoplay (and loop) while visible; the full simulator waits for the user.
  useEffect(() => {
    if (compact && active && visible && !reduced && !state.playing) dispatch({ type: 'play' });
    if (compact && (!active || !visible) && state.playing) dispatch({ type: 'pause' });
  }, [compact, active, visible, reduced, state.playing]);

  useEffect(() => {
    if (!state.playing || !visible) return;
    const id = window.setTimeout(() => dispatch({ type: 'tick' }), PHASE_MS[state.phase]);
    return () => window.clearTimeout(id);
  }, [state, visible]);

  const weights = syntheticWeights(state.algorithm, state.round, state.phase);
  const drift = driftAt(state.algorithm, state.round);
  const phaseLabel = f.phases[state.phase];
  const motion = !reduced;

  const svg = (
    <svg
      className={`fl-svg phase-${state.phase}`}
      viewBox="0 0 640 360"
      role="img"
      aria-label={`${f.badge}. ${f.round} ${state.round}/${state.rounds} — ${phaseLabel}`}
    >
      <defs>
        {CLIENT_Y.map((y, i) => (
          <path
            key={i}
            id={`${uid}-up-${i}`}
            d={`M150 ${y} C 280 ${y}, 300 ${SERVER.y}, ${SERVER.x - 46} ${SERVER.y}`}
          />
        ))}
        {CLIENT_Y.map((y, i) => (
          <path
            key={i}
            id={`${uid}-down-${i}`}
            d={`M${SERVER.x - 46} ${SERVER.y} C 300 ${SERVER.y}, 280 ${y}, 150 ${y}`}
          />
        ))}
      </defs>

      {/* links */}
      {CLIENT_Y.map((_, i) => (
        <use key={i} href={`#${uid}-up-${i}`} className="fl-link" />
      ))}
      <line x1={SERVER.x + 46} y1={SERVER.y} x2={GLOBAL.x - 34} y2={GLOBAL.y} className="fl-link" />

      {/* clients */}
      {CLIENT_Y.map((y, c) => (
        <g
          key={c}
          className={`fl-client ${!compact && inspected === c ? 'is-inspected' : ''}`}
          transform={`translate(30 ${y - 40})`}
        >
          <rect width="120" height="80" rx="12" className="fl-client__box" />
          <text x="12" y="20" className="fl-text-label">
            {f.client(c + 1)}
          </text>
          {weights.clients[c]!.map((w, d) => (
            <rect
              key={d}
              className="fl-bar"
              x={14 + d * 16}
              y={68 - w * 36}
              width="10"
              height={w * 36}
              rx="2"
              style={{ transitionDelay: `${d * 30}ms` }}
            />
          ))}
          <circle cx="108" cy="16" r="4" className="fl-lock" />
        </g>
      ))}

      {/* server / strategy */}
      <g className="fl-server" transform={`translate(${SERVER.x} ${SERVER.y})`}>
        <circle r="58" className="fl-server__ring" />
        <circle r="46" className="fl-server__core" />
        <text y="-4" textAnchor="middle" className="fl-text-title">
          {FL_LABEL[state.algorithm]}
        </text>
        <text y="14" textAnchor="middle" className="fl-text-label">
          {f.server}
        </text>
      </g>

      {/* aggregated model node */}
      <g className="fl-global" transform={`translate(${GLOBAL.x} ${GLOBAL.y})`}>
        <circle r="34" className="fl-global__ring" />
        <text y="5" textAnchor="middle" className="fl-text-title">
          v{state.round}
        </text>
        <text y="56" textAnchor="middle" className="fl-text-label">
          {f.globalModel(state.round)}
        </text>
      </g>

      {/* moving updates */}
      {motion &&
        state.phase === 'upload' &&
        CLIENT_Y.map((_, i) => (
          <circle key={`u-${state.round}-${i}`} r="6" className="fl-packet fl-packet--up">
            <animateMotion dur={`${PHASE_MS.upload}ms`} fill="freeze" begin={`${i * 80}ms`} rotate="auto">
              <mpath href={`#${uid}-up-${i}`} />
            </animateMotion>
          </circle>
        ))}
      {motion &&
        state.phase === 'broadcast' &&
        CLIENT_Y.map((_, i) => (
          <circle key={`d-${state.round}-${i}`} r="6" className="fl-packet fl-packet--down">
            <animateMotion dur={`${PHASE_MS.broadcast}ms`} fill="freeze">
              <mpath href={`#${uid}-down-${i}`} />
            </animateMotion>
          </circle>
        ))}

      {/* phase rail */}
      <g transform="translate(30 340)">
        {(['train', 'upload', 'aggregate', 'broadcast'] as FlPhase[]).map((p, i) => (
          <g key={p} transform={`translate(${i * 150} 0)`}>
            <rect width="140" height="4" rx="2" className={`fl-rail ${state.phase === p ? 'is-on' : ''}`} />
          </g>
        ))}
      </g>
    </svg>
  );

  if (compact) {
    return (
      <div ref={ref} className="viz viz--compact fl-sim">
        {svg}
      </div>
    );
  }

  return (
    <div ref={ref} className="viz fl-sim">
      <p className="badge-note">{f.badge}</p>

      <div className="viz__canvas">{svg}</div>

      <p className="viz__status" aria-live="polite">
        <span className="label">
          {f.round} {state.round} / {state.rounds}
        </span>
        <strong>{phaseLabel}</strong>
      </p>

      <div className="viz__controls">
        <fieldset className="segmented">
          <legend className="label">{f.algorithm}</legend>
          {FL_ALGORITHMS.map(a => (
            <label key={a} className={state.algorithm === a ? 'is-on' : ''}>
              <input
                type="radio"
                name={`${uid}-alg`}
                value={a}
                checked={state.algorithm === a}
                onChange={() => dispatch({ type: 'setAlgorithm', algorithm: a })}
              />
              {FL_LABEL[a]}
            </label>
          ))}
        </fieldset>

        <label className="range">
          <span className="label">
            {f.rounds}: <output>{state.rounds}</output>
          </span>
          <input
            type="range"
            min={MIN_ROUNDS}
            max={MAX_ROUNDS}
            value={state.rounds}
            onChange={e => dispatch({ type: 'setRounds', rounds: Number(e.target.value) })}
            data-testid="fl-rounds"
          />
        </label>

        <div className="viz__buttons">
          <button
            type="button"
            className="btn btn--signal btn--small"
            onClick={() => dispatch({ type: state.playing ? 'pause' : 'play' })}
            data-testid="fl-play"
          >
            {state.playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {state.playing ? f.pause : f.play}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => dispatch({ type: 'tick' })}
            disabled={state.playing}
            data-testid="fl-step"
          >
            <StepForward size={16} aria-hidden="true" />
            {f.step}
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => dispatch({ type: 'reset' })}>
            <RotateCcw size={16} aria-hidden="true" />
            {f.reset}
          </button>
        </div>
      </div>

      <div className="fl-explain" aria-live="polite">
        <p className="label">{f.nowLabel}</p>
        <p className="fl-explain__text" data-testid="fl-explain">
          {f.explain[state.phase]}
        </p>
        <p className="label">{f.ruleLabel}</p>
        <p className="fl-explain__rule" lang="en">
          {f.rules[state.algorithm]}
        </p>
      </div>

      <div className="fl-inspect">
        <fieldset className="segmented">
          <legend className="label">{f.inspect}</legend>
          {[0, 1, 2].map(c => (
            <label key={c} className={inspected === c ? 'is-on' : ''}>
              <input
                type="radio"
                name={`${uid}-client`}
                checked={inspected === c}
                onChange={() => setInspected(c)}
                data-testid={`fl-client-${c}`}
              />
              {f.client(c + 1)}
            </label>
          ))}
        </fieldset>
        <dl className="fl-inspect__card" data-testid="fl-client-card">
          <div>
            <dt className="label">{f.dataShare}</dt>
            <dd>%{Math.round(SHARES[inspected]! * 100)}</dd>
          </div>
          <div>
            <dt className="label">{f.drift}</dt>
            <dd>{(driftAt(state.algorithm, state.round) * (0.7 + inspected * 0.2)).toFixed(2)}</dd>
          </div>
        </dl>
        <p className="viz__fine">{f.keepsData}</p>
        <p className="viz__fine">{f.sends}</p>
      </div>

      <div className="viz__notes">
        <div>
          <p className="label">{f.drift}</p>
          <div
            className="meter"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={Number(drift.toFixed(2))}
            aria-label={f.drift}
          >
            <span style={{ transform: `scaleX(${drift})` }} />
          </div>
          <p className="viz__fine">{f.algorithmNotes[state.algorithm]}</p>
        </div>
        <div>
          <p className="label">{f.privacyTitle}</p>
          <p className="viz__fine">{f.privacy}</p>
          <p className="viz__fine muted">{f.synthetic}</p>
        </div>
      </div>
    </div>
  );
}

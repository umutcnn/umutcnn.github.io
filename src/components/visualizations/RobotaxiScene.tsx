import { useId, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { mulberry32 } from './particle-physics';
import './visualizations.css';

type Layer = 'camera' | 'lidar' | 'detection' | 'route';
const LAYERS: Layer[] = ['camera', 'lidar', 'detection', 'route'];

/** Ego vehicle at the bottom centre, perspective road converging at the horizon. Conceptual only. */
const EGO = { x: 320, y: 352 };
const OBJECTS = [
  { id: 'car', x: 336, y: 196, w: 58, h: 40, label: { tr: 'araç', en: 'car' }, conf: 0.93 },
  { id: 'ped', x: 196, y: 228, w: 18, h: 44, label: { tr: 'yaya', en: 'pedestrian' }, conf: 0.88 },
  { id: 'sign', x: 470, y: 150, w: 26, h: 26, label: { tr: 'dur', en: 'stop' }, conf: 0.9 },
];

function lidarPoints(): { x: number; y: number; hit: boolean }[] {
  const rand = mulberry32(99);
  const pts: { x: number; y: number; hit: boolean }[] = [];
  for (let ring = 1; ring <= 9; ring++) {
    const rx = 40 + ring * 34;
    const ry = 12 + ring * 11;
    for (let a = 0; a < 64; a++) {
      const theta = Math.PI + (a / 63) * Math.PI;
      const x = EGO.x + Math.cos(theta) * rx + (rand() - 0.5) * 2;
      const y = EGO.y + Math.sin(theta) * ry + (rand() - 0.5) * 2;
      if (y < 128) continue;
      const hit = OBJECTS.some(o => x > o.x - 6 && x < o.x + o.w + 6 && y > o.y - 6 && y < o.y + o.h + 8);
      pts.push({ x, y, hit });
    }
  }
  return pts;
}

const LIDAR_POINTS = lidarPoints();
/** All points as zero-length round-capped segments: one element per class instead of hundreds. */
const toPath = (pts: { x: number; y: number }[]) => pts.map(p => `M${p.x.toFixed(1)} ${p.y.toFixed(1)}h0`).join('');
const LIDAR_FREE = toPath(LIDAR_POINTS.filter(p => !p.hit));
const LIDAR_HIT = toPath(LIDAR_POINTS.filter(p => p.hit));

export function RobotaxiScene({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLocale();
  const uid = useId().replace(/:/g, '');
  const [on, setOn] = useState<Record<Layer, boolean>>({ camera: true, lidar: true, detection: true, route: true });

  const svg = (
    <svg
      className="taxi-svg"
      viewBox="0 0 640 380"
      role="img"
      aria-label={`${t.common.conceptual} — ${locale === 'tr' ? 'Robotaksi' : 'Robotaxi'}`}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="taxi-sky-top" />
          <stop offset="1" className="taxi-sky-bottom" />
        </linearGradient>
        <linearGradient id={`${uid}-fov`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" className="taxi-fov-a" />
          <stop offset="1" className="taxi-fov-b" />
        </linearGradient>
      </defs>
      <rect width="640" height="130" fill={`url(#${uid}-sky)`} />
      <rect y="130" width="640" height="250" className="taxi-ground" />
      {/* road in perspective */}
      <path d="M300 130 L340 130 L600 380 L40 380 Z" className="taxi-road" />
      <path d="M320 130 L320 380" className="taxi-lane" />
      <path d="M310 130 L170 380" className="taxi-edge" />
      <path d="M330 130 L470 380" className="taxi-edge" />
      {/* static objects */}
      <rect x="336" y="196" width="58" height="40" rx="6" className="taxi-obj" />
      <rect x="196" y="228" width="18" height="44" rx="8" className="taxi-obj" />
      <polygon points="483,150 496,157 496,170 483,176 470,170 470,157" className="taxi-sign" />
      <line x1="483" y1="176" x2="483" y2="214" className="taxi-pole" />

      {on.camera && (
        <path d={`M${EGO.x} ${EGO.y} L120 140 L520 140 Z`} fill={`url(#${uid}-fov)`} className="taxi-fov" />
      )}
      {on.lidar && (
        <g className="taxi-lidar">
          <path d={LIDAR_FREE} className="taxi-lidar__free" />
          <path d={LIDAR_HIT} className="taxi-lidar__hit" />
        </g>
      )}
      {on.route && (
        <g className="taxi-route">
          <path d={`M${EGO.x} ${EGO.y - 18} C 316 300, 300 260, 286 236 S 262 170, 300 140`} />
        </g>
      )}
      {on.detection && (
        <g className="taxi-dets">
          {OBJECTS.map(o => (
            <g key={o.id}>
              <rect x={o.x - 5} y={o.y - 5} width={o.w + 10} height={o.h + 10} rx="3" />
              <text x={o.x - 5} y={o.y - 9}>
                {o.label[locale]} {o.conf.toFixed(2)}
              </text>
            </g>
          ))}
        </g>
      )}
      {/* ego vehicle */}
      <path
        d={`M${EGO.x - 36} 380 L${EGO.x - 30} ${EGO.y - 8} Q ${EGO.x} ${EGO.y - 24} ${EGO.x + 30} ${EGO.y - 8} L${EGO.x + 36} 380 Z`}
        className="taxi-ego"
      />
    </svg>
  );

  if (compact) return <div className="viz viz--compact taxi">{svg}</div>;

  return (
    <div className="viz taxi">
      <p className="badge-note">{t.common.conceptual}</p>
      <div className="viz__canvas">{svg}</div>
      <fieldset className="toggles">
        <legend className="label">{t.common.layersLabel}</legend>
        {LAYERS.map(layer => (
          <label key={layer} className={`toggle ${on[layer] ? 'is-on' : ''}`}>
            <input
              type="checkbox"
              checked={on[layer]}
              onChange={e => setOn(prev => ({ ...prev, [layer]: e.target.checked }))}
              data-testid={`layer-${layer}`}
            />
            <span className={`toggle__swatch toggle__swatch--${layer}`} aria-hidden="true" />
            {t.common.layers[layer]}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

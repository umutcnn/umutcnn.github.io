import { Moon, Sun } from 'lucide-react';
import { useId, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import './visualizations.css';

type Kind = 'vehicle' | 'person' | 'pad-ok' | 'pad-blocked';

interface Item {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
}

/** Hand-placed, representative top-down scene. Not competition data and not model output. */
const ITEMS: Item[] = [
  { kind: 'vehicle', x: 118, y: 168, w: 28, h: 50, conf: 0.94 },
  { kind: 'vehicle', x: 168, y: 260, w: 28, h: 50, conf: 0.91 },
  { kind: 'vehicle', x: 300, y: 214, w: 52, h: 26, conf: 0.88 },
  { kind: 'vehicle', x: 470, y: 128, w: 28, h: 48, conf: 0.9 },
  { kind: 'person', x: 248, y: 120, w: 12, h: 12, conf: 0.81 },
  { kind: 'person', x: 410, y: 300, w: 12, h: 12, conf: 0.77 },
  { kind: 'person', x: 548, y: 210, w: 12, h: 12, conf: 0.84 },
  { kind: 'pad-ok', x: 380, y: 40, w: 84, h: 84, conf: 0.93 },
  { kind: 'pad-blocked', x: 520, y: 270, w: 84, h: 84, conf: 0.89 },
];

/** Scene x (of 640) beyond which a detection label would run past the right edge. */
const LABEL_FLIP_X = 440;

const LABEL: Record<Kind, { tr: string; en: string }> = {
  vehicle: { tr: 'taşıt', en: 'vehicle' },
  person: { tr: 'insan', en: 'person' },
  'pad-ok': { tr: 'iniş · uygun', en: 'landing · clear' },
  'pad-blocked': { tr: 'iniş · uygun değil', en: 'landing · blocked' },
};

export function AerialScene({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLocale();
  const uid = useId().replace(/:/g, '');
  const [night, setNight] = useState(false);
  const label = `${t.common.representative} — TEKNOFEST 2023`;

  const svg = (
    <svg className={`aerial-svg ${night ? 'is-night' : ''}`} viewBox="0 0 640 380" role="img" aria-label={label}>
      <defs>
        <pattern id={`${uid}-grass`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="aerial-grain" />
        </pattern>
        <radialGradient id={`${uid}-vignette`} cx="50%" cy="50%" r="70%">
          <stop offset="0.6" stopColor="transparent" />
          <stop offset="1" className="aerial-vignette" />
        </radialGradient>
      </defs>
      <rect width="640" height="380" className="aerial-ground" />
      <rect width="640" height="380" fill={`url(#${uid}-grass)`} />
      {/* roads */}
      <rect x="100" y="0" width="110" height="380" className="aerial-road" />
      <rect x="0" y="196" width="640" height="70" className="aerial-road" />
      <line x1="155" y1="0" x2="155" y2="380" className="aerial-lane" />
      <line x1="0" y1="231" x2="640" y2="231" className="aerial-lane" />
      {/* buildings */}
      <rect x="250" y="20" width="96" height="70" className="aerial-roof" />
      <rect x="20" y="20" width="60" height="120" className="aerial-roof" />
      <rect x="250" y="292" width="120" height="70" className="aerial-roof" />
      {/* landing pads */}
      {ITEMS.filter(i => i.kind.startsWith('pad')).map((p, i) => (
        <g key={i} transform={`translate(${p.x + p.w / 2} ${p.y + p.h / 2})`}>
          <circle r="36" className="aerial-pad" />
          <text y="9" textAnchor="middle" className="aerial-pad__h">
            H
          </text>
        </g>
      ))}
      {/* obstruction on the blocked pad */}
      <rect x="566" y="300" width="24" height="40" rx="4" className="aerial-car" transform="rotate(-20 578 320)" />
      {ITEMS.filter(i => i.kind === 'vehicle').map((v, i) => (
        <rect key={i} x={v.x} y={v.y} width={v.w} height={v.h} rx="5" className="aerial-car" />
      ))}
      {ITEMS.filter(i => i.kind === 'person').map((p, i) => (
        <circle key={i} cx={p.x + 6} cy={p.y + 6} r="5" className="aerial-person" />
      ))}
      {night && <rect width="640" height="380" fill={`url(#${uid}-vignette)`} />}

      {/* detections */}
      <g className="aerial-dets">
        {ITEMS.map((d, i) => (
          <g key={i} className={`aerial-det aerial-det--${d.kind}`} style={{ animationDelay: `${i * 120}ms` }}>
            <rect x={d.x - 4} y={d.y - 4} width={d.w + 8} height={d.h + 8} rx="3" />
            {/* labels of boxes in the right part of the scene are right-aligned so they stay inside the frame */}
            <text
              x={d.x + d.w / 2 > LABEL_FLIP_X ? d.x + d.w + 4 : d.x - 4}
              y={d.y - 8}
              textAnchor={d.x + d.w / 2 > LABEL_FLIP_X ? 'end' : undefined}
              className="aerial-det__text"
            >
              {LABEL[d.kind][locale]} {d.conf.toFixed(2)}
            </text>
          </g>
        ))}
      </g>
      <rect x="0" y="0" width="640" height="3" className="aerial-scan" />
    </svg>
  );

  if (compact) return <div className="viz viz--compact aerial">{svg}</div>;

  return (
    <div className="viz aerial">
      <p className="badge-note">{t.common.representative}</p>
      <div className="viz__canvas">{svg}</div>
      <div className="viz__controls">
        <fieldset className="segmented">
          <legend className="label">
            {t.common.dayNight.day} / {t.common.dayNight.night}
          </legend>
          <label className={!night ? 'is-on' : ''}>
            <input type="radio" name={`${uid}-dn`} checked={!night} onChange={() => setNight(false)} />
            <Sun size={14} aria-hidden="true" /> {t.common.dayNight.day}
          </label>
          <label className={night ? 'is-on' : ''}>
            <input type="radio" name={`${uid}-dn`} checked={night} onChange={() => setNight(true)} />
            <Moon size={14} aria-hidden="true" /> {t.common.dayNight.night}
          </label>
        </fieldset>
      </div>
    </div>
  );
}

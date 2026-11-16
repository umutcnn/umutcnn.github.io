import { useEffect, useRef } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { useVisibility } from '../../hooks/useReveal';
import { useReducedMotion } from '../../lib/prefs';
import './visualizations.css';

type V3 = [number, number, number];

/** A representative flange (not customer data): base disk, hub, bore and a 6-hole bolt circle. */
const PART = { outerR: 100, baseH: 24, hubR: 46, hubH: 44, boreR: 22, boltR: 8, pcdR: 74, bolts: 6 };

function circle(r: number, y: number, cx = 0, cz = 0, seg = 48): V3[] {
  return Array.from({ length: seg + 1 }, (_, i) => {
    const a = (i / seg) * Math.PI * 2;
    return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3;
  });
}

function buildPolylines(): V3[][] {
  const { outerR, baseH, hubR, hubH, boreR, boltR, pcdR, bolts } = PART;
  const y0 = -baseH / 2;
  const y1 = baseH / 2;
  const y2 = y1 + hubH;
  const lines: V3[][] = [
    circle(outerR, y0),
    circle(outerR, y1),
    circle(hubR, y1),
    circle(hubR, y2),
    circle(boreR, y0),
    circle(boreR, y2),
  ];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    lines.push([
      [c * outerR, y0, s * outerR],
      [c * outerR, y1, s * outerR],
    ]);
    if (k % 2 === 0)
      lines.push([
        [c * hubR, y1, s * hubR],
        [c * hubR, y2, s * hubR],
      ]);
  }
  for (let b = 0; b < bolts; b++) {
    const a = (b / bolts) * Math.PI * 2 + Math.PI / bolts;
    const cx = Math.cos(a) * pcdR;
    const cz = Math.sin(a) * pcdR;
    lines.push(circle(boltR, y1, cx, cz, 20), circle(boltR, y0, cx, cz, 20));
  }
  return lines;
}

function bboxCorners(): V3[] {
  const { outerR, baseH, hubH } = PART;
  const ys = [-baseH / 2, baseH / 2 + hubH];
  const out: V3[] = [];
  for (const x of [-outerR, outerR]) for (const y of ys) for (const z of [-outerR, outerR]) out.push([x, y, z]);
  return out;
}
const POLYLINES = buildPolylines();
const CORNERS = bboxCorners();

const BOX_EDGES: [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [0, 2],
  [1, 3],
  [4, 6],
  [5, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

function project([x, y, z]: V3, yaw: number, pitch: number): [number, number] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  const f = 620 / (620 + z2);
  return [320 + x1 * f * 1.35, 214 - y2 * f * 1.35];
}

export function CadWireframe({ compact = false, active = true }: { compact?: boolean; active?: boolean }) {
  const { t, locale } = useLocale();
  const reduced = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const boxRef = useRef<SVGPathElement>(null);
  const [wrapRef, visible] = useVisibility<HTMLDivElement>('80px');

  useEffect(() => {
    const draw = (yaw: number) => {
      const pitch = -0.52;
      let d = '';
      for (const line of POLYLINES) {
        line.forEach((p, i) => {
          const [px, py] = project(p, yaw, pitch);
          d += `${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`;
        });
      }
      pathRef.current?.setAttribute('d', d);
      const pc = CORNERS.map(c => project(c, yaw, pitch));
      let bd = '';
      for (const [a, b] of BOX_EDGES)
        bd += `M${pc[a]![0].toFixed(1)} ${pc[a]![1].toFixed(1)}L${pc[b]![0].toFixed(1)} ${pc[b]![1].toFixed(1)}`;
      boxRef.current?.setAttribute('d', bd);
    };
    draw(0.6);
    if (reduced || !visible || !active) return;
    let raf = 0;
    let yaw = 0.6;
    let last = performance.now();
    const loop = (now: number) => {
      yaw += ((now - last) / 1000) * 0.32;
      last = now;
      draw(yaw);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, visible, active]);

  const dims = [
    `BBOX ${PART.outerR * 2} × ${PART.outerR * 2} × ${PART.baseH + PART.hubH} mm`,
    `Ø${PART.outerR * 2} · Ø${PART.hubR * 2} · Ø${PART.boreR * 2}`,
    `${PART.bolts}× Ø${PART.boltR * 2} @ PCD ${PART.pcdR * 2}`,
  ];
  const label =
    locale === 'tr' ? 'Temsilî flanş parçası tel kafes görünümü' : 'Representative flange part, wireframe view';

  return (
    <div ref={wrapRef} className={`viz cad ${compact ? 'viz--compact' : ''}`}>
      {!compact && <p className="badge-note">{t.common.representative}</p>}
      <div className={compact ? undefined : 'viz__canvas'}>
        <svg className="cad-svg" viewBox="0 0 640 400" role="img" aria-label={label}>
          <g className="cad-axes">
            <line x1="40" y1="360" x2="100" y2="360" />
            <line x1="40" y1="360" x2="40" y2="300" />
            <text x="106" y="364">
              X
            </text>
            <text x="36" y="292">
              Y
            </text>
          </g>
          <path ref={boxRef} className="cad-bbox" />
          <path ref={pathRef} className="cad-wire" />
          <g className="cad-dims" transform="translate(452 40)">
            {dims.map((d, i) => (
              <g key={d} transform={`translate(0 ${i * 26})`}>
                <rect width="172" height="20" rx="3" />
                <text x="8" y="14">
                  {d}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

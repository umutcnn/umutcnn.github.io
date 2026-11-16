import { Maximize, Minus, Plus } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { ARCHITECTURES, type ArchNode } from '../../content/architectures';
import type { ArchitectureId } from '../../types/content';
import './visualizations.css';

interface Props {
  id: ArchitectureId;
  compact?: boolean;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.4;

/** Path for an edge in the 100×60 grid; backward edges (feedback loops) arc below the chain. */
export function edgePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  if (b.x < a.x - 1) {
    const dip = Math.min(58, Math.max(a.y, b.y) + 22);
    return `M${a.x} ${a.y} C ${a.x} ${dip}, ${b.x} ${dip}, ${b.x} ${b.y}`;
  }
  return `M${a.x} ${a.y} L ${b.x} ${b.y}`;
}

/** Zoom around a fixed point (the stage centre) — pure, unit-tested. */
export function zoomAround(
  v: { x: number; y: number; z: number },
  factor: number,
  cx: number,
  cy: number,
): { x: number; y: number; z: number } {
  const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.z * factor));
  return { z, x: cx - ((cx - v.x) * z) / v.z, y: cy - ((cy - v.y) * z) / v.z };
}

/**
 * Accessible system diagram. Edges are an SVG underlay, nodes are real <button>s (keyboard-operable, announced).
 * Interactive mode adds zoom / pan / fit (buttons, drag, Ctrl+wheel, keyboard), flowing connections and
 * hover/focus previews. Narrow containers switch to an ordered flow list (container query).
 */
export function ArchitectureGraph({ id, compact = false }: Props) {
  const { t, l } = useLocale();
  const arch = ARCHITECTURES[id];
  const [selected, setSelected] = useState<string | null>(compact ? null : (arch.nodes[0]?.id ?? null));
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const uid = useId().replace(/:/g, '');
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const view = useRef({ x: 0, y: 0, z: 1 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const focusId = preview ?? selected;
  const node = arch.nodes.find(n => n.id === focusId) ?? null;
  const byId = (nid: string) => arch.nodes.find(n => n.id === nid)!;
  const isLinked = (from: string, to: string) => focusId !== null && (from === focusId || to === focusId);

  const setView = (next: { x: number; y: number; z: number }) => {
    view.current = { ...next, z: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.z)) };
    const v = view.current;
    if (viewRef.current) viewRef.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    setZoom(v.z);
  };
  const zoomBy = (factor: number) => {
    const el = stageRef.current;
    setView(zoomAround(view.current, factor, (el?.clientWidth ?? 0) / 2, (el?.clientHeight ?? 0) / 2));
  };
  const fit = () => setView({ x: 0, y: 0, z: 1 });
  const zoomRef = useRef(zoomBy);
  useEffect(() => {
    zoomRef.current = zoomBy;
  });

  // Ctrl/⌘ + wheel zooms (a plain wheel keeps scrolling the page — no scroll hijacking).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || compact) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomRef.current(e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [compact]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (compact || (e.target as HTMLElement).closest('button')) return;
    drag.current = { id: e.pointerId, x: e.clientX - view.current.x, y: e.clientY - view.current.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('is-dragging');
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    view.current = { ...view.current, x: e.clientX - d.x, y: e.clientY - d.y };
    if (viewRef.current) {
      const v = view.current;
      viewRef.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
    }
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    e.currentTarget.classList.remove('is-dragging');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (compact || e.target !== e.currentTarget) return;
    const step = 40;
    const v = view.current;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => setView({ ...v, x: v.x + step }),
      ArrowRight: () => setView({ ...v, x: v.x - step }),
      ArrowUp: () => setView({ ...v, y: v.y + step }),
      ArrowDown: () => setView({ ...v, y: v.y - step }),
      '+': () => zoomBy(1.2),
      '=': () => zoomBy(1.2),
      '-': () => zoomBy(1 / 1.2),
      '0': fit,
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };

  const select = (n: ArchNode) => setSelected(n.id);

  return (
    <div className={`arch ${compact ? 'arch--compact' : ''}`}>
      {!compact && (
        <div className="arch__toolbar">
          <span className="label arch__zoom" aria-live="polite" data-testid="arch-zoom">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => zoomBy(1 / 1.2)}
            aria-label={t.lab.arch.zoomOut}
            disabled={zoom <= MIN_ZOOM + 0.001}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => zoomBy(1.2)}
            aria-label={t.lab.arch.zoomIn}
            disabled={zoom >= MAX_ZOOM - 0.001}
            data-testid="arch-zoom-in"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" onClick={fit} aria-label={t.lab.arch.fit} data-testid="arch-fit">
            <Maximize size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <div
        ref={stageRef}
        className="arch__stage"
        aria-hidden={compact || undefined}
        role={compact ? undefined : 'group'}
        aria-label={compact ? undefined : `${l(arch.title)} — ${t.lab.arch.canvas}`}
        tabIndex={compact ? undefined : 0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-testid={compact ? undefined : 'arch-stage'}
      >
        <div ref={viewRef} className="arch__viewport">
          <svg className="arch__edges" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker
                id={`${uid}-arrow`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10z" className="arch__arrow" />
              </marker>
            </defs>
            {arch.edges.map((e, i) => (
              <path
                key={i}
                d={edgePath(byId(e.from), byId(e.to))}
                className={`arch__edge ${isLinked(e.from, e.to) ? 'is-on' : ''}`}
                vectorEffect="non-scaling-stroke"
                markerEnd={`url(#${uid}-arrow)`}
                fill="none"
                style={{ '--i': i } as CSSProperties}
              />
            ))}
          </svg>
          {arch.edges
            .filter(e => e.label)
            .map(e => {
              const a = byId(e.from);
              const b = byId(e.to);
              const y = b.x < a.x ? Math.min(58, Math.max(a.y, b.y) + 16) : (a.y + b.y) / 2;
              return (
                <span
                  key={`${e.from}-${e.to}`}
                  className="arch__edge-label label"
                  aria-hidden="true"
                  style={{ left: `${(a.x + b.x) / 2}%`, top: `${(y / 60) * 100}%` }}
                >
                  {l(e.label!)}
                </span>
              );
            })}
          {arch.nodes.map(n => (
            <button
              key={n.id}
              type="button"
              className={`arch__node arch__node--${n.tone} ${selected === n.id ? 'is-selected' : ''} ${preview === n.id ? 'is-preview' : ''}`}
              style={{ left: `${n.x}%`, top: `${(n.y / 60) * 100}%` }}
              onClick={() => select(n)}
              onPointerEnter={() => !compact && setPreview(n.id)}
              onPointerLeave={() => setPreview(null)}
              onFocus={() => !compact && setPreview(n.id)}
              onBlur={() => setPreview(null)}
              aria-pressed={selected === n.id}
              aria-describedby={compact ? undefined : `${uid}-detail`}
              tabIndex={compact ? -1 : 0}
            >
              {l(n.label)}
            </button>
          ))}
        </div>
      </div>

      {!compact && (
        <>
          <ol className="arch__list">
            {arch.nodes.map(n => (
              <li key={n.id}>
                <button
                  type="button"
                  className={`arch__list-btn arch__node--${n.tone} ${selected === n.id ? 'is-selected' : ''}`}
                  onClick={() => select(n)}
                  aria-pressed={selected === n.id}
                >
                  {l(n.label)}
                </button>
              </li>
            ))}
          </ol>
          <div id={`${uid}-detail`} className="arch__detail" aria-live="polite">
            {node ? (
              <>
                <p className="arch__detail-title">{l(node.label)}</p>
                <p>{l(node.detail)}</p>
              </>
            ) : (
              <p className="muted">{t.lab.arch.nodeHint}</p>
            )}
          </div>
          <p className="viz__fine muted">{l(arch.summary)}</p>
        </>
      )}
    </div>
  );
}

/** Conceptual role × action matrix for the ERP case study. */
export function PermissionMatrix() {
  const { t } = useLocale();
  const c = t.caseStudy;
  // conceptual pattern only — not the real permission set
  const grid = [
    [true, true, true, true],
    [true, true, false, true],
    [true, false, false, true],
    [false, false, false, true],
  ];
  return (
    <div className="perm" role="region" aria-label={c.permissionMatrix} tabIndex={0}>
      <table>
        <caption className="label">{c.permissionMatrix}</caption>
        <thead>
          <tr>
            <td />
            {c.permissionActions.map(a => (
              <th key={a} scope="col">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.permissionRoles.map((role, r) => (
            <tr key={role}>
              <th scope="row">{role}</th>
              {grid[r]!.map((ok, a) => (
                <td key={a} className={ok ? 'is-ok' : 'is-no'}>
                  <span aria-hidden="true">{ok ? '●' : '—'}</span>
                  <span className="sr-only">{ok ? c.allowed : c.denied}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

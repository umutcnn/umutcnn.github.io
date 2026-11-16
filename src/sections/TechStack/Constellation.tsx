import { useMemo, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { DOMAINS, layoutConstellation, type DomainId } from '../../content/constellation';
import { TECHS } from '../../content/skills';
import { PROFILE } from '../../content/profile';
import type { TechId } from '../../types/content';

export type Selection = { kind: 'domain'; id: DomainId } | { kind: 'tech'; id: TechId } | null;

/** Which domains / technologies light up for a selection (pure). */
export function litSets(selection: Selection): { domains: Set<DomainId>; techs: Set<TechId> } {
  if (!selection) return { domains: new Set(), techs: new Set() };
  if (selection.kind === 'domain') {
    const d = DOMAINS.find(x => x.id === selection.id)!;
    return { domains: new Set([d.id]), techs: new Set(d.techs) };
  }
  return {
    domains: new Set(DOMAINS.filter(d => d.techs.includes(selection.id)).map(d => d.id)),
    techs: new Set([selection.id]),
  };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * Interactive constellation (desktop / wide containers). Lines are an SVG underlay; every node is a real
 * <button>, so the map is fully keyboard- and screen-reader-operable. Narrow screens get the list instead.
 */
export function Constellation({ selection, onSelect }: { selection: Selection; onSelect: (s: Selection) => void }) {
  const { t, l } = useLocale();
  const layout = useMemo(() => layoutConstellation(DOMAINS, id => TECHS[id].label), []);
  const [preview, setPreview] = useState<Selection>(null);
  const active = preview ?? selection;
  const lit = litSets(active);
  const has = active !== null;
  const { width: W, height: H, center } = layout;

  return (
    <div className={`constellation ${has ? 'has-focus' : ''}`} role="group" aria-label={t.stack.mapLabel}>
      <svg className="constellation__lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {DOMAINS.map(d => {
          const p = layout.domains[d.id];
          return (
            <line
              key={d.id}
              x1={center.x}
              y1={center.y}
              x2={p.x}
              y2={p.y}
              className={`constellation__spoke ${lit.domains.has(d.id) ? 'is-lit' : ''}`}
            />
          );
        })}
        {DOMAINS.flatMap(d =>
          d.techs.map(tech => {
            const p = layout.domains[d.id];
            const q = layout.techs.get(tech)!;
            const on = lit.domains.has(d.id) && lit.techs.has(tech);
            return (
              <line
                key={`${d.id}-${tech}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                className={`constellation__link ${on ? 'is-lit' : ''} ${q.domain !== d.id ? 'is-cross' : ''}`}
              />
            );
          }),
        )}
      </svg>

      <button
        type="button"
        className="constellation__center"
        style={{ left: pct(center.x, W), top: pct(center.y, H) }}
        onClick={() => onSelect(null)}
        aria-label={`${PROFILE.name} — ${t.stack.clear}`}
      >
        <span aria-hidden="true">
          UMUT CAN
          <br />
          YILDIZ
        </span>
      </button>

      {DOMAINS.map(d => {
        const p = layout.domains[d.id];
        const pressed = selection?.kind === 'domain' && selection.id === d.id;
        return (
          <button
            key={d.id}
            type="button"
            className={`constellation__domain ${lit.domains.has(d.id) ? 'is-lit' : ''}`}
            style={{ left: pct(p.x, W), top: pct(p.y, H) }}
            aria-pressed={pressed}
            onClick={() => onSelect(pressed ? null : { kind: 'domain', id: d.id })}
            onPointerEnter={() => setPreview({ kind: 'domain', id: d.id })}
            onPointerLeave={() => setPreview(null)}
            data-testid={`domain-${d.id}`}
          >
            {l(d.title)}
          </button>
        );
      })}

      {[...layout.techs.entries()].map(([tech, q]) => {
        const pressed = selection?.kind === 'tech' && selection.id === tech;
        return (
          <button
            key={tech}
            type="button"
            className={`constellation__tech ${lit.techs.has(tech) ? 'is-lit' : ''}`}
            style={{ left: pct(q.x, W), top: pct(q.y, H) }}
            aria-pressed={pressed}
            onClick={() => onSelect(pressed ? null : { kind: 'tech', id: tech })}
            onPointerEnter={() => setPreview({ kind: 'tech', id: tech })}
            onPointerLeave={() => setPreview(null)}
            data-testid={`node-${tech}`}
          >
            {TECHS[tech].label}
          </button>
        );
      })}
    </div>
  );
}

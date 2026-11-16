import { describe, expect, it, vi } from 'vitest';
import { edgePath, zoomAround } from '../../src/components/visualizations/ArchitectureGraph';
import {
  buildAdjacency,
  buildEdges,
  createField,
  exitOffset,
  flow,
  mulberry32,
  nearestNode,
  spawnSignal,
  stepSignals,
} from '../../src/components/visualizations/particle-physics';
import { ARCHITECTURES } from '../../src/content/architectures';
import {
  DOMAINS,
  domainsForTech,
  layoutConstellation,
  overlapCount,
  projectsForDomain,
} from '../../src/content/constellation';
import { TECHS } from '../../src/content/skills';
import { resolveQuality, QUALITY_BUDGET } from '../../src/motion/quality';
import { runPageTransition } from '../../src/motion/page-transition';
import { kineticParams, stepChar, targetOffset, type CharBody } from '../../src/sections/Hero/kinetic';
import { litSets } from '../../src/sections/TechStack/Constellation';

describe('animation quality tiers', () => {
  it('always honours reduced motion first', () => {
    expect(resolveQuality({ reducedMotion: true, tier: 'high' })).toBe('minimal');
  });
  it('maps device tiers without ever upgrading', () => {
    expect(resolveQuality({ reducedMotion: false, tier: 'high' })).toBe('full');
    expect(resolveQuality({ reducedMotion: false, tier: 'mid' })).toBe('balanced');
    expect(resolveQuality({ reducedMotion: false, tier: 'low' })).toBe('minimal');
  });
  it('gives the minimal tier no animated signals', () => {
    expect(QUALITY_BUDGET.minimal.signals).toBe(0);
    expect(QUALITY_BUDGET.full.signals).toBeGreaterThan(QUALITY_BUDGET.balanced.signals);
  });
});

describe('kinetic name', () => {
  const p = kineticParams(200);
  const body = (): CharBody => ({ cx: 100, cy: 100, x: 0, y: 0, vx: 0, vy: 0, rot: 0 });

  it('pushes a character away from the pointer, capped for readability', () => {
    const t = targetOffset(body(), 80, 100, p);
    expect(t.x).toBeGreaterThan(0); // pointer on the left → pushed right
    expect(Math.abs(t.x)).toBeLessThanOrEqual(p.maxShift);
    expect(t.f).toBeGreaterThan(0);
    expect(targetOffset(body(), 100 + p.radius + 1, 100, p)).toEqual({ x: 0, y: 0, f: 0 });
  });

  it('springs back to rest when the pointer leaves', () => {
    const c = body();
    for (let i = 0; i < 20; i++) stepChar(c, 12, -6, 0.8, p);
    let moving = true;
    for (let i = 0; i < 400 && moving; i++) moving = stepChar(c, 0, 0, 0, p);
    expect(moving).toBe(false);
    expect(Math.abs(c.x)).toBeLessThan(0.1);
    expect(Math.abs(c.y)).toBeLessThan(0.1);
  });
});

describe('intelligence field', () => {
  it('keeps the flow field bounded', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = flow(i * 37, i * 53, i * 0.1);
      expect(Math.abs(a)).toBeLessThanOrEqual(1);
      expect(Math.abs(b)).toBeLessThanOrEqual(1);
    }
  });

  it('builds an adjacency list consistent with the edges', () => {
    const nodes = createField(400, 300, 50);
    const edges = buildEdges(nodes, 90);
    const adj = buildAdjacency(nodes.length, edges);
    for (let e = 0; e < edges.length / 2; e++) {
      expect(adj[edges[e * 2]!]).toContain(e);
      expect(adj[edges[e * 2 + 1]!]).toContain(e);
    }
  });

  it('moves signals along connected edges (paths through the mesh)', () => {
    const nodes = createField(400, 300, 60);
    const edges = buildEdges(nodes, 90);
    const adj = buildAdjacency(nodes.length, edges);
    const rand = mulberry32(3);
    const s = spawnSignal(edges.length / 2, rand);
    for (let i = 0; i < 50; i++) {
      const before = s.forward ? edges[s.edge * 2 + 1]! : edges[s.edge * 2]!;
      const prevEdge = s.edge;
      stepSignals([s], edges, adj, 1.2, rand); // > 1 edge per step → arrives every time
      if (s.edge !== prevEdge) {
        // the new edge starts at the node the signal just reached
        const start = s.forward ? edges[s.edge * 2]! : edges[s.edge * 2 + 1]!;
        expect(start).toBe(before);
      }
      expect(s.edge).toBeLessThan(edges.length / 2);
    }
  });

  it('disperses radially on exit, deeper layers slower', () => {
    const n = { hx: 0, hy: 0, x: 300, y: 100, vx: 0, vy: 0, phase: 0, z: 1, accent: 0 as const, size: 1 };
    expect(exitOffset(n, 0, 100, 100, 500)).toEqual([0, 0]);
    const [x1] = exitOffset(n, 0.5, 100, 100, 500);
    const [x2, y2] = exitOffset(n, 1, 100, 100, 500);
    expect(x2).toBeGreaterThan(x1);
    expect(x1).toBeGreaterThan(0);
    expect(Math.abs(y2)).toBeLessThan(1e-9);
    const far = exitOffset({ ...n, z: 0.35 }, 1, 100, 100, 500)[0];
    expect(far).toBeLessThan(x2);
  });

  it('finds the nearest node', () => {
    const nodes = createField(200, 200, 30);
    const i = nearestNode(nodes, nodes[7]!.x + 0.5, nodes[7]!.y);
    expect(i).toBe(7);
  });
});

describe('knowledge constellation', () => {
  it('maps every technology to at least one domain and only to known technologies', () => {
    for (const d of DOMAINS) d.techs.forEach(t => expect(TECHS[t], `${d.id}/${t}`).toBeDefined());
    for (const t of Object.keys(TECHS) as (keyof typeof TECHS)[])
      expect(domainsForTech(t).length, t).toBeGreaterThan(0);
  });

  it('lays out all labels without overlaps', () => {
    const layout = layoutConstellation(DOMAINS, id => TECHS[id].label);
    expect(layout.techs.size).toBe(Object.keys(TECHS).length);
    expect(overlapCount(layout)).toBe(0);
    for (const b of layout.techs.values()) {
      expect(b.x - b.w / 2).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w / 2).toBeLessThanOrEqual(layout.width);
    }
  });

  it('derives domain → project links from the content model', () => {
    const fed = DOMAINS.find(d => d.id === 'federated')!;
    expect(projectsForDomain(fed).map(p => p.slug)).toContain('federated-cataract-detection');
    const cad = DOMAINS.find(d => d.id === 'cad')!;
    expect(projectsForDomain(cad).map(p => p.slug)).toContain('maks-cad-intelligence');
  });

  it('lights a domain with its technologies, and a technology with its domains', () => {
    const d = litSets({ kind: 'domain', id: 'vision' });
    expect(d.techs.has('yolo')).toBe(true);
    const t = litSets({ kind: 'tech', id: 'python' });
    expect(t.domains.has('ai')).toBe(true);
    expect(litSets(null).techs.size).toBe(0);
  });
});

describe('architecture explorer', () => {
  const chain = (id: keyof typeof ARCHITECTURES) => {
    const a = ARCHITECTURES[id];
    return a.edges.filter(e => {
      const from = a.nodes.find(n => n.id === e.from)!;
      const to = a.nodes.find(n => n.id === e.to)!;
      return to.x > from.x; // forward edges only
    });
  };
  const label = (id: keyof typeof ARCHITECTURES, nid: string) =>
    ARCHITECTURES[id].nodes.find(n => n.id === nid)!.label.en;

  it('follows the flows specified in the brief', () => {
    const erp = chain('maks-erp').map(e => `${label('maks-erp', e.from)} → ${label('maks-erp', e.to)}`);
    expect(erp).toEqual(
      expect.arrayContaining([
        'React UI → API (NestJS)',
        'API (NestJS) → Business services',
        'Business services → Prisma',
        'Prisma → SQL Server',
      ]),
    );
    expect(chain('maks-cad').map(e => label('maks-cad', e.to))).toEqual([
      'Application services',
      'OCCT',
      'STEP processing',
      'BOM export',
    ]);
    expect(chain('federated').map(e => label('federated', e.to))).toEqual([
      'Local training',
      'Model updates',
      'Aggregation',
      'Global model',
    ]);
  });

  it('draws feedback edges as arcs and forward edges as lines', () => {
    expect(edgePath({ x: 10, y: 30 }, { x: 90, y: 30 })).toMatch(/^M10 30 L 90 30$/);
    expect(edgePath({ x: 90, y: 30 }, { x: 10, y: 30 })).toContain(' C ');
  });

  it('zooms around a fixed point and clamps the zoom range', () => {
    const v = zoomAround({ x: 0, y: 0, z: 1 }, 2, 100, 50);
    // the point under the centre (100, 50) stays put: (100 - x) / z equals 100 before and after
    expect((100 - v.x) / v.z).toBeCloseTo(100);
    expect((50 - v.y) / v.z).toBeCloseTo(50);
    expect(zoomAround({ x: 0, y: 0, z: 2.3 }, 5, 0, 0).z).toBe(2.4);
    expect(zoomAround({ x: 0, y: 0, z: 0.7 }, 0.1, 0, 0).z).toBe(0.6);
  });
});

describe('page transitions', () => {
  it('falls back to a plain synchronous update without the View Transitions API', async () => {
    const update = vi.fn();
    await runPageTransition(update, 'x');
    expect(update).toHaveBeenCalledTimes(1);
  });
});

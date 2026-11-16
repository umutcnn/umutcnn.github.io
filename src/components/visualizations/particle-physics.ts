/**
 * Pure physics for the hero "Intelligence Field" (no DOM, unit-tested).
 *
 * Model
 *  - Nodes sit on a jittered lattice ("home") in three depth layers (z ∈ [0.3, 1]); depth scales size, alpha and
 *    pointer parallax, which gives a cheap 3D illusion without WebGL.
 *  - Each node is tied to its home by a spring and drifts along a smooth pseudo-noise flow field (idle mode).
 *  - The pointer applies radial repulsion + a tangential swirl inside `radius` (interactive mode).
 *  - Velocity is damped every step and positions are clamped to the bounds.
 *  - Signals travel along mesh edges node → node, like activations through a network (information flow).
 *  - Exit mode (0…1, from scroll) pushes nodes radially out of the frame, deeper nodes slower.
 */
export interface Node {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  /** depth 0.3 (far) … 1 (near) */
  z: number;
  accent: 0 | 1 | 2;
  size: number;
}

export interface FieldParams {
  spring: number;
  damping: number;
  radius: number;
  repel: number;
  swirl: number;
  idleAmp: number;
  noiseAmp: number;
  maxSpeed: number;
}

export const DEFAULT_PARAMS: FieldParams = {
  spring: 0.018,
  damping: 0.86,
  radius: 150,
  repel: 1.6,
  swirl: 0.55,
  idleAmp: 4,
  noiseAmp: 2.5,
  maxSpeed: 18,
};

/** Deterministic PRNG (mulberry32) so layouts are stable between frames, reloads and tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth, cheap 2D pseudo-noise flow (sum of incommensurate sines), output in [-1, 1]². */
export function flow(x: number, y: number, t: number): [number, number] {
  const a = Math.sin(x * 0.0071 + t * 0.31) + Math.sin(y * 0.0093 - t * 0.23) * 0.6;
  const b = Math.cos(y * 0.0067 + t * 0.27) + Math.cos(x * 0.0089 + t * 0.19) * 0.6;
  return [a / 1.6, b / 1.6];
}

/** How many nodes to place for an area, scaled by device tier and capped. */
export function particleBudget(width: number, height: number, tier: 'low' | 'mid' | 'high'): number {
  const area = Math.max(0, width) * Math.max(0, height);
  const perNode = tier === 'high' ? 7600 : tier === 'mid' ? 12500 : 21000;
  const cap = tier === 'high' ? 300 : tier === 'mid' ? 170 : 90;
  return Math.max(24, Math.min(cap, Math.round(area / perNode)));
}

export function createField(width: number, height: number, count: number, seed = 7): Node[] {
  const rand = mulberry32(seed);
  const aspect = width / Math.max(1, height);
  const cols = Math.max(2, Math.round(Math.sqrt(count * aspect)));
  const rows = Math.max(2, Math.ceil(count / cols));
  const cw = width / cols;
  const ch = height / rows;
  const nodes: Node[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (nodes.length >= count) break;
      const hx = (c + 0.5 + (rand() - 0.5) * 0.8) * cw;
      const hy = (r + 0.5 + (rand() - 0.5) * 0.8) * ch;
      const roll = rand();
      const layer = rand();
      nodes.push({
        hx,
        hy,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        phase: rand() * Math.PI * 2,
        z: layer < 0.4 ? 0.35 : layer < 0.75 ? 0.65 : 1,
        accent: roll > 0.965 ? 1 : roll > 0.935 ? 2 : 0,
        size: 0.8 + rand() * 1.3,
      });
    }
  }
  return nodes;
}

/** Pairs of node indices whose homes are closer than `maxDist` — the mesh edges (computed once). */
export function buildEdges(nodes: Node[], maxDist: number): Uint16Array {
  const out: number[] = [];
  const max2 = maxDist * maxDist;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]!;
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]!;
      const dx = a.hx - b.hx;
      const dy = a.hy - b.hy;
      if (dx * dx + dy * dy < max2) out.push(i, j);
    }
  }
  return Uint16Array.from(out);
}

/** For every node, the indices (into the edge-pair list, i.e. edge number) of the edges touching it. */
export function buildAdjacency(nodeCount: number, edges: Uint16Array): number[][] {
  const adj: number[][] = Array.from({ length: nodeCount }, () => []);
  for (let e = 0; e < edges.length / 2; e++) {
    adj[edges[e * 2]!]!.push(e);
    adj[edges[e * 2 + 1]!]!.push(e);
  }
  return adj;
}

export function stepField(
  nodes: Node[],
  dt: number,
  time: number,
  pointer: { x: number; y: number; active: boolean },
  bounds: { width: number; height: number },
  p: FieldParams = DEFAULT_PARAMS,
): void {
  const k = Math.min(2.5, dt * 60); // frame-rate independent factor (1 at 60 fps)
  const r2 = p.radius * p.radius;
  const damping = Math.pow(p.damping, k);
  for (const n of nodes) {
    const [fx, fy] = flow(n.hx, n.hy, time);
    const tx = n.hx + Math.cos(time * 0.35 + n.phase) * p.idleAmp + fx * p.noiseAmp * n.z;
    const ty = n.hy + Math.sin(time * 0.29 + n.phase * 1.3) * p.idleAmp + fy * p.noiseAmp * n.z;
    let ax = (tx - n.x) * p.spring;
    let ay = (ty - n.y) * p.spring;

    if (pointer.active) {
      const dx = n.x - pointer.x;
      const dy = n.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const f = (1 - d / p.radius) ** 2 * (0.55 + 0.45 * n.z); // near layers react more
        ax += (dx / d) * f * p.repel;
        ay += (dy / d) * f * p.repel;
        ax += (-dy / d) * f * p.swirl;
        ay += (dx / d) * f * p.swirl;
      }
    }

    n.vx = (n.vx + ax * k) * damping;
    n.vy = (n.vy + ay * k) * damping;
    const speed = Math.hypot(n.vx, n.vy);
    if (speed > p.maxSpeed) {
      n.vx = (n.vx / speed) * p.maxSpeed;
      n.vy = (n.vy / speed) * p.maxSpeed;
    }
    n.x = Math.min(bounds.width, Math.max(0, n.x + n.vx * k));
    n.y = Math.min(bounds.height, Math.max(0, n.y + n.vy * k));
  }
}

/** Screen-space offset for a node during the hero exit (0 = none, 1 = fully dispersed). */
export function exitOffset(n: Node, progress: number, cx: number, cy: number, reach: number): [number, number] {
  if (progress <= 0) return [0, 0];
  const dx = n.x - cx;
  const dy = n.y - cy;
  const d = Math.hypot(dx, dy) || 1;
  const e = progress * progress * (3 - 2 * progress); // smoothstep
  const push = e * reach * (0.45 + 0.55 * n.z);
  return [(dx / d) * push, (dy / d) * push];
}

// ---------------------------------------------------------------------------------------------- signals

export interface Signal {
  edge: number;
  t: number;
  /** true: travelling from edges[2e] to edges[2e+1] */
  forward: boolean;
  speed: number;
}

export function spawnSignal(edgeCount: number, rand: () => number, fromEdge?: number): Signal {
  return {
    edge: fromEdge ?? Math.floor(rand() * Math.max(1, edgeCount)),
    t: 0,
    forward: rand() > 0.5,
    speed: 0.9 + rand() * 0.9,
  };
}

/**
 * Advances signals; on arrival a signal continues along another edge of the node it reached (never straight back
 * when there is a choice), so pulses trace paths through the mesh.
 */
export function stepSignals(
  signals: Signal[],
  edges: Uint16Array,
  adjacency: number[][],
  dt: number,
  rand: () => number,
): void {
  const edgeCount = edges.length / 2;
  if (edgeCount === 0) return;
  for (const s of signals) {
    s.t += dt * s.speed;
    if (s.t < 1) continue;
    const arrived = s.forward ? edges[s.edge * 2 + 1]! : edges[s.edge * 2]!;
    const options = (adjacency[arrived] ?? []).filter(e => e !== s.edge);
    const next = options.length ? options[Math.floor(rand() * options.length)]! : s.edge;
    s.edge = next;
    s.forward = edges[next * 2] === arrived;
    s.t = 0;
  }
}

/** Index of the node nearest to a point (or -1). */
export function nearestNode(nodes: Node[], x: number, y: number): number {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const d = (nodes[i]!.x - x) ** 2 + (nodes[i]!.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

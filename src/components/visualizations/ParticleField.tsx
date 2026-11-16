import { useEffect, useRef, type RefObject } from 'react';
import { acquirePointer, pointer } from '../../lib/pointer';
import { getDeviceTier, hasFinePointer } from '../../lib/prefs';
import { getAnimationQuality, QUALITY_BUDGET } from '../../motion/quality';
import {
  buildAdjacency,
  buildEdges,
  createField,
  exitOffset,
  mulberry32,
  nearestNode,
  particleBudget,
  spawnSignal,
  stepField,
  stepSignals,
  type Node,
  type Signal,
} from './particle-physics';

/** Imperative API for the hero: scroll-driven exit and touch ripples, without React state per frame. */
export interface FieldController {
  /** 0 = in place … 1 = fully dispersed (hero exit) */
  setExit(progress: number): void;
  /** touch alternative to hover: a short pointer impulse at viewport coordinates */
  burst(clientX: number, clientY: number): void;
}

interface Palette {
  ink: [number, number, number];
  signal: string;
  violet: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return [17, 19, 24];
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  return {
    ink: hexToRgb(cs.getPropertyValue('--fg') || '#111318'),
    signal: cs.getPropertyValue('--c-signal').trim() || '#a4ff70',
    violet: cs.getPropertyValue('--c-violet').trim() || '#7776ff',
  };
}

const EDGE_BUCKETS = 4;

/**
 * Hero "Intelligence Field": a layered network whose signals travel node to node like activations.
 * Modes — idle (noise drift + signals), interactive (pointer repulsion/swirl, signals start where you point),
 * exit (scroll disperses the field). Canvas 2D on purpose: ≤ 300 nodes need no WebGL, and the hero must render
 * everywhere. Starts on idle, pauses off-screen / hidden tab, static frame for the minimal tier.
 */
export function ParticleField({
  className,
  controllerRef,
}: {
  className?: string;
  controllerRef?: RefObject<FieldController | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !host || !ctx) return;

    const quality = getAnimationQuality();
    const budget = QUALITY_BUDGET[quality];
    const tier = getDeviceTier();
    const fine = hasFinePointer();
    const rand = mulberry32(29);
    let width = 1;
    let height = 1;
    let nodes: Node[] = [];
    let edges: Uint16Array = new Uint16Array(0);
    let adjacency: number[][] = [];
    let signals: Signal[] = [];
    let palette = readPalette(host);
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    let time = 0;
    let exit = 0;
    let lastSpawn = 0;
    const par = { x: 0, y: 0 }; // smoothed pointer parallax (-1…1)
    const local = { x: 0, y: 0, active: false };
    const impulse = { x: 0, y: 0, until: 0 };
    const releasePointer = acquirePointer();

    const layout = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, budget.dpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = particleBudget(width, height, tier);
      nodes = createField(width, height, count, 11);
      const cell = Math.sqrt((width * height) / Math.max(1, count));
      edges = buildEdges(nodes, cell * 1.45);
      adjacency = buildAdjacency(nodes.length, edges);
      signals = Array.from({ length: budget.signals }, () => spawnSignal(edges.length / 2, rand));
    };

    const pos = (n: Node): [number, number] => {
      const [ox, oy] = exitOffset(n, exit, width / 2, height * 0.45, Math.hypot(width, height) * 0.6);
      return [n.x + par.x * 16 * n.z + ox, n.y + par.y * 10 * n.z + oy];
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const [r, g, b] = palette.ink;
      const fade = 1 - exit * 0.92;
      if (fade <= 0.01) return;
      const linkMax = Math.sqrt((width * height) / Math.max(1, nodes.length)) * 1.6;

      // edges, batched into a few alpha buckets → a handful of strokes per frame
      const paths = Array.from({ length: EDGE_BUCKETS }, () => new Path2D());
      for (let i = 0; i < edges.length; i += 2) {
        const a = nodes[edges[i]!]!;
        const c = nodes[edges[i + 1]!]!;
        const [ax, ay] = pos(a);
        const [cx, cy] = pos(c);
        const d = Math.hypot(ax - cx, ay - cy);
        const strength = Math.max(0, 1 - d / linkMax) * ((a.z + c.z) / 2);
        if (strength < 0.05) continue;
        const bucket = Math.min(EDGE_BUCKETS - 1, Math.floor(strength * EDGE_BUCKETS));
        paths[bucket]!.moveTo(ax, ay);
        paths[bucket]!.lineTo(cx, cy);
      }
      ctx.lineWidth = 1;
      paths.forEach((p, i) => {
        ctx.strokeStyle = `rgba(${r},${g},${b},${(((i + 1) / EDGE_BUCKETS) * 0.16 * fade).toFixed(3)})`;
        ctx.stroke(p);
      });

      // nodes, one fill per depth layer / accent colour
      const layers = new Map<string, Path2D>();
      for (const n of nodes) {
        const [x, y] = pos(n);
        const disp = Math.min(1, Math.hypot(n.x - n.hx, n.y - n.hy) / 40);
        const key = n.accent === 1 ? 'signal' : n.accent === 2 ? 'violet' : `ink-${n.z}-${disp > 0.4 ? 1 : 0}`;
        let p = layers.get(key);
        if (!p) layers.set(key, (p = new Path2D()));
        const s = n.size * (n.accent ? 1.5 : 1) * (0.6 + n.z * 0.6) * (1 + disp * 0.5);
        p.moveTo(x + s, y);
        p.arc(x, y, s, 0, Math.PI * 2);
      }
      layers.forEach((p, key) => {
        if (key === 'signal') ctx.fillStyle = palette.signal;
        else if (key === 'violet') ctx.fillStyle = palette.violet;
        else {
          const [, z, hot] = key.split('-');
          ctx.fillStyle = `rgba(${r},${g},${b},${((0.18 + Number(z) * 0.32 + Number(hot) * 0.25) * fade).toFixed(3)})`;
        }
        ctx.fill(p);
      });

      // signals: bright pulses travelling along edges, with a short trail
      if (signals.length && edges.length) {
        ctx.lineCap = 'round';
        for (const s of signals) {
          const a = nodes[edges[s.edge * 2]!];
          const c = nodes[edges[s.edge * 2 + 1]!];
          if (!a || !c) continue;
          const [from, to] = s.forward ? [a, c] : [c, a];
          const [fx, fy] = pos(from);
          const [tx, ty] = pos(to);
          const t = s.t;
          const px = fx + (tx - fx) * t;
          const py = fy + (ty - fy) * t;
          const tt = Math.max(0, t - 0.35);
          ctx.strokeStyle = `rgba(164,255,112,${(0.55 * fade).toFixed(3)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(fx + (tx - fx) * tt, fy + (ty - fy) * tt);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.fillStyle = palette.signal;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      const rect = canvas.getBoundingClientRect();
      const tapping = now < impulse.until;
      local.x = (tapping ? impulse.x : pointer.x) - rect.left;
      local.y = (tapping ? impulse.y : pointer.y) - rect.top;
      local.active =
        exit < 0.5 &&
        (tapping ||
          (fine && pointer.active && now - pointer.lastMove < 2500 && local.y >= -50 && local.y <= height + 50));
      const k = 1 - Math.exp(-dt / 0.25);
      par.x += ((local.active && fine ? pointer.nx : 0) - par.x) * k;
      par.y += ((local.active && fine ? pointer.ny : 0) - par.y) * k;
      stepField(nodes, dt, time, local, { width, height });
      // interactive mode: the network "answers" where you point
      if (local.active && signals.length && now - lastSpawn > 450) {
        lastSpawn = now;
        const i = nearestNode(nodes, local.x, local.y);
        const edge = adjacency[i]?.[Math.floor(rand() * (adjacency[i]?.length ?? 1))];
        if (edge !== undefined) {
          signals.shift();
          signals.push({ edge, t: 0, forward: edges[edge * 2] === i, speed: 1.6 });
        }
      }
      stepSignals(signals, edges, adjacency, dt, rand);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || quality === 'minimal' || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    layout();
    draw();
    canvas.classList.add('is-ready');

    if (controllerRef) {
      controllerRef.current = {
        setExit(p) {
          exit = Math.min(1, Math.max(0, p));
          if (!running) draw();
        },
        burst(x, y) {
          impulse.x = x;
          impulse.y = y;
          impulse.until = performance.now() + 650;
          start();
        },
      };
    }

    const ro = new ResizeObserver(() => {
      layout();
      draw();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(host);
      if (!running) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Begin animating only once the browser is idle, so the first paint is never delayed.
    const idleWin = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    const useIdle = typeof idleWin.requestIdleCallback === 'function';
    const idleHandle = useIdle ? idleWin.requestIdleCallback!(start, { timeout: 900 }) : window.setTimeout(start, 250);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (useIdle) idleWin.cancelIdleCallback?.(idleHandle);
      else window.clearTimeout(idleHandle);
      releasePointer();
      if (controllerRef) controllerRef.current = null;
    };
  }, [controllerRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_BOOT_SCRIPT, THEME_COLOR, getTheme, resolveInitialTheme, setTheme } from '../../src/app/providers/theme';
import {
  SCENE_W,
  countByClass,
  detectionsFor,
  filterDetections,
  generateCoilScene,
} from '../../src/components/visualizations/detection-model';
import {
  clampRounds,
  createFlState,
  driftAt,
  flReducer,
  nextPhase,
  syntheticWeights,
} from '../../src/components/visualizations/fl-model';
import {
  buildEdges,
  createField,
  mulberry32,
  particleBudget,
  stepField,
} from '../../src/components/visualizations/particle-physics';
import { nextCaseStudy, projectsForTech, relatedProjects } from '../../src/content/relations';
import { findProjectBySlug } from '../../src/content/projects';
import { computeDeviceTier } from '../../src/lib/prefs';
import { getRouteMeta, resolveRoute } from '../../src/lib/seo';
import { STORAGE_KEYS } from '../../src/lib/storage';

describe('theme', () => {
  it('opens in light on a first visit; only a stored choice switches to dark', () => {
    expect(resolveInitialTheme('light')).toBe('light');
    expect(resolveInitialTheme('dark')).toBe('dark');
    expect(resolveInitialTheme(null)).toBe('light'); // first visit: light, whatever the OS preference
    expect(resolveInitialTheme('garbage')).toBe('light');
  });

  it('persists the theme and applies it to <html>', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');
  });

  it('keeps the browser UI colour (<meta name="theme-color">) in step with the theme', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = THEME_COLOR.light;
    document.head.appendChild(meta);
    setTheme('dark');
    expect(meta.content).toBe(THEME_COLOR.dark);
    setTheme('light');
    expect(meta.content).toBe(THEME_COLOR.light);
    meta.remove();
  });

  it('ships the same no-flash boot script in index.html', () => {
    const html = readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    expect(html).toContain(THEME_BOOT_SCRIPT);
  });
});

describe('device tier', () => {
  it('drops to low on data saver or weak hardware', () => {
    expect(computeDeviceTier({ saveData: true, cores: 16, memory: 16 })).toBe('low');
    expect(computeDeviceTier({ reducedData: true })).toBe('low');
    expect(computeDeviceTier({ cores: 2, memory: 8 })).toBe('low');
  });
  it('is mid for touch or mid hardware, high otherwise', () => {
    expect(computeDeviceTier({ cores: 8, memory: 8, coarsePointer: true })).toBe('mid');
    expect(computeDeviceTier({ cores: 4, memory: 8 })).toBe('mid');
    expect(computeDeviceTier({ cores: 8, memory: 8 })).toBe('high');
  });
});

describe('federated-learning visualiser state', () => {
  it('cycles train → upload → aggregate → broadcast and bumps the version on aggregate', () => {
    let s = { ...createFlState('fedavg', 2), playing: true };
    const seen: string[] = [];
    for (let i = 0; i < 9; i++) {
      s = nextPhase(s);
      seen.push(`${s.phase}:${s.round}`);
    }
    expect(seen).toEqual([
      'train:0',
      'upload:0',
      'aggregate:0',
      'broadcast:1',
      'train:1',
      'upload:1',
      'aggregate:1',
      'broadcast:2',
      'idle:2',
    ]);
    expect(s.playing).toBe(false);
  });

  it('clamps rounds and restarts a finished run on play', () => {
    expect(clampRounds(0)).toBe(1);
    expect(clampRounds(99)).toBe(10);
    expect(clampRounds(Number.NaN)).toBe(1);
    const done = { ...createFlState('fedprox', 1), round: 1 };
    expect(flReducer(done, { type: 'play' })).toMatchObject({ round: 0, playing: true });
    expect(flReducer(done, { type: 'setRounds', rounds: 3 })).toMatchObject({ rounds: 3, round: 1 });
    expect(flReducer({ ...done, round: 5, rounds: 6 }, { type: 'setRounds', rounds: 2 }).round).toBe(2);
  });

  it('never shows more completed rounds than the target when rounds are lowered mid-round', () => {
    // 2 rounds done, round 3 in flight; the visitor lowers the target to 2
    let s = flReducer(
      { ...createFlState('fedavg', 5), round: 2, phase: 'upload', playing: true },
      { type: 'setRounds', rounds: 2 },
    );
    expect(s).toMatchObject({ rounds: 2, round: 2, phase: 'idle', playing: false });
    for (let i = 0; i < 6; i++) {
      s = flReducer(s, { type: 'tick' });
      expect(s.round).toBeLessThanOrEqual(s.rounds);
    }
    // lowering the target above the completed count keeps the run going
    expect(
      flReducer(
        { ...createFlState('fedavg', 5), round: 1, phase: 'train', playing: true },
        { type: 'setRounds', rounds: 3 },
      ),
    ).toMatchObject({ rounds: 3, round: 1, phase: 'train', playing: true });
  });

  it('resets when the algorithm changes', () => {
    const s = { ...createFlState('fedavg', 4), round: 3, phase: 'upload' as const };
    expect(flReducer(s, { type: 'setAlgorithm', algorithm: 'fedadam' })).toEqual(createFlState('fedadam', 4));
  });

  it('shows drift shrinking every round, fastest for FedProx (synthetic illustration)', () => {
    for (const a of ['fedavg', 'fedprox', 'fedavgm', 'fedadam'] as const) {
      expect(driftAt(a, 3)).toBeLessThan(driftAt(a, 2));
    }
    expect(driftAt('fedprox', 4)).toBeLessThan(driftAt('fedavg', 4));
    const w = syntheticWeights('fedavg', 2, 'train');
    expect(w.clients).toHaveLength(3);
    w.clients.flat().forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0.05);
      expect(v).toBeLessThanOrEqual(1);
    });
    expect(syntheticWeights('fedavg', 2, 'train')).toEqual(w); // deterministic
  });
});

describe('detection playground model', () => {
  const coils = generateCoilScene(42);
  const dets = detectionsFor(coils, 42);

  it('is deterministic and inside the scene', () => {
    expect(generateCoilScene(42)).toEqual(coils);
    coils.forEach(c => {
      expect(c.x - c.r).toBeGreaterThanOrEqual(0);
      expect(c.x + c.r).toBeLessThanOrEqual(SCENE_W);
    });
  });

  it('filters inclusively and monotonically by confidence', () => {
    expect(filterDetections(dets, 0)).toHaveLength(dets.length);
    expect(filterDetections(dets, 1.5)).toHaveLength(dets.filter(d => d.confidence >= 1).length);
    let prev = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const n = filterDetections(dets, t).length;
      expect(n).toBeLessThanOrEqual(prev);
      prev = n;
    }
    const c = dets[0]!.confidence;
    expect(filterDetections(dets, c).some(d => d.id === dets[0]!.id)).toBe(true);
  });

  it('drops the synthetic false positives at a moderate threshold', () => {
    expect(filterDetections(dets, 0.2).some(d => d.falsePositive)).toBe(true);
    expect(filterDetections(dets, 0.5).some(d => d.falsePositive)).toBe(false);
    const counts = countByClass(filterDetections(dets, 0.1));
    expect(counts.coil + counts.partial).toBe(dets.length);
  });
});

describe('particle field physics', () => {
  it('scales the budget with area and tier, within caps', () => {
    expect(particleBudget(1920, 1080, 'high')).toBeLessThanOrEqual(300);
    expect(particleBudget(1920, 1080, 'low')).toBeLessThanOrEqual(90);
    expect(particleBudget(375, 812, 'mid')).toBeLessThan(particleBudget(1440, 900, 'mid'));
    expect(particleBudget(0, 0, 'high')).toBe(24);
  });

  it('pushes nodes away from the pointer, damps velocity and stays in bounds', () => {
    const nodes = createField(400, 300, 60, 3);
    const n = nodes[20]!;
    const before = Math.hypot(n.x - 200, n.y - 150);
    for (let i = 0; i < 20; i++)
      stepField(nodes, 1 / 60, i / 60, { x: 200, y: 150, active: true }, { width: 400, height: 300 });
    nodes.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(400);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(300);
    });
    if (before < 150) expect(Math.hypot(n.x - 200, n.y - 150)).toBeGreaterThan(before);
    // pointer gone → nodes settle back near home
    for (let i = 0; i < 600; i++)
      stepField(nodes, 1 / 60, 0, { x: 0, y: 0, active: false }, { width: 400, height: 300 });
    nodes.forEach(p => expect(Math.hypot(p.x - p.hx, p.y - p.hy)).toBeLessThan(8));
  });

  it('builds symmetric-free edge pairs and a stable PRNG', () => {
    const nodes = createField(300, 200, 30);
    const edges = buildEdges(nodes, 80);
    expect(edges.length % 2).toBe(0);
    for (let i = 0; i < edges.length; i += 2) expect(edges[i]!).toBeLessThan(edges[i + 1]!);
    expect(mulberry32(1)()).toBe(mulberry32(1)());
  });
});

describe('relations', () => {
  it('maps technologies to the projects that use them', () => {
    expect(projectsForTech('pytorch').map(p => p.slug)).toContain('federated-cataract-detection');
    expect(projectsForTech('nestjs').map(p => p.slug)).toEqual(['maks-enterprise-erp']);
    expect(projectsForTech('git')).toEqual([]);
  });
  it('resolves related projects and wraps the next case study', () => {
    const fl = findProjectBySlug('federated-cataract-detection')!;
    expect(relatedProjects(fl).length).toBe(fl.relatedProjects.length);
    expect(nextCaseStudy('industrial-coil-detection')?.slug).toBe('federated-cataract-detection');
    expect(nextCaseStudy('nope')).toBeUndefined();
  });
});

describe('SEO metadata', () => {
  it('builds canonical + hreflang alternates for home and case routes', () => {
    const home = getRouteMeta('en', { name: 'home' });
    expect(home.canonical).toBe('https://umutcnn.github.io/en/');
    expect(home.alternates.map(a => a.hreflang)).toEqual(['tr', 'en', 'x-default']);
    expect(home.jsonLd?.['@type']).toBe('Person');
    const cs = getRouteMeta('tr', { name: 'case', slug: 'maks-enterprise-erp' });
    expect(cs.canonical).toBe('https://umutcnn.github.io/work/maks-enterprise-erp/');
    expect(cs.title).toMatch(/MAKS Enterprise ERP/);
    expect(cs.description.length).toBeLessThanOrEqual(300);
  });
  it('marks unknown case studies as non-indexable 404s', () => {
    expect(resolveRoute({ name: 'case', slug: 'e-okul' })).toEqual({ name: 'notFound' }); // archive item, no case study
    const nf = getRouteMeta('tr', { name: 'case', slug: 'does-not-exist' });
    expect(nf.canonical).toBeNull();
    expect(nf.robots).toMatch(/noindex/);
  });
});

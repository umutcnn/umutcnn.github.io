import type { Localized, Project, TechId } from '../types/content';
import { PROJECTS } from './projects';
import { projectsForTech } from './relations';

/**
 * Knowledge constellation: competence domains around the person, technologies around their domains.
 * Domain → technology links are curated here; technology → project links come from each project's
 * `technologies` list (single source of truth). No proficiency scores anywhere.
 */
export type DomainId = 'ai' | 'vision' | 'federated' | 'fullstack' | 'cad' | 'autonomy' | 'agentic';

export interface Domain {
  id: DomainId;
  title: Localized;
  techs: TechId[];
}

export const DOMAINS: Domain[] = [
  {
    id: 'ai',
    title: { tr: 'Yapay Zekâ', en: 'Artificial Intelligence' },
    techs: ['python', 'pytorch', 'tensorflow', 'deep-learning', 'machine-learning', 'cnn'],
  },
  {
    id: 'vision',
    title: { tr: 'Bilgisayarlı Görü', en: 'Computer Vision' },
    techs: [
      'opencv',
      'yolo',
      'object-detection',
      'image-classification',
      'dataset-preparation',
      'augmentation',
      'tflite',
      'kotlin',
    ],
  },
  {
    id: 'federated',
    title: { tr: 'Federe Öğrenme', en: 'Federated Learning' },
    techs: ['federated-learning', 'flower', 'ray', 'hydra'],
  },
  {
    id: 'fullstack',
    title: { tr: 'Full Stack Mühendisliği', en: 'Full Stack Engineering' },
    techs: [
      'react',
      'typescript',
      'nestjs',
      'prisma',
      'sql-server',
      'material-ui',
      'tauri',
      'django',
      'dotnet',
      'csharp',
      'rest',
      'git',
    ],
  },
  {
    id: 'cad',
    title: { tr: 'CAD Otomasyonu', en: 'CAD Automation' },
    techs: ['cpp', 'qt', 'occt'],
  },
  {
    id: 'autonomy',
    title: { tr: 'Otonom Sistemler', en: 'Autonomous Systems' },
    techs: ['ros', 'lidar-imu'],
  },
  {
    id: 'agentic',
    title: { tr: 'Ajan Tabanlı YZ', en: 'Agentic AI' },
    techs: ['llm', 'rag', 'nlp', 'ollama', 'n8n', 'docker'],
  },
];

export interface Point {
  x: number;
  y: number;
}

export interface Box extends Point {
  w: number;
  h: number;
}

export interface ConstellationLayout {
  width: number;
  height: number;
  center: Point;
  domains: Record<DomainId, Box>;
  techs: Map<TechId, Box & { domain: DomainId }>;
}

/** Approximate rendered label size in layout units (mono 0.7rem for technologies, display 0.92rem for domains). */
const techBox = (label: string) => ({ w: label.length * 7.4 + 22, h: 26 });
const domainBox = (title: Localized) => ({ w: Math.max(title.tr.length, title.en.length) * 9.6 + 34, h: 38 });
const CENTER_SIZE = 150;

/** Separates overlapping boxes (movable ones only) while a weak spring keeps each near its anchor. */
function relax(boxes: (Box & { fixed: boolean; ax: number; ay: number })[], width: number, height: number) {
  const pad = 6;
  for (let iter = 0; iter < 260; iter++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        if (a.fixed && b.fixed) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const ox = (a.w + b.w) / 2 + pad - Math.abs(dx);
        const oy = (a.h + b.h) / 2 + pad - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        const share = a.fixed || b.fixed ? 1 : 0.5;
        if (oy < ox) {
          const push = oy * share * (dy >= 0 ? 1 : -1);
          if (!a.fixed) a.y -= push;
          if (!b.fixed) b.y += push;
        } else {
          const push = ox * share * (dx >= 0 ? 1 : -1);
          if (!a.fixed) a.x -= push;
          if (!b.fixed) b.x += push;
        }
      }
    }
    for (const b of boxes) {
      if (b.fixed) continue;
      b.x += (b.ax - b.x) * 0.01;
      b.y += (b.ay - b.y) * 0.01;
      b.x = Math.min(width - b.w / 2 - 6, Math.max(b.w / 2 + 6, b.x));
      b.y = Math.min(height - b.h / 2 - 6, Math.max(b.h / 2 + 6, b.y));
    }
    if (!moved && iter > 20) break;
  }
}

/**
 * Deterministic layout in a width × height box: domains on an ellipse around the person, each domain's
 * technologies fanned outward, then label boxes relaxed apart so nothing overlaps (pure, unit-tested).
 */
export function layoutConstellation(
  domains: Domain[] = DOMAINS,
  techLabel: (t: TechId) => string = t => t,
  width = 1000,
  height = 700,
): ConstellationLayout {
  const center = { x: width / 2, y: height / 2 };
  const rx = width * 0.27;
  const ry = height * 0.29;
  const out: ConstellationLayout = { width, height, center, domains: {} as Record<DomainId, Box>, techs: new Map() };
  const boxes: (Box & { fixed: boolean; ax: number; ay: number; key: string })[] = [
    {
      key: 'center',
      x: center.x,
      y: center.y,
      w: CENTER_SIZE,
      h: CENTER_SIZE,
      fixed: true,
      ax: center.x,
      ay: center.y,
    },
  ];
  domains.forEach((d, i) => {
    const a = -Math.PI / 2 + (i / domains.length) * Math.PI * 2;
    const p = { x: center.x + Math.cos(a) * rx, y: center.y + Math.sin(a) * ry, ...domainBox(d.title) };
    out.domains[d.id] = p;
    boxes.push({ key: `d:${d.id}`, ...p, fixed: true, ax: p.x, ay: p.y });
    const techs = d.techs.filter(t => !boxes.some(b => b.key === `t:${t}`)); // each technology drawn once
    const spread = Math.min(Math.PI * 1.1, 0.4 * Math.max(1, techs.length - 1));
    techs.forEach((tech, j) => {
      const ta = a + (techs.length === 1 ? 0 : -spread / 2 + (j / (techs.length - 1)) * spread);
      const r = 120 + (j % 3) * 30;
      const x = p.x + Math.cos(ta) * r;
      const y = p.y + Math.sin(ta) * r * 0.8;
      boxes.push({ key: `t:${tech}`, x, y, ...techBox(techLabel(tech)), fixed: false, ax: x, ay: y });
      out.techs.set(tech, { x, y, w: 0, h: 0, domain: d.id });
    });
  });
  relax(boxes, width, height);
  for (const b of boxes) {
    if (!b.key.startsWith('t:')) continue;
    const id = b.key.slice(2) as TechId;
    const prev = out.techs.get(id)!;
    out.techs.set(id, { x: b.x, y: b.y, w: b.w, h: b.h, domain: prev.domain });
  }
  return out;
}

/** Fraction of label pairs that overlap (0 = clean). Used by tests and as a layout sanity check. */
export function overlapCount(layout: ConstellationLayout): number {
  const boxes: Box[] = [
    { ...layout.center, w: CENTER_SIZE, h: CENTER_SIZE },
    ...Object.values(layout.domains),
    ...[...layout.techs.values()],
  ];
  let n = 0;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      if (Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 1) n++;
    }
  return n;
}

/** Projects behind a domain: any project using one of its technologies. */
export function projectsForDomain(domain: Domain, projects: Project[] = PROJECTS): Project[] {
  const ids = new Set(domain.techs.flatMap(t => projectsForTech(t, projects).map(p => p.id)));
  return projects.filter(p => ids.has(p.id)).sort((a, b) => a.order - b.order);
}

export function domainsForTech(tech: TechId, domains: Domain[] = DOMAINS): Domain[] {
  return domains.filter(d => d.techs.includes(tech));
}

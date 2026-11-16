/**
 * Synthetic scene + detections for the computer-vision playground. Nothing here is model output:
 * coil positions and confidences are generated deterministically to *illustrate* thresholding.
 */
import { mulberry32 } from './particle-physics';

export interface Coil {
  id: number;
  x: number;
  y: number;
  r: number;
  /** 0 = fully visible … 1 = fully hidden */
  occlusion: number;
}

export type DetectionClass = 'coil' | 'partial';

export interface Detection {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  cls: DetectionClass;
  /** false positives (texture, reflections) — included so the threshold has something to remove */
  falsePositive: boolean;
}

export const SCENE_W = 640;
export const SCENE_H = 400;

/** A pyramid-like stack of coils seen from the front; back-row coils are partially occluded. */
export function generateCoilScene(seed = 42): Coil[] {
  const rand = mulberry32(seed);
  const coils: Coil[] = [];
  const rows = [6, 5, 4];
  const r = 38;
  let id = 0;
  rows.forEach((count, row) => {
    const y = SCENE_H - 70 - row * (r * 1.62);
    const startX = SCENE_W / 2 - ((count - 1) * r * 2.08) / 2;
    for (let i = 0; i < count; i++) {
      const jitter = (rand() - 0.5) * 6;
      coils.push({
        id: id++,
        x: startX + i * r * 2.08 + jitter,
        y: y + (rand() - 0.5) * 4,
        r: r * (0.94 + rand() * 0.1),
        occlusion: row === 0 ? rand() * 0.08 : Math.min(0.62, 0.18 + rand() * 0.42 + row * 0.04),
      });
    }
  });
  return coils;
}

export function detectionsFor(coils: Coil[], seed = 42): Detection[] {
  const rand = mulberry32(seed * 3 + 1);
  const dets: Detection[] = coils.map(c => {
    const visibleH = c.r * 2 * (1 - c.occlusion * 0.55);
    const conf = Math.max(0.18, Math.min(0.99, 0.97 - c.occlusion * 0.95 + (rand() - 0.5) * 0.08));
    return {
      id: c.id,
      x: c.x - c.r,
      y: c.y - c.r,
      w: c.r * 2,
      h: visibleH,
      confidence: Math.round(conf * 100) / 100,
      cls: c.occlusion > 0.3 ? 'partial' : 'coil',
      falsePositive: false,
    };
  });
  dets.push(
    { id: 900, x: 48, y: 64, w: 70, h: 56, confidence: 0.24, cls: 'coil', falsePositive: true },
    { id: 901, x: SCENE_W - 130, y: 92, w: 64, h: 60, confidence: 0.33, cls: 'partial', falsePositive: true },
  );
  return dets;
}

/** Detections at or above the confidence threshold (inclusive). */
export function filterDetections(dets: Detection[], threshold: number): Detection[] {
  const t = Math.min(1, Math.max(0, threshold));
  return dets.filter(d => d.confidence >= t);
}

export function countByClass(dets: Detection[]): Record<DetectionClass, number> {
  return dets.reduce<Record<DetectionClass, number>>(
    (acc, d) => {
      acc[d.cls] += 1;
      return acc;
    },
    { coil: 0, partial: 0 },
  );
}

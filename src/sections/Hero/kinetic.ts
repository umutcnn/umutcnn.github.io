/**
 * Pure maths for the kinetic hero name (unit-tested).
 * Each character is a spring-damped body whose target offset is a push away from the pointer, scaled by
 * proximity; the same falloff drives a small 3D tilt. Readability guard: displacement is capped at a fraction
 * of the font size and the name always springs back to rest.
 */
export interface CharBody {
  /** rest centre relative to the name box, px */
  cx: number;
  cy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
}

export interface KineticParams {
  /** influence radius in px */
  radius: number;
  /** max displacement in px */
  maxShift: number;
  stiffness: number;
  damping: number;
}

export function kineticParams(fontSizePx: number): KineticParams {
  return { radius: fontSizePx * 1.6, maxShift: fontSizePx * 0.09, stiffness: 0.16, damping: 0.74 };
}

/** Target offset for one character given a pointer (relative to the name box). */
export function targetOffset(
  c: CharBody,
  px: number,
  py: number,
  p: KineticParams,
): { x: number; y: number; f: number } {
  const dx = c.cx - px;
  const dy = c.cy - py;
  const d = Math.hypot(dx, dy);
  if (d >= p.radius || d < 0.001) return { x: 0, y: 0, f: 0 };
  const f = (1 - d / p.radius) ** 2;
  return { x: (dx / d) * f * p.maxShift, y: (dy / d) * f * p.maxShift, f };
}

/** One spring step toward the target; returns true while still moving (so the loop can sleep at rest). */
export function stepChar(c: CharBody, tx: number, ty: number, tRot: number, p: KineticParams, k = 1): boolean {
  c.vx = (c.vx + (tx - c.x) * p.stiffness * k) * p.damping;
  c.vy = (c.vy + (ty - c.y) * p.stiffness * k) * p.damping;
  c.x += c.vx * k;
  c.y += c.vy * k;
  c.rot += (tRot - c.rot) * 0.2 * k;
  return (
    Math.abs(c.vx) + Math.abs(c.vy) > 0.01 ||
    Math.abs(tx - c.x) + Math.abs(ty - c.y) > 0.05 ||
    Math.abs(tRot - c.rot) > 0.01
  );
}

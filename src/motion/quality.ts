import { useSyncExternalStore } from 'react';
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from '../lib/prefs';

/**
 * Animation quality tiers.
 *  full      — particles at full density, pointer physics, pinned storytelling, smooth scroll, view transitions
 *  balanced  — fewer particles / signals, lower canvas resolution, same interactions
 *  minimal   — static or near-static visuals; content and controls unchanged
 * `prefers-reduced-motion` always wins (→ minimal). Hardware hints only lower the tier, never raise it, so an unknown
 * device gets "balanced" rather than a guess that could hurt it.
 */
export type AnimationQuality = 'full' | 'balanced' | 'minimal';

export function resolveQuality(input: { reducedMotion: boolean; tier: DeviceTier }): AnimationQuality {
  if (input.reducedMotion) return 'minimal';
  if (input.tier === 'high') return 'full';
  if (input.tier === 'mid') return 'balanced';
  return 'minimal';
}

export function getAnimationQuality(): AnimationQuality {
  if (typeof window === 'undefined') return 'balanced';
  return resolveQuality({ reducedMotion: prefersReducedMotion(), tier: getDeviceTier() });
}

function subscribe(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const m = window.matchMedia('(prefers-reduced-motion: reduce)');
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
}

/** Hydration-safe: the server snapshot is 'balanced'; the real tier applies right after hydration. */
export function useAnimationQuality(): AnimationQuality {
  return useSyncExternalStore(subscribe, getAnimationQuality, () => 'balanced');
}

/** Per-tier budgets used by canvas effects. */
export const QUALITY_BUDGET: Record<AnimationQuality, { particles: number; signals: number; dpr: number }> = {
  full: { particles: 1, signals: 12, dpr: 2 },
  balanced: { particles: 0.6, signals: 6, dpr: 1.5 },
  minimal: { particles: 0.45, signals: 0, dpr: 1 },
};

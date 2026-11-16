import { useSyncExternalStore } from 'react';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const REDUCED_DATA_QUERY = '(prefers-reduced-data: reduce)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

function mql(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(query);
}

function subscribeTo(query: string) {
  return (cb: () => void) => {
    const m = mql(query);
    if (!m) return () => {};
    m.addEventListener('change', cb);
    return () => m.removeEventListener('change', cb);
  };
}

const subscribeReduced = subscribeTo(REDUCED_QUERY);
const subscribeFine = subscribeTo(FINE_POINTER_QUERY);

export function prefersReducedMotion(): boolean {
  return mql(REDUCED_QUERY)?.matches ?? false;
}

export function hasFinePointer(): boolean {
  return mql(FINE_POINTER_QUERY)?.matches ?? false;
}

/** Reduced-motion preference. Server snapshot is `false` so hydration matches; updates live. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, prefersReducedMotion, () => false);
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFine, hasFinePointer, () => false);
}

export type DeviceTier = 'low' | 'mid' | 'high';

interface NavigatorHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * Coarse capability estimate used to scale visual effects (particle count, DPR, loops).
 * Pure function of the inputs so it can be unit-tested.
 */
export function computeDeviceTier(input: {
  cores?: number;
  memory?: number;
  saveData?: boolean;
  slowNetwork?: boolean;
  reducedData?: boolean;
  coarsePointer?: boolean;
}): DeviceTier {
  if (input.saveData || input.reducedData || input.slowNetwork) return 'low';
  const cores = input.cores ?? 4;
  const memory = input.memory ?? 4;
  if (cores <= 2 || memory <= 2) return 'low';
  if (input.coarsePointer || cores <= 4 || memory <= 4) return 'mid';
  return 'high';
}

export function getDeviceTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'mid';
  const nav = navigator as Navigator & NavigatorHints;
  return computeDeviceTier({
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    saveData: nav.connection?.saveData,
    slowNetwork: /(^|-)2g$/.test(nav.connection?.effectiveType ?? ''),
    reducedData: mql(REDUCED_DATA_QUERY)?.matches ?? false,
    coarsePointer: !hasFinePointer(),
  });
}

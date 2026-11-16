/**
 * State machine for the *conceptual* federated-learning visualiser. It does not train anything:
 * the numbers are deterministic, synthetic values that illustrate how rounds and strategies behave.
 */
import { mulberry32 } from './particle-physics';

export type FlAlgorithm = 'fedavg' | 'fedprox' | 'fedavgm' | 'fedadam';
export type FlPhase = 'idle' | 'train' | 'upload' | 'aggregate' | 'broadcast';

export const FL_ALGORITHMS: FlAlgorithm[] = ['fedavg', 'fedprox', 'fedavgm', 'fedadam'];
export const FL_LABEL: Record<FlAlgorithm, string> = {
  fedavg: 'FedAvg',
  fedprox: 'FedProx',
  fedavgm: 'FedAvgM',
  fedadam: 'FedAdam',
};
export const PHASE_ORDER: FlPhase[] = ['train', 'upload', 'aggregate', 'broadcast'];
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 10;
export const CLIENTS = 3;
export const DIMS = 6;

/** Synthetic per-round drift decay — purely illustrative, chosen so FedProx visibly damps drift fastest. */
const DECAY: Record<FlAlgorithm, number> = { fedavg: 0.8, fedprox: 0.6, fedavgm: 0.7, fedadam: 0.66 };

export interface FlState {
  algorithm: FlAlgorithm;
  rounds: number;
  /** completed rounds (global model version) */
  round: number;
  phase: FlPhase;
  playing: boolean;
}

export type FlAction =
  | { type: 'tick' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'setAlgorithm'; algorithm: FlAlgorithm }
  | { type: 'setRounds'; rounds: number };

export function createFlState(algorithm: FlAlgorithm = 'fedprox', rounds = 5): FlState {
  return { algorithm, rounds: clampRounds(rounds), round: 0, phase: 'idle', playing: false };
}

export function clampRounds(n: number): number {
  if (!Number.isFinite(n)) return MIN_ROUNDS;
  return Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, Math.round(n)));
}

/** Advances one phase: idle → train → upload → aggregate → broadcast → (next round) train … */
export function nextPhase(state: FlState): FlState {
  if (state.phase === 'idle') {
    if (state.round >= state.rounds) return { ...state, playing: false };
    return { ...state, phase: 'train' };
  }
  const i = PHASE_ORDER.indexOf(state.phase);
  if (state.phase === 'aggregate') return { ...state, phase: 'broadcast', round: state.round + 1 };
  if (state.phase === 'broadcast') {
    if (state.round >= state.rounds) return { ...state, phase: 'idle', playing: false };
    return { ...state, phase: 'train' };
  }
  return { ...state, phase: PHASE_ORDER[i + 1]! };
}

export function flReducer(state: FlState, action: FlAction): FlState {
  switch (action.type) {
    case 'tick':
      return nextPhase(state);
    case 'play': {
      const fresh = state.round >= state.rounds && state.phase === 'idle' ? { ...state, round: 0 } : state;
      return { ...fresh, playing: true };
    }
    case 'pause':
      return { ...state, playing: false };
    case 'reset':
      return createFlState(state.algorithm, state.rounds);
    case 'setAlgorithm':
      return createFlState(action.algorithm, state.rounds);
    case 'setRounds': {
      const rounds = clampRounds(action.rounds);
      return { ...state, rounds, round: Math.min(state.round, rounds) };
    }
  }
}

/** Synthetic client drift (distance of local models from the global model) after `round` rounds. */
export function driftAt(algorithm: FlAlgorithm, round: number): number {
  return Math.pow(DECAY[algorithm], Math.max(0, round));
}

/** Synthetic weight vectors for drawing. Local vectors spread around the global one by the current drift. */
export function syntheticWeights(algorithm: FlAlgorithm, round: number, phase: FlPhase) {
  const rand = mulberry32(1000 + round);
  const global = Array.from({ length: DIMS }, () => 0.35 + rand() * 0.5);
  const spread = phase === 'train' || phase === 'upload' ? driftAt(algorithm, round) * 0.45 : 0.02;
  const clients = Array.from({ length: CLIENTS }, (_, c) => {
    const r = mulberry32(7 + c * 31 + round * 101);
    return global.map(g => Math.min(1, Math.max(0.05, g + (r() - 0.5) * 2 * spread)));
  });
  return { global, clients };
}

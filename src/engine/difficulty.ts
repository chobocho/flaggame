import {
  INITIAL_TIME_LIMIT_MS,
  FINAL_TIME_LIMIT_MS,
  INITIAL_NEGATION_PROB,
  FINAL_NEGATION_PROB,
  INITIAL_COMPOUND_PROB,
  FINAL_COMPOUND_PROB,
  ROUNDS_TO_MAX,
} from '../constants';
import type { DifficultyParams } from '../types';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function difficultyForRound(roundIndex: number): DifficultyParams {
  const t = Math.max(0, Math.min(1, roundIndex / ROUNDS_TO_MAX));
  return {
    timeLimitMs: lerp(INITIAL_TIME_LIMIT_MS, FINAL_TIME_LIMIT_MS, t),
    negationProb: lerp(INITIAL_NEGATION_PROB, FINAL_NEGATION_PROB, t),
    compoundProb: lerp(INITIAL_COMPOUND_PROB, FINAL_COMPOUND_PROB, t),
  };
}

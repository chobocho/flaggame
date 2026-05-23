import { describe, it, expect } from 'vitest';
import { difficultyForRound } from '../src/engine/difficulty';
import {
  INITIAL_TIME_LIMIT_MS,
  FINAL_TIME_LIMIT_MS,
  INITIAL_NEGATION_PROB,
  FINAL_NEGATION_PROB,
  INITIAL_COMPOUND_PROB,
  FINAL_COMPOUND_PROB,
  ROUNDS_TO_MAX,
  TTS_RATE_MIN,
  TTS_RATE_MAX,
} from '../src/constants';

describe('difficultyForRound', () => {
  it('returns initial params at round 0', () => {
    const d = difficultyForRound(0);
    expect(d.timeLimitMs).toBe(INITIAL_TIME_LIMIT_MS);
    expect(d.negationProb).toBe(INITIAL_NEGATION_PROB);
    expect(d.compoundProb).toBe(INITIAL_COMPOUND_PROB);
  });

  it('returns final params at ROUNDS_TO_MAX', () => {
    const d = difficultyForRound(ROUNDS_TO_MAX);
    expect(d.timeLimitMs).toBe(FINAL_TIME_LIMIT_MS);
    expect(d.negationProb).toBe(FINAL_NEGATION_PROB);
    expect(d.compoundProb).toBe(FINAL_COMPOUND_PROB);
  });

  it('clamps to final params past ROUNDS_TO_MAX', () => {
    const d = difficultyForRound(ROUNDS_TO_MAX + 50);
    expect(d.timeLimitMs).toBe(FINAL_TIME_LIMIT_MS);
    expect(d.negationProb).toBe(FINAL_NEGATION_PROB);
    expect(d.compoundProb).toBe(FINAL_COMPOUND_PROB);
  });

  it('monotonically tightens time limit', () => {
    let prev = Number.POSITIVE_INFINITY;
    for (let r = 0; r <= ROUNDS_TO_MAX; r++) {
      const t = difficultyForRound(r).timeLimitMs;
      expect(t).toBeLessThanOrEqual(prev);
      prev = t;
    }
  });

  it('scales TTS rate from min to max across rounds', () => {
    expect(difficultyForRound(0).ttsRate).toBe(TTS_RATE_MIN);
    expect(difficultyForRound(ROUNDS_TO_MAX).ttsRate).toBe(TTS_RATE_MAX);
    expect(difficultyForRound(ROUNDS_TO_MAX + 99).ttsRate).toBe(TTS_RATE_MAX);
  });

  it('monotonically accelerates TTS rate', () => {
    let prev = -Infinity;
    for (let r = 0; r <= ROUNDS_TO_MAX; r++) {
      const rate = difficultyForRound(r).ttsRate;
      expect(rate).toBeGreaterThanOrEqual(prev);
      prev = rate;
    }
  });
});

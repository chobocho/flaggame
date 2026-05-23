import { describe, it, expect } from 'vitest';
import { buildCommand, CommandGenerator } from '../src/command/CommandGenerator';
import { mulberry32 } from '../src/util/rng';
import type { FlagsState } from '../src/types';

const allDown: FlagsState = { blue: 'DOWN', white: 'DOWN' };
const allUp: FlagsState = { blue: 'UP', white: 'UP' };
const mixed: FlagsState = { blue: 'UP', white: 'DOWN' };

describe('buildCommand — single positive', () => {
  it('"청기 올려" sets blue UP, leaves white untouched', () => {
    const cmd = buildCommand(allDown, [{ side: 'blue', pos: 'UP', negated: false }]);
    expect(cmd.text).toBe('청기 올려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'DOWN' });
  });

  it('"백기 내려" sets white DOWN', () => {
    const cmd = buildCommand(allUp, [{ side: 'white', pos: 'DOWN', negated: false }]);
    expect(cmd.text).toBe('백기 내려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'DOWN' });
  });

  it('"청기 올려" when blue already UP keeps target UP', () => {
    const cmd = buildCommand(mixed, [{ side: 'blue', pos: 'UP', negated: false }]);
    expect(cmd.text).toBe('청기 올려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'DOWN' });
  });
});

describe('buildCommand — single negative', () => {
  it('"청기 올리지 마" leaves state unchanged', () => {
    const cmd = buildCommand(allDown, [{ side: 'blue', pos: 'UP', negated: true }]);
    expect(cmd.text).toBe('청기 올리지 마');
    expect(cmd.target).toEqual(allDown);
  });

  it('"백기 내리지 마" leaves state unchanged when already up', () => {
    const cmd = buildCommand(allUp, [{ side: 'white', pos: 'DOWN', negated: true }]);
    expect(cmd.text).toBe('백기 내리지 마');
    expect(cmd.target).toEqual(allUp);
  });
});

describe('buildCommand — compound positive + positive', () => {
  it('"청기 올리고 백기 내려" sets both', () => {
    const cmd = buildCommand(allDown, [
      { side: 'blue', pos: 'UP', negated: false },
      { side: 'white', pos: 'DOWN', negated: false },
    ]);
    expect(cmd.text).toBe('청기 올리고 백기 내려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'DOWN' });
  });
});

describe('buildCommand — compound negative + positive', () => {
  it('"청기 올리지 말고 백기 올려" only changes white', () => {
    const cmd = buildCommand(allDown, [
      { side: 'blue', pos: 'UP', negated: true },
      { side: 'white', pos: 'UP', negated: false },
    ]);
    expect(cmd.text).toBe('청기 올리지 말고 백기 올려');
    expect(cmd.target).toEqual({ blue: 'DOWN', white: 'UP' });
  });

  it('"백기 내리지 말고 청기 올려" only changes blue', () => {
    const cmd = buildCommand(allUp, [
      { side: 'white', pos: 'DOWN', negated: true },
      { side: 'blue', pos: 'UP', negated: false },
    ]);
    expect(cmd.text).toBe('백기 내리지 말고 청기 올려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'UP' });
  });
});

describe('buildCommand — compound negative + negative', () => {
  it('"청기 올리지 말고 백기 내리지 마" leaves state unchanged', () => {
    const cmd = buildCommand(mixed, [
      { side: 'blue', pos: 'UP', negated: true },
      { side: 'white', pos: 'DOWN', negated: true },
    ]);
    expect(cmd.text).toBe('청기 올리지 말고 백기 내리지 마');
    expect(cmd.target).toEqual(mixed);
  });
});

describe('CommandGenerator.next', () => {
  it('is deterministic given the same seed', () => {
    const a = new CommandGenerator(mulberry32(42));
    const b = new CommandGenerator(mulberry32(42));
    const params = { negationProb: 0.4, compoundProb: 0.6, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 20; i++) {
      const ra = a.next(allDown, params);
      const rb = b.next(allDown, params);
      expect(ra).toEqual(rb);
    }
  });

  it('never produces a compound command with two clauses on the same flag', () => {
    const gen = new CommandGenerator(mulberry32(7));
    const params = { negationProb: 0.3, compoundProb: 1.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 100; i++) {
      const cmd = gen.next(allDown, params);
      // Compound text always contains exactly one of each color.
      expect(cmd.text.includes('청기')).toBe(true);
      expect(cmd.text.includes('백기')).toBe(true);
    }
  });

  it('with negationProb=1 and compoundProb=0 always preserves state', () => {
    const gen = new CommandGenerator(mulberry32(99));
    const params = { negationProb: 1.0, compoundProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 50; i++) {
      const cmd = gen.next(mixed, params);
      expect(cmd.target).toEqual(mixed);
      expect(cmd.text).toMatch(/지 마$/);
    }
  });
});

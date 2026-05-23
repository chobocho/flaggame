import { describe, it, expect } from 'vitest';
import { buildCommand, buildBothCommand, CommandGenerator } from '../src/command/CommandGenerator';
import { mulberry32 } from '../src/util/rng';
import type { FlagsState } from '../src/types';

const allDown: FlagsState = { blue: 'DOWN', white: 'DOWN' };
const allUp: FlagsState = { blue: 'UP', white: 'UP' };
const mixed: FlagsState = { blue: 'UP', white: 'DOWN' };
const allMiddle: FlagsState = { blue: 'MIDDLE', white: 'MIDDLE' };

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
    const params = { negationProb: 0.4, compoundProb: 0.6, bothProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 20; i++) {
      const ra = a.next(allDown, params);
      const rb = b.next(allDown, params);
      expect(ra).toEqual(rb);
    }
  });

  it('never produces a compound command with two clauses on the same flag', () => {
    const gen = new CommandGenerator(mulberry32(7));
    const params = { negationProb: 0.3, compoundProb: 1.0, bothProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 100; i++) {
      const cmd = gen.next(allDown, params);
      // Compound text always contains exactly one of each color.
      expect(cmd.text.includes('청기')).toBe(true);
      expect(cmd.text.includes('백기')).toBe(true);
    }
  });

  it('with negationProb=1 and compoundProb=0 always preserves state', () => {
    const gen = new CommandGenerator(mulberry32(99));
    const params = { negationProb: 1.0, compoundProb: 0.0, bothProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 50; i++) {
      const cmd = gen.next(mixed, params);
      expect(cmd.target).toEqual(mixed);
      expect(cmd.text).toMatch(/지 마$/);
    }
  });

  it('preserves MIDDLE rest state for negated commands', () => {
    const gen = new CommandGenerator(mulberry32(33));
    const params = { negationProb: 1.0, compoundProb: 0.0, bothProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 30; i++) {
      const cmd = gen.next(allMiddle, params);
      expect(cmd.target).toEqual(allMiddle);
    }
  });

  it('only ever asks for UP or DOWN, never MIDDLE', () => {
    const gen = new CommandGenerator(mulberry32(77));
    const params = { negationProb: 0.3, compoundProb: 0.5, bothProb: 0.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 50; i++) {
      const cmd = gen.next(allMiddle, params);
      // No MIDDLE in target for positive clauses; negated ones leave state at MIDDLE.
      expect(['UP', 'DOWN', 'MIDDLE']).toContain(cmd.target.blue);
      expect(['UP', 'DOWN', 'MIDDLE']).toContain(cmd.target.white);
      expect(cmd.text).not.toContain('가운데');
    }
  });
});

describe('buildBothCommand', () => {
  it('"청기 백기 둘다 올려" sets both UP from MIDDLE', () => {
    const cmd = buildBothCommand(allMiddle, 'UP', false);
    expect(cmd.text).toBe('청기 백기 둘다 올려');
    expect(cmd.target).toEqual({ blue: 'UP', white: 'UP' });
  });

  it('"청기 백기 둘다 내려" sets both DOWN', () => {
    const cmd = buildBothCommand(allMiddle, 'DOWN', false);
    expect(cmd.text).toBe('청기 백기 둘다 내려');
    expect(cmd.target).toEqual({ blue: 'DOWN', white: 'DOWN' });
  });

  it('"청기 백기 둘다 올리지 마" preserves current state', () => {
    const cmd = buildBothCommand(allMiddle, 'UP', true);
    expect(cmd.text).toBe('청기 백기 둘다 올리지 마');
    expect(cmd.target).toEqual(allMiddle);
  });

  it('"청기 백기 둘다 내리지 마" preserves current state', () => {
    const cmd = buildBothCommand(mixed, 'DOWN', true);
    expect(cmd.text).toBe('청기 백기 둘다 내리지 마');
    expect(cmd.target).toEqual(mixed);
  });
});

describe('CommandGenerator.next — both', () => {
  it('with bothProb=1 every command is a "둘다" command', () => {
    const gen = new CommandGenerator(mulberry32(11));
    const params = { negationProb: 0.4, compoundProb: 0.5, bothProb: 1.0, timeLimitMs: 1000, ttsRate: 1.0 };
    for (let i = 0; i < 30; i++) {
      const cmd = gen.next(allMiddle, params);
      expect(cmd.text.startsWith('청기 백기 둘다 ')).toBe(true);
      // Positive both → both same UP/DOWN; negative both → unchanged (MIDDLE/MIDDLE).
      expect(cmd.target.blue).toBe(cmd.target.white);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { HighScores } from '../src/highscores/HighScores';

// The node test environment has no indexedDB, so these tests exercise the
// in-memory fallback path — the same ordering/slicing contract getTop()
// provides when IndexedDB is available.
describe('HighScores (memory fallback)', () => {
  it('returns an empty list when nothing has been recorded', async () => {
    const hs = new HighScores();
    expect(await hs.getTop(10)).toEqual([]);
  });

  it('sorts entries by score descending', async () => {
    const hs = new HighScores();
    await hs.add({ score: 100, date: 1 });
    await hs.add({ score: 300, date: 2 });
    await hs.add({ score: 200, date: 3 });
    const top = await hs.getTop(10);
    expect(top.map(e => e.score)).toEqual([300, 200, 100]);
  });

  it('breaks score ties by most recent date first', async () => {
    const hs = new HighScores();
    await hs.add({ score: 100, date: 10 });
    await hs.add({ score: 100, date: 30 });
    await hs.add({ score: 100, date: 20 });
    const top = await hs.getTop(10);
    expect(top.map(e => e.date)).toEqual([30, 20, 10]);
  });

  it('limits the result to the requested count', async () => {
    const hs = new HighScores();
    for (let i = 1; i <= 15; i++) {
      await hs.add({ score: i * 10, date: i });
    }
    const top = await hs.getTop(10);
    expect(top).toHaveLength(10);
    expect(top[0]!.score).toBe(150);
    expect(top[9]!.score).toBe(60);
  });
});

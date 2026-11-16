import { beforeAll, describe, expect, it } from 'vitest';
import { initMemory, isDue, recall, review, seedFromLevel } from '../../src/engine/memory';

const DAY = 86_400_000;
const T0 = Date.parse('2026-11-16T09:00:00Z');

beforeAll(initMemory);

describe('memory model (FSRS)', () => {
  it('schedules a first good review days ahead and survives a JSON round trip', () => {
    const m = review(undefined, 'good', T0, 'es:hola');
    expect(m.reps).toBe(1);
    expect(m.due).toBeGreaterThan(T0 + DAY);
    const restored = JSON.parse(JSON.stringify(m));
    const next = review(restored, 'again', T0 + 5 * DAY, 'es:hola');
    expect(next.lapses).toBe(1);
    expect(next.due).toBeLessThan(T0 + 6 * DAY);
  });

  it('forgets over time and remembers better after good reviews', () => {
    const once = review(undefined, 'good', T0, 'a');
    const twice = review(once, 'good', T0 + 4 * DAY, 'a');
    const r1 = recall(once, T0 + 10 * DAY);
    const r2 = recall(twice, T0 + 10 * DAY);
    expect(recall(once, T0)).toBeCloseTo(1, 1);
    expect(r1).toBeLessThan(0.9);
    expect(r2).toBeGreaterThan(r1);
    expect(recall(undefined, T0)).toBe(0);
  });

  it('grades order stabilities: again < hard < good < easy', () => {
    const s = (['again', 'hard', 'good', 'easy'] as const).map(g => review(undefined, g, T0, 'x').s);
    expect([...s].sort((a, b) => a - b)).toEqual(s);
  });

  it('seeds v3 levels monotonically', () => {
    const r = [1, 2, 3, 4].map(l => recall(seedFromLevel(l, T0, 'k'), T0 + 7 * DAY));
    expect(r).toEqual([...r].sort((a, b) => a - b));
    expect(seedFromLevel(0, T0, 'k')).toBeUndefined();
    expect(isDue(seedFromLevel(1, T0, 'k'), T0 + 30 * DAY)).toBe(true);
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { courseById, indexOf } from '../../src/content';
import { cardOf, TIER } from '../../src/engine/exercises';
import { initMemory } from '../../src/engine/memory';
import { seeded } from '../../src/engine/random';
import { answer, createSession, next, outcome, type PoolCard, targetSuccess } from '../../src/engine/session';

beforeAll(initMemory);

const es = courseById('es');
const index = indexOf(es);
const fresh = (n: number): PoolCard[] =>
  es.lessons[0]!.items.slice(0, n).map(i => ({ card: cardOf(index, i), recall: 0, isNew: true }));
const known = (n: number, recall: number): PoolCard[] =>
  es.lessons[1]!.items.slice(0, n).map(i => ({ card: cardOf(index, i), recall, isNew: false }));

/** Plays a session to the end; `ok` decides each graded answer. */
function play(session: ReturnType<typeof createSession>, ok: (step: number) => boolean, limit = 80) {
  const rng = seeded(7);
  const kinds: string[] = [];
  for (let i = 0; i < limit; i++) {
    const ex = next(session, index, rng);
    if (!ex) break;
    kinds.push(ex.kind);
    if (ex.kind !== 'match') answer(session, ok(i));
  }
  return kinds;
}

describe('adaptive difficulty', () => {
  it('starts at 85 % and moves against recent accuracy', () => {
    expect(targetSuccess([])).toBe(0.85);
    expect(targetSuccess(Array(8).fill(true))).toBeLessThan(0.85);
    expect(targetSuccess(Array(8).fill(false))).toBeGreaterThan(0.85);
    expect(targetSuccess(Array(8).fill(false))).toBeLessThanOrEqual(0.95);
  });
});

describe('lesson session', () => {
  it('introduces new items (guess or learn first), climbs to production and ends', () => {
    const session = createSession({ kind: 'lesson', lessonId: 'base' }, fresh(4), { audio: true });
    const kinds = play(session, () => true);
    expect(['guess', 'learn']).toContain(kinds[0]);
    expect(kinds.filter(k => k === 'learn')).toHaveLength(4);
    expect(kinds.some(k => k !== 'match' && TIER[k as keyof typeof TIER] === 2)).toBe(true);
    const o = outcome(session);
    expect(o.learned).toHaveLength(4);
    expect(o.reviews.every(r => r.grade === 'good')).toBe(true);
    expect(o.perfect).toBe(true);
  });

  it('never shows an item before it was introduced, and brings back a missed item soon', () => {
    const session = createSession({ kind: 'lesson', lessonId: 'base' }, fresh(3), { audio: true });
    const rng = seeded(3);
    const introduced = new Set<string>();
    let missedKey = '';
    let missedAt = -1;
    let backAfter = -1;
    for (let i = 0; i < 60; i++) {
      const ex = next(session, index, rng);
      if (!ex || ex.kind === 'match') break;
      if (ex.kind === 'learn' || ex.kind === 'guess') introduced.add(ex.card.key);
      else expect(introduced.has(ex.card.key)).toBe(true);
      const graded = ex.kind !== 'learn' && ex.kind !== 'guess';
      const wrong = graded && !missedKey;
      if (wrong) {
        missedKey = ex.card.key;
        missedAt = i;
      } else if (graded && ex.card.key === missedKey && backAfter < 0) backAfter = i - missedAt;
      answer(session, !wrong);
    }
    expect(backAfter).toBeGreaterThan(0);
    expect(backAfter).toBeLessThanOrEqual(4);
    expect(outcome(session).reviews.find(r => r.key === missedKey)?.grade).toBe('hard');
  });

  it('skips audio formats when the device has no voice', () => {
    const session = createSession({ kind: 'lesson', lessonId: 'base' }, fresh(4), { audio: false });
    const kinds = play(session, () => true);
    expect(kinds).not.toContain('listen');
    expect(kinds).not.toContain('dictation');
  });

  it('stops at the exercise cap even if the learner keeps failing', () => {
    const session = createSession({ kind: 'lesson', lessonId: 'base' }, fresh(5), { audio: true, max: 12 });
    const kinds = play(session, () => false, 200);
    expect(kinds.length).toBeLessThanOrEqual(13);
  });
});

describe('reviews and tests', () => {
  it('starts well-remembered items at production', () => {
    const session = createSession({ kind: 'review', unitId: null }, known(4, 0.95), { audio: true });
    const first = next(session, index, seeded(1));
    expect(first && first.kind !== 'match' ? TIER[first.kind] : -9).toBe(2);
  });

  it('a test-out passes at 80 % with recall formats only', () => {
    const pool = es.lessons[0]!.items.map(i => ({ card: cardOf(index, i), recall: 0, isNew: true }));
    const session = createSession({ kind: 'test', lessonId: 'base' }, pool, { audio: true });
    const kinds = play(session, step => step % 10 !== 0);
    expect(kinds.every(k => TIER[k as keyof typeof TIER] >= 1)).toBe(true);
    expect(outcome(session).passed).toBe(true);
  });
});

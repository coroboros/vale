/**
 * Adaptive practice session.
 * - New items are introduced a few at a time: a no-penalty guess (pretesting), then a learn card.
 * - Each item climbs from recognition to production; a wrong answer steps it back and brings it
 *   back a couple of exercises later.
 * - The format of every exercise is chosen so that the predicted success is close to a target
 *   that starts at 85 % and moves against the learner's recent accuracy (Wilson et al., 2019).
 * - At the end, each item gets one FSRS review graded from its first attempt.
 */
import type { CourseIndex } from '../content';
import { build, type Card, canBuild, EASE, type Exercise, GRADED, type Kind, NEEDS_AUDIO, TIER } from './exercises';
import type { Grade } from './memory';
import type { Rng } from './random';

export type Mode =
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'pack'; packId: string }
  | { kind: 'test'; lessonId: string }
  | { kind: 'review'; unitId: string | null }
  | { kind: 'practice'; focus: 'mistakes' | 'fragile' | 'listening' | 'speaking' };

/** A card to practise with what is already known about it. */
export interface PoolCard {
  card: Card;
  /** Predicted recall now (0 for a new item). */
  recall: number;
  isNew: boolean;
}

interface Slot extends PoolCard {
  /** -2 needs a guess, -1 needs the learn card, 0..2 next tier to pass, 3 done. */
  stage: number;
  errors: number;
  firstOk: boolean | null;
  produced: boolean;
  /** Exercise number before which the item should not come back. */
  rest: number;
  seen: number;
}

export interface Session {
  mode: Mode;
  slots: Slot[];
  waiting: Slot[];
  current: Exercise | null;
  /** Graded answers so far, oldest first. */
  results: boolean[];
  step: number;
  max: number;
  lastKind: Kind | null;
  allowed: readonly Kind[];
  matchPlayed: boolean;
  spoken: number;
}

export interface Outcome {
  reviews: { key: string; grade: Grade }[];
  correct: number;
  total: number;
  learned: string[];
  spoken: number;
  perfect: boolean;
  passed: boolean;
  xp: number;
}

const TARGET = 0.85;
const WORKING_SET = 3;

/** Success rate the next exercise should aim for, nudged against recent accuracy. */
export function targetSuccess(results: readonly boolean[]): number {
  const recent = results.slice(-8);
  if (recent.length < 3) return TARGET;
  const accuracy = recent.filter(Boolean).length / recent.length;
  return Math.min(0.95, Math.max(0.75, TARGET + (TARGET - accuracy) * 0.6));
}

export function createSession(mode: Mode, pool: PoolCard[], opts: { audio: boolean; max?: number }): Session {
  const test = mode.kind === 'test';
  const focus = mode.kind === 'practice' ? mode.focus : null;
  const allowed = GRADED.filter(k => {
    if (!opts.audio && NEEDS_AUDIO.includes(k)) return false;
    if (focus === 'listening') return k === 'listen' || k === 'dictation';
    if (focus === 'speaking') return k === 'speak';
    if (test) return TIER[k] >= 1;
    return true;
  });
  const slots: Slot[] = pool.map((p, i) => ({
    ...p,
    stage: test || focus ? 2 : p.isNew ? (i % 2 === 0 ? -2 : -1) : p.recall >= 0.8 ? 2 : p.recall >= 0.5 ? 1 : 0,
    errors: 0,
    firstOk: null,
    produced: false,
    rest: 0,
    seen: -1,
  }));
  const fresh = slots.filter(s => s.stage < 0);
  const known = slots.filter(s => s.stage >= 0);
  return {
    mode,
    slots: [...known, ...fresh.slice(0, 2)],
    waiting: fresh.slice(2),
    current: null,
    results: [],
    step: 0,
    max: opts.max ?? (test ? pool.length : mode.kind === 'lesson' || mode.kind === 'pack' ? 18 : 14),
    lastKind: null,
    allowed,
    matchPlayed: false,
    spoken: 0,
  };
}

const open = (s: Slot) => s.stage < 3;

function chooseKind(session: Session, slot: Slot, rng: Rng): Kind {
  if (slot.stage === -2) return 'guess';
  if (slot.stage === -1) return 'learn';
  const struggling = targetSuccess(session.results) > 0.88;
  const tiers = struggling && slot.stage > 0 ? [slot.stage, slot.stage - 1] : [slot.stage];
  let kinds = session.allowed.filter(k => tiers.includes(TIER[k]) && canBuild(k, slot.card));
  if (!kinds.length) kinds = session.allowed.filter(k => TIER[k] <= slot.stage && canBuild(k, slot.card));
  if (!kinds.length) kinds = session.allowed.filter(k => canBuild(k, slot.card));
  const recall = slot.isNew ? 0.95 : Math.min(1, Math.max(0.3, slot.recall));
  const target = targetSuccess(session.results);
  const score = (k: Kind) => Math.abs(EASE[k] * recall - target) + (k === session.lastKind ? 0.08 : 0) + rng() * 0.04;
  return kinds.reduce((best, k) => (score(k) < score(best) ? k : best), kinds[0] ?? 'speak');
}

/** Moves to the next exercise; returns null when the session is over. */
export function next(session: Session, index: CourseIndex, rng: Rng): Exercise | null {
  if (session.step >= session.max) for (const s of session.slots) s.stage = Math.max(s.stage, 3);
  const working = session.slots.filter(s => open(s) && s.stage < 2).length;
  if (session.waiting.length && working < WORKING_SET && session.step < session.max)
    session.slots.push(session.waiting.shift()!);
  const candidates = session.slots.filter(open);
  if (!candidates.length) {
    const learnedHere = session.slots.filter(s => s.produced);
    const bonus = session.mode.kind === 'lesson' || session.mode.kind === 'review';
    if (bonus && !session.matchPlayed && learnedHere.length >= 4) {
      session.matchPlayed = true;
      session.current = { kind: 'match', cards: learnedHere.slice(-5).map(s => s.card) };
      return session.current;
    }
    session.current = null;
    return null;
  }
  const ready = candidates.filter(s => s.rest <= session.step && s.seen !== session.step - 1);
  const pool = ready.length ? ready : candidates;
  const slot = pool.reduce((a, b) => (b.seen < a.seen ? b : a));
  const kind = chooseKind(session, slot, rng);
  slot.seen = session.step;
  session.lastKind = kind;
  session.current = build(kind, slot.card, index, rng);
  return session.current;
}

const slotOf = (session: Session, key: string) => session.slots.find(s => s.card.key === key);

/** Records the learner's answer to the current exercise. Guess and learn cards are never graded. */
export function answer(session: Session, correct: boolean): void {
  const ex = session.current;
  if (!ex || ex.kind === 'match') return;
  const slot = slotOf(session, ex.card.key);
  if (!slot) return;
  session.step++;
  if (ex.kind === 'guess' || ex.kind === 'learn') {
    slot.stage += 1;
    return;
  }
  session.results.push(correct);
  slot.firstOk ??= correct;
  if (ex.kind === 'speak' && correct) session.spoken++;
  const tier = TIER[ex.kind];
  if (session.mode.kind === 'test') {
    if (correct) slot.produced = slot.produced || tier === 2;
    else slot.errors++;
    slot.stage = 3;
    return;
  }
  if (correct) {
    slot.stage = Math.max(slot.stage, tier + 1);
    if (tier === 2) slot.produced = true;
  } else {
    slot.errors++;
    slot.stage = Math.max(0, Math.min(slot.stage, tier) - 1);
    slot.rest = session.step + 2;
  }
}

export function progress(session: Session): number {
  const total = session.slots.length + session.waiting.length;
  if (!total) return 1;
  const value = (s: Slot) => (s.stage + 2) / 5;
  const done = session.slots.reduce((sum, s) => sum + Math.min(1, Math.max(0, value(s))), 0);
  return Math.min(1, Math.max(session.step / session.max, done / total));
}

export function outcome(session: Session): Outcome {
  const graded = session.slots.filter(s => s.firstOk !== null);
  const correct = session.results.filter(Boolean).length;
  const total = session.results.length;
  const test = session.mode.kind === 'test';
  const passed = !test || (total > 0 && correct / total >= 0.8);
  const reviews = graded.flatMap(s => {
    let grade: Grade;
    if (test) {
      if (!s.firstOk && s.isNew) return [];
      grade = s.firstOk ? 'good' : 'again';
    } else if (s.isNew) grade = s.errors === 0 ? 'good' : s.produced ? 'hard' : 'again';
    else grade = s.firstOk === false ? 'again' : s.errors > 0 ? 'hard' : 'good';
    return [{ key: s.card.key, grade }];
  });
  const productions = session.slots.filter(s => s.produced).length;
  const perfect = total >= 5 && correct === total;
  return {
    reviews: test && !passed ? reviews.filter(r => r.grade === 'again') : reviews,
    correct,
    total,
    learned: session.slots.filter(s => s.isNew && s.produced).map(s => s.card.key),
    spoken: session.spoken,
    perfect,
    passed,
    xp: correct + productions + (perfect ? 5 : 0) + (session.matchPlayed ? 3 : 0),
  };
}

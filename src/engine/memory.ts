/**
 * Long-term memory model: FSRS (Free Spaced Repetition Scheduler) through ts-fsrs.
 * FSRS predicts the probability of recalling each item; the app uses it to schedule
 * reviews, pick exercise difficulty and forecast what will be remembered on arrival.
 */
import { DefaultScheduler, Rating } from 'ts-fsrs';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

/** Compact persisted memory state of one item (dates in epoch ms). */
export interface Memory {
  s: number;
  sf: number;
  d: number;
  st: number;
  status: string;
  due: number;
  last: number | null;
  reps: number;
  lapses: number;
  sd: number;
  ls: number;
}

const create = () => DefaultScheduler({ version: 'FSRS-7', desiredRetention: 0.9, enableFuzz: false });
type Scheduler = Awaited<ReturnType<typeof create>>;
type Card = ReturnType<Scheduler['newCard']>;

const RATING = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy } as const;
const DAY = 86_400_000;

let scheduler: Scheduler | null = null;

/** Creates the scheduler once; call before any review. */
export async function initMemory(): Promise<void> {
  scheduler ??= await create();
}

function sched(): Scheduler {
  if (!scheduler) throw new Error('initMemory() must run before using the memory model');
  return scheduler;
}

function toCard(m: Memory, id: string): Card {
  const base = sched().newCard({ now: new Date(m.last ?? m.due) });
  return {
    ...base,
    cardId: id,
    stability: m.s,
    stabilityFast: m.sf,
    difficulty: m.d,
    state: m.st,
    scheduleStatus: m.status,
    dueAt: new Date(m.due),
    lastReviewAt: m.last === null ? null : new Date(m.last),
    reps: m.reps,
    lapses: m.lapses,
    scheduledDays: m.sd,
    learningStep: m.ls,
  } as Card;
}

function fromCard(c: Card): Memory {
  return {
    s: c.stability,
    sf: c.stabilityFast,
    d: c.difficulty,
    st: c.state,
    status: c.scheduleStatus,
    due: c.dueAt.getTime(),
    last: c.lastReviewAt ? c.lastReviewAt.getTime() : null,
    reps: c.reps,
    lapses: c.lapses,
    sd: c.scheduledDays,
    ls: c.learningStep,
  };
}

/** Applies one review and returns the new memory state. */
export function review(memory: Memory | undefined, grade: Grade, now: number, id: string): Memory {
  const s = sched();
  const card = memory ? toCard(memory, id) : s.newCard({ now: new Date(now) });
  return fromCard(s.review({ card, grade: RATING[grade], now: new Date(now) }).card);
}

/** Probability of recalling the item at time `at` (0 for an item never reviewed). */
export function recall(memory: Memory | undefined, at: number): number {
  if (!memory || memory.last === null) return 0;
  const s = sched();
  const elapsed = Math.max(0, s.chrono.difference(new Date(memory.last), new Date(at)));
  return s.model.forgettingCurve(toCard(memory, 'r'), elapsed);
}

export const isDue = (memory: Memory | undefined, now: number) => !!memory && memory.due <= now;

/** Rebuilds a plausible memory from a v3 level (1 seen … 4 produced) reviewed at `at`. */
export function seedFromLevel(level: number, at: number, id: string): Memory | undefined {
  const plans: Record<number, [Grade, number][]> = {
    1: [['hard', 0]],
    2: [['good', 0]],
    3: [
      ['good', 2],
      ['good', 0],
    ],
    4: [
      ['good', 6],
      ['good', 2],
      ['good', 0],
    ],
  };
  const plan = plans[Math.min(4, Math.round(level))];
  if (!plan) return undefined;
  return plan.reduce<Memory | undefined>(
    (m, [grade, daysBefore]) => review(m, grade, at - daysBefore * DAY, id),
    undefined,
  );
}

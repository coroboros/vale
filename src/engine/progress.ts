/**
 * Progress, motivation and forecasting, as pure functions over a profile's data.
 * Design notes with their evidence are in docs/LEARNING.md.
 */
import { type CourseIndex, itemKey } from '../content';
import type { Course, Item, Step } from '../content/types';
import { blankDay, type DayLog, type ProfileData } from '../state/schema';
import { recall } from './memory';
import { hashSeed, seeded, shuffle } from './random';

const DAY_MS = 86_400_000;

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return dayKey(new Date(y, m - 1, d + days, 12).getTime());
}

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T12:00:00`) - Date.parse(`${from}T12:00:00`)) / DAY_MS);

type Counter = Exclude<keyof DayLog, 'chest'>;

/* ------------------------------------------------------------------ streak */

const counts = (data: ProfileData, key: string) => (data.days[key]?.sessions ?? 0) > 0 || data.frozen.includes(key);

/** Consecutive days with practice (or kept by a joker), ending today or yesterday. */
export function streak(data: ProfileData, today: string): { days: number; today: boolean } {
  const doneToday = counts(data, today);
  let cursor = doneToday ? today : shiftDay(today, -1);
  let days = 0;
  while (counts(data, cursor)) {
    days++;
    cursor = shiftDay(cursor, -1);
  }
  return { days, today: doneToday };
}

/**
 * Spends jokers on missed days so a streak survives a day off. A broken streak lowers later
 * engagement unless it can be repaired (Silverman & Barasch, 2023), so jokers apply silently.
 */
export function spendJokers(data: ProfileData, today: string): void {
  const active = Object.keys(data.days).filter(k => counts(data, k) && k < today);
  const last = active.sort().at(-1);
  if (!last) return;
  const gap = daysBetween(last, today) - 1;
  if (gap <= 0 || gap > data.jokers) return;
  for (let i = 1; i <= gap; i++) data.frozen.push(shiftDay(last, i));
  data.jokers -= gap;
}

/** A streak broken yesterday can be repaired by doing twice the daily goal today. */
export function repairOffer(data: ProfileData, today: string, goal: number): { day: string; streak: number } | null {
  const yesterday = shiftDay(today, -1);
  if (counts(data, yesterday)) return null;
  const before = streak(data, shiftDay(yesterday, -1));
  if (before.days < 3 || !before.today) return null;
  if ((data.days[today]?.xp ?? 0) >= 2 * goal) return null;
  return { day: yesterday, streak: before.days };
}

/** Adds a session's numbers to today's log, earns jokers and applies a pending repair. */
export function logSession(data: ProfileData, now: number, add: Partial<Record<Counter, number>>, goal: number): void {
  const today = dayKey(now);
  const offer = repairOffer(data, today, goal);
  const firstToday = !counts(data, today);
  data.days[today] ??= blankDay();
  const log = data.days[today];
  for (const [k, v] of Object.entries(add) as [Counter, number][]) log[k] += v;
  if (offer && log.xp >= 2 * goal) data.frozen.push(offer.day);
  if (firstToday) {
    const s = streak(data, today).days;
    if (s > 0 && s % 7 === 0) data.jokers = Math.min(2, data.jokers + 1);
  }
}

/* ------------------------------------------------------------------ quests */

export interface Quest {
  id: string;
  label: string;
  metric: Counter;
  target: number;
}

const QUESTS: ((goal: number) => Quest)[] = [
  goal => ({ id: 'xp', label: `Gagne ${Math.round(goal * 1.5)} XP`, metric: 'xp', target: Math.round(goal * 1.5) }),
  () => ({ id: 'sessions', label: 'Termine 2 sessions', metric: 'sessions', target: 2 }),
  () => ({ id: 'spoken', label: 'Prononce 5 phrases à voix haute', metric: 'spoken', target: 5 }),
  () => ({ id: 'learned', label: 'Apprends 4 nouvelles phrases', metric: 'learned', target: 4 }),
  () => ({ id: 'perfect', label: 'Fais une session sans faute', metric: 'perfect', target: 1 }),
  () => ({ id: 'scenes', label: 'Joue une scène', metric: 'scenes', target: 1 }),
  () => ({ id: 'reviews', label: 'Révise 8 phrases', metric: 'reviews', target: 8 }),
  goal => ({
    id: 'minutes',
    label: `Pratique ${Math.round(goal / 4)} minutes`,
    metric: 'ms',
    target: Math.round(goal / 4) * 60_000,
  }),
];

/** Three quests a day, the same for a given profile and day. */
export function dailyQuests(profileId: string, day: string, goal: number): Quest[] {
  const rng = seeded(hashSeed(`${profileId}:${day}`));
  return shuffle(rng, QUESTS)
    .slice(0, 3)
    .map(q => q(goal));
}

export const questValue = (q: Quest, log: DayLog | undefined) => Math.min(q.target, log?.[q.metric] ?? 0);

/* ------------------------------------------------------------------ path */

export const lessonKey = (courseId: string, id: string) => `${courseId}:${id}`;

/** Share of a lesson's items already introduced. */
export function itemsProgress(data: ProfileData, courseId: string, items: Item[]): number {
  if (!items.length) return 1;
  return items.filter(i => data.mem[itemKey(courseId, i.id)]).length / items.length;
}

export function stepItems(course: Course, step: Step, region: string): Item[] {
  if (step.kind === 'lesson') return course.lessons.find(l => l.id === step.id)?.items ?? [];
  if (step.kind === 'pack') {
    const packId = course.regions.find(r => r.id === region)?.pack;
    return course.packs.find(p => p.id === packId)?.items ?? [];
  }
  return [];
}

/** Steps hidden for this learner (a regional pack outside its region). */
export const stepVisible = (course: Course, step: Step, region: string) =>
  step.kind !== 'pack' || !!course.regions.find(r => r.id === region)?.pack;

export function stepProgress(data: ProfileData, course: Course, step: Step, unitId: string, region: string): number {
  switch (step.kind) {
    case 'sounds':
      return data.lessons[lessonKey(course.id, 'sounds')] ? 1 : 0;
    case 'scene':
      return data.scenes[lessonKey(course.id, step.id)] ? 1 : 0;
    case 'review':
      return data.lessons[lessonKey(course.id, `review:${unitId}`)] ? 1 : 0;
    default:
      return itemsProgress(data, course.id, stepItems(course, step, region));
  }
}

/* ------------------------------------------------------------------ stamps */

export interface Stamp {
  id: string;
  label: string;
  desc: string;
}

export interface StampContext {
  data: ProfileData;
  course: Course;
  region: string;
  today: string;
}

const learnedCount = (data: ProfileData) => Object.keys(data.mem).length;

const STATIC_STAMPS: (Stamp & { earned: (c: StampContext) => boolean })[] = [
  {
    id: 'first',
    label: 'Premier pas',
    desc: 'Terminer une première session',
    earned: c => Object.values(c.data.days).some(d => d.sessions > 0),
  },
  {
    id: 'streak-3',
    label: '3 jours',
    desc: 'Pratiquer 3 jours d’affilée',
    earned: c => streak(c.data, c.today).days >= 3,
  },
  {
    id: 'streak-7',
    label: 'Une semaine',
    desc: 'Pratiquer 7 jours d’affilée',
    earned: c => streak(c.data, c.today).days >= 7,
  },
  {
    id: 'streak-30',
    label: 'Un mois',
    desc: 'Pratiquer 30 jours d’affilée',
    earned: c => streak(c.data, c.today).days >= 30,
  },
  { id: 'words-50', label: '50 phrases', desc: 'Apprendre 50 phrases', earned: c => learnedCount(c.data) >= 50 },
  { id: 'words-100', label: '100 phrases', desc: 'Apprendre 100 phrases', earned: c => learnedCount(c.data) >= 100 },
  { id: 'voice', label: 'Ça cause', desc: 'Prononcer 25 phrases à voix haute', earned: c => c.data.stats.spoken >= 25 },
  {
    id: 'perfect',
    label: 'Sans faute',
    desc: 'Réussir une session sans erreur',
    earned: c => c.data.stats.perfect >= 1,
  },
  { id: 'ear', label: 'Oreille d’or', desc: 'Comprendre 20 prix', earned: c => c.data.stats.prices >= 20 },
  { id: 'duo', label: 'En duo', desc: 'Jouer un duel à deux', earned: c => c.data.stats.duels >= 1 },
  {
    id: 'phrasebook',
    label: 'Mes mots à moi',
    desc: 'Garder une phrase traduite',
    earned: c => c.data.translations.some(t => t.saved),
  },
];

/** Passport stamps: fixed milestones plus one per course unit (each port of call). */
export function stamps(course: Course): Stamp[] {
  return [
    ...course.units.map(u => ({
      id: `${course.id}:${u.id}`,
      label: u.title,
      desc: `Terminer l’escale « ${u.title} »`,
    })),
    ...STATIC_STAMPS.map(({ id, label, desc }) => ({ id, label, desc })),
  ];
}

function unitDone(c: StampContext, unitId: string): boolean {
  const unit = c.course.units.find(u => u.id === unitId);
  return !!unit?.steps
    .filter(s => s.kind !== 'review' && stepVisible(c.course, s, c.region))
    .every(s => stepProgress(c.data, c.course, s, unit.id, c.region) >= 1);
}

/** Stamps earned now and not yet recorded. */
export function newStamps(c: StampContext): string[] {
  const units = c.course.units.filter(u => unitDone(c, u.id)).map(u => `${c.course.id}:${u.id}`);
  const fixed = STATIC_STAMPS.filter(s => s.earned(c)).map(s => s.id);
  return [...units, ...fixed].filter(id => !c.data.stamps[id]);
}

/* ------------------------------------------------------------------ forecast */

export interface Readiness {
  /** Mean predicted recall of the course's phrases at `at` (0..1). */
  score: number;
  learned: number;
  total: number;
  /** Learned items most at risk of being forgotten by then. */
  fragile: Item[];
}

/**
 * What the learner would remember on the day if they stopped practising now:
 * FSRS recall probability at that date, averaged over the whole course (unseen items count 0).
 */
export function readiness(index: CourseIndex, data: ProfileData, at: number, extra: Item[] = []): Readiness {
  const items = [...index.coreItems, ...extra];
  const scored = items.map(item => ({ item, r: recall(data.mem[itemKey(index.course.id, item.id)], at) }));
  const learned = scored.filter(s => data.mem[itemKey(index.course.id, s.item.id)]);
  return {
    score: scored.reduce((sum, s) => sum + s.r, 0) / Math.max(1, items.length),
    learned: learned.length,
    total: items.length,
    fragile: learned
      .filter(s => s.r < 0.85)
      .sort((a, b) => a.r - b.r)
      .map(s => s.item),
  };
}

/** Departure date as a timestamp at noon, or a week from now when no trip is planned. */
export function arrivalTime(trip: string, now: number): number {
  return trip ? Date.parse(`${trip}T12:00:00`) : now + 7 * DAY_MS;
}

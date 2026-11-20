/** Evidence for these rules: docs/LEARNING.md. */
import { type CourseIndex, itemKey, regionOf, splitKey } from '../content';
import { STORY } from '../content/story';
import type { Course, Item, Step, Unit } from '../content/types';
import { blankDay, type DayLog, type Profile, type ProfileData } from '../state/schema';
import { recall } from './memory';
import { hashSeed, seeded, shuffle } from './random';
import { DAY_MS } from './time';

/** The learner's local day, not UTC: a streak follows their clock. */
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

const counts = (data: ProfileData, key: string) => (data.days[key]?.sessions ?? 0) > 0 || data.frozen.includes(key);

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

/** The first daily goal starts a fifth done, for the answers of onboarding: a head start makes people finish (Nunes & Drèze, 2006). */
export const welcomeXp = (goal: number) => Math.round(goal / 5);

/** From here the rest of the goal is counted in phrases, where effort speeds up (Kivetz, Urminsky & Zheng, 2006). */
export const NEAR_GOAL = 5;

/** The app's XP as travellers see them: Bernard's shells (docs/BRAND.md, « Shells »). */
export const shellWord = (n: number) => (n > 1 ? 'coquillages' : 'coquillage');
export const shells = (n: number) => `${n} ${shellWord(n)}`;

/** A right answer earns at least 1 XP, so the XP left is also the most phrases left. */
export function goalTitle(xp: number, goal: number): string {
  const left = goal - xp;
  if (left <= 0) return 'Objectif du jour atteint';
  if (left === 1) return 'Plus qu’une phrase pour ton objectif du jour';
  if (left <= NEAR_GOAL) return `Plus que ${left} phrases pour ton objectif du jour`;
  return `Encore ${shells(left)} aujourd’hui`;
}

/** The Monday of `day`'s week, as French calendars start it. */
export function weekStart(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return shiftDay(day, -((new Date(y, m - 1, d, 12).getDay() + 6) % 7));
}

export interface Teammate {
  id: string;
  name: string;
  color: string;
  xp: number;
}

/**
 * Travellers on one phone play as a team: a weekly goal they reach together, five daily goals each,
 * and who brought what, highest first. Competition with collaboration moved behaviour most in
 * gamification studies (Sailer & Homner, 2020).
 */
export function teamWeek(
  profiles: readonly Profile[],
  data: Record<string, ProfileData>,
  today: string,
): { goal: number; xp: number; members: Teammate[] } {
  const from = weekStart(today);
  const members = profiles
    .map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      xp: Object.entries(data[p.id]?.days ?? {}).reduce(
        (n, [day, log]) => (day >= from && day <= today ? n + log.xp : n),
        0,
      ),
    }))
    .sort((a, b) => b.xp - a.xp);
  return {
    goal: profiles.reduce((n, p) => n + 5 * p.goal, 0),
    xp: members.reduce((n, m) => n + m.xp, 0),
    members,
  };
}

export interface Quest {
  id: string;
  label: string;
  metric: Counter;
  target: number;
}

const QUESTS: ((goal: number) => Quest)[] = [
  goal => ({
    id: 'xp',
    label: `Ramasse ${shells(Math.round(goal * 1.5))}`,
    metric: 'xp',
    target: Math.round(goal * 1.5),
  }),
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

/** Seeded by profile and day, so the quests stay the same all day. */
export function dailyQuests(profileId: string, day: string, goal: number): Quest[] {
  const rng = seeded(hashSeed(`${profileId}:${day}`));
  return shuffle(rng, QUESTS)
    .slice(0, 3)
    .map(q => q(goal));
}

export const questValue = (q: Quest, log: DayLog | undefined) => Math.min(q.target, log?.[q.metric] ?? 0);

export const lessonKey = (courseId: string, id: string) => `${courseId}:${id}`;

/** Phrases met so far in one language. */
export const learntIn = (data: ProfileData, courseId: string) =>
  Object.keys(data.mem).filter(k => splitKey(k)[0] === courseId).length;

function itemsProgress(data: ProfileData, courseId: string, items: Item[]): number {
  if (!items.length) return 1;
  return items.filter(i => data.mem[itemKey(courseId, i.id)]).length / items.length;
}

function stepItems(course: Course, step: Step, region: string): Item[] {
  if (step.kind === 'lesson') return course.lessons.find(l => l.id === step.id)?.items ?? [];
  if (step.kind === 'pack') {
    const packId = course.regions.find(r => r.id === region)?.pack;
    return course.packs.find(p => p.id === packId)?.items ?? [];
  }
  return [];
}

/** A regional pack is hidden outside its region. */
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

/**
 * Bernard's latest postcard from a leg of the trip: his arrival once the leg has begun, the next one
 * with each step done, the last when the whole leg is.
 */
export function postcard(course: Course, unit: Unit, data: ProfileData, region: string): string {
  const chapter = STORY[unit.id];
  const progress = unit.steps
    .filter(step => stepVisible(course, step, region))
    .map(step => stepProgress(data, course, step, unit.id, region));
  if (!chapter || !progress.some(v => v > 0)) return '';
  const done = progress.filter(v => v >= 1).length;
  const beat = done === progress.length ? chapter[3] : done === 0 ? chapter[0] : done === 1 ? chapter[1] : chapter[2];
  return beat.replace('{at}', regionOf(course, region).at);
}

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

export function newStamps(c: StampContext): string[] {
  const units = c.course.units.filter(u => unitDone(c, u.id)).map(u => `${c.course.id}:${u.id}`);
  const fixed = STATIC_STAMPS.filter(s => s.earned(c)).map(s => s.id);
  return [...units, ...fixed].filter(id => !c.data.stamps[id]);
}

export interface Readiness {
  score: number;
  learned: number;
  total: number;
  fragile: Item[];
}

/**
 * What the learner would still know on arrival if they stopped now: mean FSRS recall over the whole
 * course, unseen items counting 0.
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

/**
 * Noon, so a time-zone or daylight-saving shift cannot move the day; with no trip, a week ahead;
 * once there, now: what matters on site is what is remembered today.
 */
export function arrivalTime(trip: string, now: number): number {
  return trip ? Math.max(now, Date.parse(`${trip}T12:00:00`)) : now + 7 * DAY_MS;
}

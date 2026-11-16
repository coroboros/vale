/** Everything the learner can do, wiring content, engine and saved state together. */
import { signal } from '@preact/signals';
import { type CourseIndex, courseById, itemKey } from './content';
import { review } from './engine/memory';
import { buildPool } from './engine/pool';
import { arrivalTime, dayKey, lessonKey, logSession, newStamps, spendJokers, streak } from './engine/progress';
import { type Rng, seeded } from './engine/random';
import { answer, createSession, type Mode, next, type Outcome, outcome, type Session } from './engine/session';
import { canSpeak, stopSpeech } from './platform/speech';
import { blankData, type DB, newId, type Profile, type ProfileData, type Translation } from './state/schema';
import { cindex, pdata, profile, update, updateData } from './state/store';
import { sentenceKey } from './translation-api';
import { showToast } from './ui/kit';
import { go } from './ui/router';

/* ------------------------------------------------------------------ day */

/** Keeps yesterday's streak alive with a joker if one is available. */
export function settleDay(now = Date.now()): void {
  if (!profile.value) return;
  updateData(data => spendJokers(data, dayKey(now)));
}

/* ------------------------------------------------------------------ sessions */

export interface Summary {
  outcome: Outcome;
  ms: number;
  bestCombo: number;
  stamps: string[];
  streak: number;
  lessonDone: boolean;
}

export interface Running {
  session: Session;
  index: CourseIndex;
  rng: Rng;
  title: string;
  startedAt: number;
  combo: number;
  bestCombo: number;
  /** Mistakes per item during this session. */
  misses: Record<string, number>;
  summary: Summary | null;
}

export const running = signal<Running | null>(null);

/** Re-publishes the running session after an in-place change. */
const touch = () => {
  if (running.value) running.value = { ...running.value };
};

export function startSession(mode: Mode, title: string, now = Date.now()): void {
  const p = profile.value;
  if (!p) return;
  const index = cindex.value;
  const pool = buildPool(mode, { index, data: pdata.value, now, horizon: arrivalTime(p.trip, now) });
  if (!pool.length) {
    showToast(
      mode.kind === 'practice' && mode.focus === 'mistakes'
        ? 'Aucune erreur à revoir. Bravo !'
        : 'Rien à réviser pour l’instant : commence une leçon.',
    );
    return;
  }
  const rng = seeded(now);
  const session = createSession(mode, pool, { audio: canSpeak(index.course.lang) });
  next(session, index, rng);
  running.value = { session, index, rng, title, startedAt: now, combo: 0, bestCombo: 0, misses: {}, summary: null };
  go({ name: 'session' });
}

export function submitAnswer(correct: boolean): void {
  const r = running.value;
  const ex = r?.session.current;
  if (!r || !ex) return;
  if (ex.kind !== 'guess' && ex.kind !== 'learn' && ex.kind !== 'match') {
    r.combo = correct ? r.combo + 1 : 0;
    r.bestCombo = Math.max(r.bestCombo, r.combo);
    if (!correct) r.misses[ex.card.key] = (r.misses[ex.card.key] ?? 0) + 1;
  }
  answer(r.session, correct);
  touch();
}

/** Goes to the next exercise, or closes the session with its summary. */
export function advance(now = Date.now()): void {
  const r = running.value;
  if (!r) return;
  stopSpeech();
  if (!next(r.session, r.index, r.rng)) r.summary = finish(r, now);
  touch();
}

function finish(r: Running, now: number): Summary {
  const result = outcome(r.session);
  const p = profile.value!;
  const mode = r.session.mode;
  const course = r.index.course;
  let lessonDone = false;
  let earned: string[] = [];
  let days = 0;
  updateData(data => {
    for (const { key, grade } of result.reviews) data.mem[key] = review(data.mem[key], grade, now, key);
    for (const [key, n] of Object.entries(r.misses)) data.mistakes[key] = (data.mistakes[key] ?? 0) + n;
    for (const { key } of result.reviews.filter(x => x.grade === 'good' && !r.misses[x.key])) delete data.mistakes[key];
    const lessonId =
      mode.kind === 'lesson' || mode.kind === 'test' ? mode.lessonId : mode.kind === 'pack' ? mode.packId : null;
    if (lessonId && result.passed) {
      const items =
        mode.kind === 'pack' ? course.packs.find(x => x.id === lessonId)?.items : r.index.lessons.get(lessonId)?.items;
      if (items?.every(i => data.mem[itemKey(course.id, i.id)])) {
        lessonDone = !data.lessons[lessonKey(course.id, lessonId)];
        data.lessons[lessonKey(course.id, lessonId)] ??= now;
      }
    }
    if (mode.kind === 'review' && mode.unitId) data.lessons[lessonKey(course.id, `review:${mode.unitId}`)] = now;
    data.stats.spoken += result.spoken;
    if (result.perfect) data.stats.perfect++;
    logSession(
      data,
      now,
      {
        xp: result.xp + (lessonDone ? 5 : 0),
        ms: now - r.startedAt,
        sessions: 1,
        correct: result.correct,
        spoken: result.spoken,
        learned: result.learned.length,
        perfect: result.perfect ? 1 : 0,
        reviews: mode.kind === 'review' || mode.kind === 'practice' ? result.reviews.length : 0,
      },
      p.goal,
    );
    earned = awardStamps(data, p, now);
    days = streak(data, dayKey(now)).days;
  });
  return { outcome: result, ms: now - r.startedAt, bestCombo: r.bestCombo, stamps: earned, streak: days, lessonDone };
}

function awardStamps(data: ProfileData, p: Profile, now: number): string[] {
  const earned = newStamps({ data, course: courseById(p.course), region: p.region, today: dayKey(now) });
  for (const id of earned) data.stamps[id] = now;
  return earned;
}

export function closeSession(): void {
  stopSpeech();
  running.value = null;
  go({ name: 'home' }, { replace: true });
}

/* ------------------------------------------------------------------ scenes, sounds, activities */

export function completeScene(sceneId: string, correct: number, now = Date.now()): string[] {
  const p = profile.value;
  if (!p) return [];
  let earned: string[] = [];
  updateData(data => {
    data.scenes[lessonKey(p.course, sceneId)] ??= now;
    logSession(data, now, { xp: 5 + correct, sessions: 1, scenes: 1, correct, spoken: 0 }, p.goal);
    earned = awardStamps(data, p, now);
  });
  return earned;
}

export function markSoundsSeen(now = Date.now()): void {
  const p = profile.value;
  if (!p) return;
  updateData(data => {
    data.lessons[lessonKey(p.course, 'sounds')] ??= now;
  });
}

export function logActivity(
  stats: Partial<Pick<ProfileData['stats'], 'prices' | 'pairs' | 'duels'>>,
  xp: number,
  now = Date.now(),
): string[] {
  const p = profile.value;
  if (!p) return [];
  let earned: string[] = [];
  updateData(data => {
    for (const [k, v] of Object.entries(stats) as [keyof ProfileData['stats'], number][]) data.stats[k] += v;
    logSession(data, now, { xp, sessions: 1 }, p.goal);
    earned = awardStamps(data, p, now);
  });
  return earned;
}

/** The day's three quests are done: a small, varied reward (a joker or bonus XP). */
export function openChest(now = Date.now()): void {
  const p = profile.value;
  if (!p) return;
  const joker = seeded(now)() < 0.5;
  let text = '';
  updateData(data => {
    const log = data.days[dayKey(now)];
    if (!log || log.chest) return;
    log.chest = true;
    if (joker && data.jokers < 2) {
      data.jokers++;
      text = 'Coffre ouvert : un joker de série en plus.';
    } else {
      log.xp += 15;
      text = 'Coffre ouvert : 15 XP en bonus.';
    }
  });
  if (text) showToast(text);
}

/* ------------------------------------------------------------------ phrases */

export function toggleFavorite(key: string): void {
  updateData(data => {
    data.favorites = data.favorites.includes(key) ? data.favorites.filter(k => k !== key) : [...data.favorites, key];
  });
}

const HISTORY_MAX = 300;

/** Keeps a translation in the history (most recent first, duplicates merged). */
export function rememberTranslation(entry: Omit<Translation, 'id' | 'at' | 'saved'>, now = Date.now()): Translation {
  let kept: Translation = { ...entry, id: newId(), at: now, saved: false };
  updateData(data => {
    const key = sentenceKey(entry.fr);
    const same = data.translations.find(t => t.course === entry.course && sentenceKey(t.fr) === key);
    kept = same ? { ...same, ...entry, at: now } : kept;
    data.translations = [kept, ...data.translations.filter(t => t.id !== kept.id)].slice(0, HISTORY_MAX);
  });
  return kept;
}

export function setTranslationSaved(id: string, saved: boolean): void {
  updateData((data, draft) => {
    const t = data.translations.find(x => x.id === id);
    if (!t) return;
    t.saved = saved;
    const p = draft.profiles.find(x => x.id === draft.active);
    if (saved && p) awardStamps(data, p, Date.now());
  });
}

export function forgetTranslation(id: string): void {
  updateData(data => {
    data.translations = data.translations.filter(t => t.id !== id);
    delete data.mem[itemKey(cindex.value.course.id, `user-${id}`)];
  });
}

/* ------------------------------------------------------------------ profiles */

export function createProfiles(profiles: Omit<Profile, 'id'>[]): void {
  update(draft => {
    for (const p of profiles) {
      const id = newId();
      draft.profiles.push({ ...p, id });
      draft.data[id] = blankData();
    }
    draft.active = draft.profiles[0]?.id ?? '';
    draft.onboarded = true;
  });
}

export function switchProfile(id: string): void {
  update(draft => {
    if (draft.profiles.some(p => p.id === id)) draft.active = id;
  });
  settleDay();
}

export function editProfile(patch: Partial<Omit<Profile, 'id'>>): void {
  update(draft => {
    const p = draft.profiles.find(x => x.id === draft.active);
    if (p) Object.assign(p, patch);
  });
}

export function resetProgress(): void {
  update(draft => {
    draft.data[draft.active] = blankData();
  });
}

export function restoreBackup(next: DB): void {
  update(draft => Object.assign(draft, next));
  showToast('Sauvegarde restaurée.');
}

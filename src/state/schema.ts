/** Persisted data, version 4. Everything lives on the device; nothing is sent anywhere. */
import type { Gender } from '../content/types';
import type { Memory } from '../engine/memory';

export const DB_VERSION = 4;
export const STORAGE_KEY = 'db-v4';
export const LEGACY_KEY = 'vale-v3';

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  color: string;
  course: string;
  region: string;
  /** Departure date (YYYY-MM-DD), or '' when unknown. */
  trip: string;
  /** Daily goal in XP. */
  goal: number;
  /** When the learner plans to practise (implementation intention), or ''. */
  cue: string;
}

export interface Settings {
  autoplay: boolean;
  slow: boolean;
  phonetics: boolean;
  sfx: boolean;
  /** Rotate between the device's voices of the language (high-variability listening). */
  variedVoices: boolean;
}

export interface DayLog {
  xp: number;
  ms: number;
  sessions: number;
  correct: number;
  spoken: number;
  learned: number;
  perfect: number;
  scenes: number;
  reviews: number;
  /** Reward for the day's three quests has been collected. */
  chest: boolean;
}

/** A translation kept in the learner's history; `saved` ones are practised like course items. */
export interface Translation {
  id: string;
  course: string;
  fr: string;
  t: string;
  ph: string;
  note: string;
  alternatives: string[];
  at: number;
  saved: boolean;
}

export interface SurvivalCardData {
  hotel: string;
  address: string;
  allergens: string[];
  diets: string[];
}

export interface Stats {
  spoken: number;
  prices: number;
  pairs: number;
  duels: number;
  perfect: number;
}

export interface ProfileData {
  /** Item key (`course:item`) → FSRS memory. */
  mem: Record<string, Memory>;
  /** `course:lesson` → completion time. */
  lessons: Record<string, number>;
  /** `course:scene` → completion time. */
  scenes: Record<string, number>;
  days: Record<string, DayLog>;
  /** Days kept in the streak by a joker or a repair. */
  frozen: string[];
  jokers: number;
  stamps: Record<string, number>;
  /** Item key → number of mistakes. */
  mistakes: Record<string, number>;
  favorites: string[];
  card: SurvivalCardData;
  stats: Stats;
  translations: Translation[];
}

export interface DB {
  v: typeof DB_VERSION;
  onboarded: boolean;
  profiles: Profile[];
  active: string;
  settings: Settings;
  data: Record<string, ProfileData>;
}

export const PROFILE_COLORS = ['#1E5FD0', '#D6336C', '#7048E8', '#0B7C8C'] as const;

export const GOALS = [
  { xp: 20, label: 'Tranquille', minutes: 5 },
  { xp: 40, label: 'Régulier', minutes: 10 },
  { xp: 60, label: 'Intense', minutes: 15 },
] as const;

export const CUES = [
  { id: 'coffee', label: 'Avec mon café du matin' },
  { id: 'commute', label: 'Dans les transports' },
  { id: 'lunch', label: 'À la pause déjeuner' },
  { id: 'evening', label: 'Le soir, avant de dormir' },
] as const;

export const blankDay = (): DayLog => ({
  xp: 0,
  ms: 0,
  sessions: 0,
  correct: 0,
  spoken: 0,
  learned: 0,
  perfect: 0,
  scenes: 0,
  reviews: 0,
  chest: false,
});

export const blankData = (): ProfileData => ({
  mem: {},
  lessons: {},
  scenes: {},
  days: {},
  frozen: [],
  jokers: 0,
  stamps: {},
  mistakes: {},
  favorites: [],
  card: { hotel: '', address: '', allergens: [], diets: [] },
  stats: { spoken: 0, prices: 0, pairs: 0, duels: 0, perfect: 0 },
  translations: [],
});

export const defaultSettings = (): Settings => ({
  autoplay: true,
  slow: false,
  phonetics: true,
  sfx: true,
  variedVoices: true,
});

export const blankDB = (): DB => ({
  v: DB_VERSION,
  onboarded: false,
  profiles: [],
  active: '',
  settings: defaultSettings(),
  data: {},
});

export const newId = () => Math.random().toString(36).slice(2, 10);

/**
 * Repairs any stored value into a valid DB: unknown fields are dropped, missing ones
 * get defaults. Used on every load so a damaged or older record never breaks the app.
 */
export function sanitize(raw: unknown): DB {
  const db = blankDB();
  if (!raw || typeof raw !== 'object') return db;
  const src = raw as Partial<DB>;
  db.onboarded = src.onboarded === true;
  db.settings = { ...defaultSettings(), ...(src.settings ?? {}) };
  db.profiles = Array.isArray(src.profiles)
    ? src.profiles
        .filter(p => p && typeof p.id === 'string' && typeof p.name === 'string')
        .map(p => ({
          id: p.id,
          name: p.name.slice(0, 24),
          gender: p.gender === 'f' ? 'f' : 'm',
          color: typeof p.color === 'string' ? p.color : PROFILE_COLORS[0],
          course: typeof p.course === 'string' ? p.course : 'es',
          region: typeof p.region === 'string' ? p.region : 'autre',
          trip: typeof p.trip === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.trip) ? p.trip : '',
          goal: GOALS.some(g => g.xp === p.goal) ? p.goal : 40,
          cue: typeof p.cue === 'string' ? p.cue : '',
        }))
    : [];
  db.active = db.profiles.some(p => p.id === src.active) ? (src.active as string) : (db.profiles[0]?.id ?? '');
  for (const p of db.profiles) {
    const d = (src.data?.[p.id] ?? {}) as Partial<ProfileData>;
    const base = blankData();
    db.data[p.id] = {
      ...base,
      ...d,
      card: { ...base.card, ...(d.card ?? {}) },
      stats: { ...base.stats, ...(d.stats ?? {}) },
      frozen: Array.isArray(d.frozen) ? d.frozen : [],
      favorites: Array.isArray(d.favorites) ? d.favorites : [],
      translations: Array.isArray(d.translations) ? d.translations : [],
      jokers: Number.isFinite(d.jokers) ? Math.max(0, Math.min(2, d.jokers as number)) : 0,
    };
  }
  if (!db.profiles.length) db.onboarded = false;
  return db;
}

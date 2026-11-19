/** What Bagage keeps on the device. Only sentences to translate and anonymous counts (counts-api.ts) leave it. */

import type { Gender } from '../content/types';
import { COUNT_NAMES, type CountName, type Source, sourceOf } from '../counts-api';
import type { Memory } from '../engine/memory';
import { HOUR_MS } from '../engine/time';

const DB_VERSION = 4;
export const STORAGE_KEY = 'db-v4';
export const LEGACY_KEY = 'vale-v3';

/** One trip: a language, a destination, a departure day. Several can share a language. */
export interface Trip {
  id: string;
  course: string;
  region: string;
  /** Departure day, YYYY-MM-DD, or '' when not chosen yet. */
  date: string;
  /** For the survival card: each trip has its own. */
  hotel: string;
  address: string;
}

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  color: string;
  /** Every trip planned, in any language: two trips in a row, or two languages at once. */
  trips: Trip[];
  /** The trip in focus: home, lessons and the memory forecast follow it and its language. */
  trip: string;
  /** XP per day. */
  goal: number;
  /** When the learner plans to practise (implementation intention), or ''. */
  cue: string;
  /** The traveller's first day, from which the anonymous counts reckon; '' for older profiles. */
  since: string;
}

export interface Settings {
  autoplay: boolean;
  slow: boolean;
  phonetics: boolean;
  sfx: boolean;
  /** Varied speakers help listening (evidence in platform/speech.ts). */
  variedVoices: boolean;
  quiet: boolean;
  /** ms since epoch. */
  quietUntil: number;
  /** Word-by-word feedback from the browser's speech recognition: 'ask' first, as the audio may go online. */
  speechCheck: SpeechCheckChoice;
  /** Anonymous counts of who comes back (counts-api.ts): on unless switched off in « Moi ». */
  shareCounts: boolean;
}

const SPEECH_CHECK = ['ask', 'on', 'off'] as const;
type SpeechCheckChoice = (typeof SPEECH_CHECK)[number];

export const blankTrip = (course: string, id = newId()): Trip => ({
  id,
  course,
  region: 'autre',
  date: '',
  hotel: '',
  address: '',
});

export const tripOf = (p: Profile): Trip => p.trips.find(t => t.id === p.trip) ?? p.trips[0] ?? blankTrip('es', '');

/** Upcoming trips first, the soonest on top; then those without a date; then past ones, latest first. */
export function orderTrips(trips: Trip[], today: string): Trip[] {
  const rank = (t: Trip) => (!t.date ? 1 : t.date >= today ? 0 : 2);
  return [...trips].sort(
    (a, b) => rank(a) - rank(b) || (rank(a) === 2 ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)),
  );
}

export const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

type StoredTrip = Partial<Record<keyof Trip, unknown>>;
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Trips were first one `region` and one `trip` date per profile, then one per language (`trips`
 * keyed by course, `course` the one in use); both become entries of the list.
 */
function repairTrips(p: { course?: unknown; trips?: unknown; trip?: unknown; region?: unknown }): {
  trips: Trip[];
  trip: string;
} {
  const course = typeof p.course === 'string' ? p.course : 'es';
  const stored: StoredTrip[] = Array.isArray(p.trips)
    ? p.trips
    : p.trips && typeof p.trips === 'object'
      ? Object.entries(p.trips as Record<string, StoredTrip>).map(([id, t]) => ({ ...t, id, course: id }))
      : [];
  const trips: Trip[] = [];
  for (const t of stored) {
    if (!t || typeof t.region !== 'string') continue;
    // Ids name the trip in focus and the one to edit or remove: each must be unique.
    const id = typeof t.id === 'string' && !trips.some(x => x.id === t.id) ? t.id : newId();
    trips.push({
      id,
      course: typeof t.course === 'string' ? t.course : course,
      region: t.region,
      date: isDay(t.date) ? t.date : '',
      hotel: text(t.hotel),
      address: text(t.address),
    });
  }
  if (!trips.length)
    trips.push({ ...blankTrip(course, course), region: text(p.region) || 'autre', date: isDay(p.trip) ? p.trip : '' });
  const focus = trips.find(t => t.id === p.trip) ?? trips.find(t => t.course === course) ?? trips[0]!;
  return { trips, trip: focus.id };
}

/** Long enough for a commute. */
export const QUIET_MS = HOUR_MS;

/** Quiet mode: no listening exercise and no sound the learner did not ask for. */
export const quietActive = (s: Settings, now: number): boolean => s.quiet || s.quietUntil > now;

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
  /** XP given that day for the answers of onboarding, counted in `xp` too. */
  welcome: number;
  chest: boolean;
}

/** `saved` ones are practised like course items. */
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

/** About the traveller, whatever the trip; the hotel and address belong to each trip. */
export interface SurvivalCardData {
  allergens: string[];
  diets: string[];
}

interface Stats {
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
  /**
   * What this traveller has added to the anonymous counts; whether they opened Bagage from the home
   * screen in their first week, and shared their card; the link they came through.
   */
  counts: { sent: CountName[]; installed: boolean; shared: boolean; source: Source };
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

/** The goal with these daily XP, or the middle one. */
export const goalOf = (xp: unknown) => GOALS.find(g => g.xp === xp) ?? GOALS[1];

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
  welcome: 0,
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
  card: { allergens: [], diets: [] },
  stats: { spoken: 0, prices: 0, pairs: 0, duels: 0, perfect: 0 },
  translations: [],
  counts: { sent: [], installed: false, shared: false, source: '' },
});

const defaultSettings = (): Settings => ({
  autoplay: true,
  slow: false,
  phonetics: true,
  sfx: true,
  variedVoices: true,
  quiet: false,
  quietUntil: 0,
  speechCheck: 'ask',
  shareCounts: true,
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
  const saved = (src.settings ?? {}) as Partial<Record<keyof Settings, unknown>>;
  const defaults = defaultSettings();
  db.settings = Object.fromEntries(
    Object.entries(defaults).map(([k, v]) => [
      k,
      typeof saved[k as keyof Settings] === typeof v ? saved[k as keyof Settings] : v,
    ]),
  ) as unknown as Settings;
  if (!SPEECH_CHECK.includes(db.settings.speechCheck)) db.settings.speechCheck = 'ask';
  db.profiles = Array.isArray(src.profiles)
    ? src.profiles
        .filter(p => p && typeof p.id === 'string' && typeof p.name === 'string')
        .map(p => ({
          id: p.id,
          name: p.name.slice(0, 24),
          gender: p.gender === 'f' ? 'f' : 'm',
          color: typeof p.color === 'string' ? p.color : PROFILE_COLORS[0],
          ...repairTrips(p),
          goal: goalOf(p.goal).xp,
          cue: typeof p.cue === 'string' ? p.cue : '',
          since: typeof p.since === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.since) ? p.since : '',
        }))
    : [];
  db.active = db.profiles.some(p => p.id === src.active) ? (src.active as string) : (db.profiles[0]?.id ?? '');
  for (const p of db.profiles) {
    const d = (src.data?.[p.id] ?? {}) as Partial<ProfileData>;
    const base = blankData();
    const card = (d.card ?? {}) as Partial<Record<'hotel' | 'address' | keyof SurvivalCardData, unknown>>;
    const focus = tripOf(p);
    // The card once kept one hotel and address for every trip: they go to the trip in focus.
    if (!focus.hotel && !focus.address) Object.assign(focus, { hotel: text(card.hotel), address: text(card.address) });
    db.data[p.id] = {
      ...base,
      ...d,
      card: {
        allergens: Array.isArray(card.allergens) ? card.allergens : [],
        diets: Array.isArray(card.diets) ? card.diets : [],
      },
      stats: { ...base.stats, ...(d.stats ?? {}) },
      days: Object.fromEntries(
        Object.entries(d.days ?? {}).flatMap(([day, log]) =>
          log && typeof log === 'object' ? [[day, { ...blankDay(), ...log }]] : [],
        ),
      ),
      frozen: Array.isArray(d.frozen) ? d.frozen : [],
      favorites: Array.isArray(d.favorites) ? d.favorites : [],
      translations: Array.isArray(d.translations) ? d.translations : [],
      jokers: Number.isFinite(d.jokers) ? Math.max(0, Math.min(2, d.jokers as number)) : 0,
      counts: {
        sent: Array.isArray(d.counts?.sent) ? d.counts.sent.filter(name => COUNT_NAMES.includes(name)) : [],
        installed: d.counts?.installed === true,
        shared: d.counts?.shared === true,
        source: sourceOf(d.counts?.source),
      },
    };
  }
  if (!db.profiles.length) db.onboarded = false;
  return db;
}

/**
 * The anonymous counts behind the decision figures (RUNBOOK.md), shared by the app and the Worker.
 * A count says what happened, on which first day and through which link, never who: no
 * identifier, no sentence. The CNIL exempts such audience measurement from consent when it only
 * produces anonymous statistics for the publisher, its purposes including navigation problems and
 * ergonomics, and people are told and can easily say no (cnil.fr, « Cookies : solutions pour les
 * outils de mesure d’audience », 4 July 2025; « Questions-réponses », 29 April 2026).
 */
import { GRADED, type Kind } from './engine/exercises.ts';

export const COUNT_NAMES = ['new', 'day1', 'day7', 'installed', 'shared', 'departure', 'step'] as const;
export type CountName = (typeof COUNT_NAMES)[number];

/**
 * A newcomer's way to the end of the first lesson: onboarding's screens in their order
 * (ui/screens/Onboarding.tsx), then the first lesson begun and finished. Each counts once per
 * phone, to see where people stop (docs/UX.md).
 */
export const FIRST_STEPS = [
  'welcome',
  'language',
  'destination',
  'date',
  'travellers',
  'rhythm',
  'imagine',
  'lesson',
  'lesson-done',
] as const;
export type FirstStep = (typeof FIRST_STEPS)[number];

/** What is counted, as travellers read it in the switch and in the privacy notice (build/legal.ts). */
export const COUNTED =
  'Combien de voyageurs passent chaque étape jusqu’à la première leçon, reviennent ou partagent leur carte de survie, par quel lien ils sont arrivés et combien de réponses sont justes par type d’exercice, sans savoir qui tu es ni ce que tu traduis';

/** The count service the build names (VITE_COUNTS_URL); none leaves counting off. */
export const countsEndpoint = (url: unknown) => (typeof url === 'string' ? url.replace(/\/$/, '') : '');

/**
 * The link a traveller first came through, from its `utm_source`: '' when typed or found
 * elsewhere, `carte` for a shared survival card, `page` for a page beside the app (build/pages.ts).
 */
const SOURCES = ['', 'carte', 'page'] as const;
export type Source = (typeof SOURCES)[number];

export const sourceOf = (value: unknown): Source => (SOURCES.includes(value as Source) ? (value as Source) : '');

/** Sessions finished before the first departure, as a range: no exact number leaves the phone. */
const SESSION_RANGES = ['0', '1', '2-4', '5-9', '10+'] as const;

export interface Count {
  name: CountName;
  /** The traveller's first day, so a return joins the day they started. */
  day: string;
  /** A session range for « departure », a first step for « step », '' otherwise. */
  value: string;
  source: Source;
}

export const sessionRange = (n: number): string => (n >= 10 ? '10+' : n >= 5 ? '5-9' : n >= 2 ? '2-4' : String(n));

/** Four travellers on one phone, each with every count due at once, and every first step. */
const MAX_COUNTS = 4 * COUNT_NAMES.length + FIRST_STEPS.length;
/** A trip can be planned a year ahead, and its departure counted then. */
const MAX_AGE_DAYS = 400;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The counts in a request body, none when it only carries answers, or null when anything in it is not one. */
export function asCounts(body: unknown, today: string): Count[] | null {
  if (!body || typeof body !== 'object') return null;
  const list = (body as { counts?: unknown }).counts ?? [];
  if (!Array.isArray(list) || list.length > MAX_COUNTS) return null;
  const counts: Count[] = [];
  for (const raw of list) {
    const { name, day, value, source } = (raw ?? {}) as Record<string, unknown>;
    if (!COUNT_NAMES.includes(name as CountName) || typeof day !== 'string' || !DAY.test(day)) return null;
    if (!SOURCES.includes(source as Source)) return null;
    const age = (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${day}T12:00:00Z`)) / 86_400_000;
    // A day ahead: the phone counts in its own time zone.
    if (!(age >= -1 && age <= MAX_AGE_DAYS)) return null;
    const ranges: readonly unknown[] = name === 'departure' ? SESSION_RANGES : name === 'step' ? FIRST_STEPS : [''];
    if (!ranges.includes(value)) return null;
    counts.push({ name: name as CountName, day, value: value as string, source: source as Source });
  }
  return counts;
}

/**
 * Answers per exercise kind since the last report: how many, how many right, and how many the
 * session expected right (each kind's ease times the phrase's predicted recall, engine/session.ts).
 * Summed on the phone, never per phrase or sentence, they check the 85 % aim and each kind's ease
 * (docs/LEARNING.md).
 */
export type Tally = Partial<Record<Kind, [answered: number, right: number, expected: number]>>;

/** Far more than a traveller answers between two reports: past it, a tally waits or is not one. */
export const MAX_ANSWERS = 8000;

const whole = (x: unknown, max: number): x is number =>
  Number.isInteger(x) && (x as number) >= 0 && (x as number) <= max;

/** The tally in a stored value or a report, without what is not one. */
export function asTally(value: unknown): Tally {
  const tally: Tally = {};
  if (!value || typeof value !== 'object') return tally;
  for (const kind of GRADED) {
    const entry: unknown = (value as Record<string, unknown>)[kind];
    if (!Array.isArray(entry) || entry.length !== 3) continue;
    const [n, ok, expected] = entry as [unknown, unknown, unknown];
    if (
      whole(n, MAX_ANSWERS) &&
      n >= 1 &&
      whole(ok, n) &&
      typeof expected === 'number' &&
      expected >= 0 &&
      expected <= n
    )
      tally[kind] = [n, ok, expected];
  }
  return tally;
}

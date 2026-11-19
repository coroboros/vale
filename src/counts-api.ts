/**
 * The anonymous counts behind the decision figures (RUNBOOK A2), shared by the app and the Worker.
 * A count says what happened and on which first day, never who: no identifier, no sentence. The
 * CNIL exempts such audience measurement from consent when it only produces anonymous statistics
 * for the publisher and people are told (cnil.fr, « Cookies : solutions pour les outils de mesure
 * d’audience », 4 July 2025).
 */
export const COUNT_NAMES = ['new', 'day1', 'day7', 'installed', 'departure'] as const;
export type CountName = (typeof COUNT_NAMES)[number];

/** Sessions finished before the first departure, as a range: no exact number leaves the phone. */
const SESSION_RANGES = ['0', '1', '2-4', '5-9', '10+'] as const;

export interface Count {
  name: CountName;
  /** The traveller's first day, so a return joins the day they started. */
  day: string;
  /** A session range for « departure », '' otherwise. */
  value: string;
}

export const sessionRange = (n: number): string => (n >= 10 ? '10+' : n >= 5 ? '5-9' : n >= 2 ? '2-4' : String(n));

/** Four travellers on one phone, each with every count due at once. */
const MAX_COUNTS = 4 * COUNT_NAMES.length;
/** A trip can be planned a year ahead, and its departure counted then. */
const MAX_AGE_DAYS = 400;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The counts in a request body, or null when anything in it is not one. */
export function asCounts(body: unknown, today: string): Count[] | null {
  const list = (body as { counts?: unknown } | null)?.counts;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_COUNTS) return null;
  const counts: Count[] = [];
  for (const raw of list) {
    const { name, day, value } = (raw ?? {}) as Record<string, unknown>;
    if (!COUNT_NAMES.includes(name as CountName) || typeof day !== 'string' || !DAY.test(day)) return null;
    const age = (Date.parse(`${today}T12:00:00Z`) - Date.parse(`${day}T12:00:00Z`)) / 86_400_000;
    // A day ahead: the phone counts in its own time zone.
    if (!(age >= -1 && age <= MAX_AGE_DAYS)) return null;
    const ranges: readonly unknown[] = name === 'departure' ? SESSION_RANGES : [''];
    if (!ranges.includes(value)) return null;
    counts.push({ name: name as CountName, day, value: value as string });
  }
  return counts;
}

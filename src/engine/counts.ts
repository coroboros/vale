import {
  COUNT_NAMES,
  type Count,
  type CountName,
  FIRST_STEPS,
  MAX_ANSWERS,
  sessionRange,
  type Tally,
} from '../counts-api';
import type { DB, Profile, ProfileData } from '../state/schema';
import { daysBetween, shiftDay } from './progress';

/** Active means a finished session: stricter than the app opens that retention benchmarks count. */
const active = (data: ProfileData, day: string) => (data.days[day]?.sessions ?? 0) > 0;

const sessionsBetween = (data: ProfileData, from: string, to: string) =>
  Object.entries(data.days).reduce((n, [day, log]) => (day >= from && day < to ? n + log.sessions : n), 0);

export const inFirstWeek = (p: Profile, today: string) => p.since !== '' && daysBetween(p.since, today) <= 7;

/** What this traveller can add to the counts today and has not yet: worked out from the day log. */
export function dueCounts(p: Profile, data: ProfileData, today: string): Count[] {
  if (!p.since) return [];
  const age = daysBetween(p.since, today);
  const departure = p.trips
    .map(t => t.date)
    .filter(date => date > p.since)
    .sort()[0];
  const due: [CountName, boolean, string][] = [
    ['new', true, ''],
    ['day1', age >= 1 && active(data, shiftDay(p.since, 1)), ''],
    ['day7', age >= 7 && active(data, shiftDay(p.since, 7)), ''],
    ['installed', data.counts.installed, ''],
    ['shared', data.counts.shared, ''],
    ['departure', !!departure && departure <= today, sessionRange(sessionsBetween(data, p.since, departure ?? ''))],
  ];
  return due
    .filter(([name, now]) => now && !data.counts.sent.includes(name))
    .map(([name, , value]) => ({ name, day: p.since, value, source: data.counts.source }));
}

/** Switched off: nothing this traveller has done so far will ever be counted. */
export function closeCounts(data: ProfileData): void {
  data.counts.sent = [...COUNT_NAMES];
  data.counts.answers = {};
}

const entries = (tally: Tally) => Object.entries(tally) as [keyof Tally, [number, number, number]][];

/** Adds answers to a tally, unless a kind would pass what one report may carry: they wait. */
export function addTally(into: Tally, from: Tally): boolean {
  if (entries(from).some(([kind, [n]]) => (into[kind]?.[0] ?? 0) + n > MAX_ANSWERS)) return false;
  for (const [kind, [n, ok, expected]] of entries(from)) {
    const [n0, ok0, expected0] = into[kind] ?? [0, 0, 0];
    into[kind] = [n0 + n, ok0 + ok, expected0 + expected];
  }
  return true;
}

/** Takes off what a report carried, keeping the answers given while it travelled. */
export function takeTally(from: Tally, sent: Tally): void {
  for (const [kind, [n, ok, expected]] of entries(sent)) {
    const [n0, ok0, expected0] = from[kind] ?? [0, 0, 0];
    if (n0 - n <= 0) delete from[kind];
    else from[kind] = [n0 - n, Math.max(0, ok0 - ok), Math.max(0, expected0 - expected)];
  }
}

/** The first steps this phone reached and has not counted yet. */
export const dueSteps = (funnel: DB['funnel']): Count[] =>
  funnel.reached
    .filter(step => !funnel.sent.includes(step))
    .map(value => ({ name: 'step', day: funnel.day, value, source: funnel.source }));

/** Switched off: no first step of this phone will ever be counted. */
export function closeSteps(funnel: DB['funnel']): void {
  funnel.sent = [...FIRST_STEPS];
}

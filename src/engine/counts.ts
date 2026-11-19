import { COUNT_NAMES, type Count, type CountName, sessionRange } from '../counts-api';
import type { Profile, ProfileData } from '../state/schema';
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
    ['departure', !!departure && departure <= today, sessionRange(sessionsBetween(data, p.since, departure ?? ''))],
  ];
  return due
    .filter(([name, now]) => now && !data.counts.sent.includes(name))
    .map(([name, , value]) => ({ name, day: p.since, value }));
}

/** Switched off: nothing this traveller has done so far will ever be counted. */
export function closeCounts(data: ProfileData): void {
  data.counts.sent = [...COUNT_NAMES];
}

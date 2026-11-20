import { describe, expect, it } from 'vitest';
import { asCounts, asTally, type Count, MAX_ANSWERS, sessionRange } from '../../src/counts-api';
import {
  addTally,
  closeCounts,
  closeSteps,
  dueCounts,
  dueSteps,
  inFirstWeek,
  takeTally,
} from '../../src/engine/counts';
import { blankData, blankDay, blankDB, blankTrip, type Profile, type ProfileData } from '../../src/state/schema';

const traveller = (since: string, date = ''): Profile => ({
  id: 'p',
  name: 'Léa',
  gender: 'f',
  color: '#1E5FD0',
  trips: [{ ...blankTrip('es', 'a'), date }],
  trip: 'a',
  goal: 40,
  cue: '',
  since,
});
const studied = (data: ProfileData, day: string, sessions = 1) => {
  data.days[day] = { ...blankDay(), sessions };
};
const names = (counts: Count[]) => counts.map(c => c.name);

describe('anonymous counts', () => {
  it('count a new traveller on their first day, once', () => {
    const data = blankData();
    expect(dueCounts(traveller('2026-12-01'), data, '2026-12-01')).toEqual([
      { name: 'new', day: '2026-12-01', value: '', source: '' },
    ]);
    data.counts.sent.push('new');
    expect(dueCounts(traveller('2026-12-01'), data, '2026-12-01')).toEqual([]);
  });

  it('count a return on day 1 and day 7 only when a session was finished that day, even reported late', () => {
    const p = traveller('2026-12-01');
    const data = blankData();
    data.counts.sent.push('new');
    studied(data, '2026-12-02');
    expect(names(dueCounts(p, data, '2026-12-02'))).toEqual(['day1']);
    expect(names(dueCounts(p, data, '2026-12-05'))).toEqual(['day1']);
    studied(data, '2026-12-07');
    expect(names(dueCounts(p, data, '2026-12-09'))).toEqual(['day1']);
    studied(data, '2026-12-08');
    expect(dueCounts(p, data, '2026-12-08')).toEqual([
      { name: 'day1', day: '2026-12-01', value: '', source: '' },
      { name: 'day7', day: '2026-12-01', value: '', source: '' },
    ]);
  });

  it('count the sessions before the first departure as a range, once the day has come', () => {
    const p = traveller('2026-12-01', '2026-12-20');
    const data = blankData();
    data.counts.sent.push('new');
    studied(data, '2026-12-01', 2);
    studied(data, '2026-12-10');
    studied(data, '2026-12-20', 3);
    expect(dueCounts(p, data, '2026-12-19')).toEqual([]);
    expect(dueCounts(p, data, '2026-12-20')).toEqual([
      { name: 'departure', day: '2026-12-01', value: '2-4', source: '' },
    ]);
    expect(names(dueCounts(traveller('2026-12-01', '2026-11-20'), data, '2026-12-20'))).toEqual([]);
  });

  it('count an install seen in the first week', () => {
    const p = traveller('2026-12-01');
    expect([
      inFirstWeek(p, '2026-12-08'),
      inFirstWeek(p, '2026-12-09'),
      inFirstWeek(traveller(''), '2026-12-01'),
    ]).toEqual([true, false, false]);
    const data = blankData();
    data.counts = { ...data.counts, sent: ['new'], installed: true };
    expect(names(dueCounts(p, data, '2026-12-03'))).toEqual(['installed']);
  });

  it('count a shared card once, and say which link every count of a traveller came through', () => {
    const data = blankData();
    data.counts = { ...data.counts, sent: ['new'], shared: true, source: 'carte' };
    expect(dueCounts(traveller('2026-12-01'), data, '2026-12-04')).toEqual([
      { name: 'shared', day: '2026-12-01', value: '', source: 'carte' },
    ]);
    data.counts.sent.push('shared');
    expect(dueCounts(traveller('2026-12-01'), data, '2026-12-04')).toEqual([]);
  });

  it('say nothing of older profiles, or once switched off', () => {
    const data = blankData();
    studied(data, '2026-12-02');
    expect(dueCounts(traveller(''), data, '2026-12-02')).toEqual([]);
    closeCounts(data);
    expect(dueCounts(traveller('2026-12-01', '2026-12-02'), data, '2026-12-09')).toEqual([]);
  });

  it('count each first step a phone reached once, from its first day and link, and none once switched off', () => {
    const { funnel } = blankDB();
    Object.assign(funnel, {
      day: '2026-12-01',
      source: 'page',
      reached: ['destination', 'date'],
      sent: ['destination'],
    });
    expect(dueSteps(funnel)).toEqual([{ name: 'step', day: '2026-12-01', value: 'date', source: 'page' }]);
    closeSteps(funnel);
    funnel.reached.push('travellers');
    expect(dueSteps(funnel)).toEqual([]);
  });

  it('give sessions as ranges, never exact numbers', () => {
    expect([0, 1, 3, 7, 12].map(sessionRange)).toEqual(['0', '1', '2-4', '5-9', '10+']);
  });

  it('reach the service only as names, first days and ranges', () => {
    const today = '2026-12-10';
    const valid = [
      { name: 'new', day: '2026-12-11', value: '', source: 'page' },
      { name: 'shared', day: '2026-12-10', value: '', source: 'carte' },
      { name: 'departure', day: '2026-01-01', value: '5-9', source: '' },
      { name: 'step', day: '2026-12-10', value: 'lesson-done', source: '' },
    ];
    expect(asCounts({ counts: valid }, today)).toEqual(valid);
    for (const counts of [
      [{ name: 'user', day: today, value: '', source: '' }],
      [{ name: 'new', day: '10/12/2026', value: '', source: '' }],
      [{ name: 'new', day: '2026-12-12', value: '', source: '' }],
      [{ name: 'new', day: '2025-11-01', value: '', source: '' }],
      [{ name: 'new', day: today, value: 'Léa', source: '' }],
      [{ name: 'new', day: today, value: '', source: 'newsletter' }],
      [{ name: 'new', day: today, value: '' }],
      [{ name: 'departure', day: today, value: '3', source: '' }],
      [{ name: 'step', day: today, value: 'Léa', source: '' }],
      [{ name: 'step', day: today, value: '', source: '' }],
      Array.from({ length: 40 }, () => ({ name: 'new', day: today, value: '', source: '' })),
    ])
      expect(asCounts({ counts }, today), JSON.stringify(counts).slice(0, 60)).toBeNull();
    expect(asCounts('new', today)).toBeNull();
    // A report may carry answers alone.
    expect(asCounts({ counts: [], answers: {} }, today)).toEqual([]);
    expect(asCounts({ answers: {} }, today)).toEqual([]);
  });

  it('tally answers per exercise kind only, as whole numbers within bounds', () => {
    expect(asTally({ reco: [5, 4, 4.2], speak: [2, 1, 1.5] })).toEqual({ reco: [5, 4, 4.2], speak: [2, 1, 1.5] });
    for (const bad of [
      { guess: [1, 1, 1] },
      { phrase: [1, 1, 1] },
      { reco: [0, 0, 0] },
      { reco: [2, 3, 1] },
      { reco: [2, 1, 3] },
      { reco: [1.5, 1, 1] },
      { reco: ['5', 4, 4] },
      { reco: [5, 4] },
      { reco: [MAX_ANSWERS + 1, 1, 1] },
      'reco',
      null,
    ])
      expect(asTally(bad), JSON.stringify(bad)).toEqual({});
  });

  it('add answers until a report would be too full, and take off only what a report carried', () => {
    const pending = {};
    expect(addTally(pending, { reco: [3, 3, 2.7], dictation: [2, 1, 1.4] })).toBe(true);
    expect(addTally(pending, { reco: [2, 1, 1.8] })).toBe(true);
    expect(pending).toEqual({ reco: [5, 4, 4.5], dictation: [2, 1, 1.4] });
    expect(addTally(pending, { reco: [MAX_ANSWERS, 0, 0] })).toBe(false);
    expect(pending).toEqual({ reco: [5, 4, 4.5], dictation: [2, 1, 1.4] });
    // Sent the first two sessions; one more answer came while the report travelled.
    const sent = structuredClone(pending);
    addTally(pending, { reco: [1, 1, 0.9] });
    takeTally(pending, sent);
    expect(pending).toEqual({ reco: [1, 1, expect.closeTo(0.9)] });
    const data = blankData();
    data.counts.answers = { speak: [4, 3, 3.4] };
    closeCounts(data);
    expect(data.counts.answers).toEqual({});
  });
});

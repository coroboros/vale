import { beforeAll, describe, expect, it } from 'vitest';
import { courseById, currencyOf, indexOf, itemKey } from '../../src/content';
import { STORY } from '../../src/content/story';
import type { Unit } from '../../src/content/types';
import { grade, normalize, tokens } from '../../src/engine/grade';
import { initMemory, review } from '../../src/engine/memory';
import { pricePuzzle } from '../../src/engine/prices';
import {
  arrivalTime,
  dailyQuests,
  dayKey,
  goalTitle,
  lessonKey,
  logSession,
  newStamps,
  postcard,
  readiness,
  repairOffer,
  shells,
  shiftDay,
  spendJokers,
  streak,
  teamWeek,
  weekStart,
  welcomeXp,
} from '../../src/engine/progress';
import { checkSpeech, type SpeechCheck } from '../../src/engine/pronunciation';
import { seeded } from '../../src/engine/random';
import { DAY_MS } from '../../src/engine/time';
import { migrateV3 } from '../../src/state/migrate';
import {
  blankData,
  blankDay,
  blankTrip,
  orderTrips,
  QUIET_MS,
  quietActive,
  sanitize,
  tripOf,
} from '../../src/state/schema';
import { searchCourse, searchHistory } from '../../src/translate';

beforeAll(initMemory);

const es = courseById('es');
const NOW = Date.parse('2026-11-16T10:00:00');
const today = dayKey(NOW);

describe('grading', () => {
  it('forgives case, punctuation and accents, catches small typos, rejects other answers', () => {
    expect(normalize('¿Dónde está el baño?')).toBe('dónde está el baño');
    expect(grade('donde esta el baño', ['¿Dónde está el baño?']).verdict).toBe('accents');
    expect(grade('¿Dónde está el baño?', ['¿Dónde está el baño?']).verdict).toBe('exact');
    expect(grade('donde esta el bano', ['¿Dónde está el baño?']).verdict).toBe('accents');
    expect(grade('dondee está el baño', ['¿Dónde está el baño?']).verdict).toBe('typo');
    expect(grade('la cuenta', ['¿Dónde está el baño?']).verdict).toBe('wrong');
    expect(grade('si', ['no']).verdict).toBe('wrong');
    expect(tokens('¡Hola, buenos días!')).toEqual(['Hola', 'buenos', 'días']);
  });
});

describe('pronunciation check', () => {
  const spell = es.numbers.spell;
  const marks = (c: SpeechCheck) => c.words.filter(w => w.mark).map(w => `${w.word}:${w.mark}`);

  it('marks every word heard, whatever the case, accents and punctuation', () => {
    const c = checkSpeech('¿Dónde está el baño?', ['DONDE ESTA EL BANO'], spell);
    expect(c).toMatchObject({ all: true, ok: true, heard: 'DONDE ESTA EL BANO' });
    expect(c.words[0]).toMatchObject({ pre: '¿', word: 'Dónde', mark: 'heard' });
    expect(c.words.at(-1)).toMatchObject({ word: 'baño', post: '?', mark: 'heard' });
  });

  it('flags a word heard as another, and lets one miss in four pass', () => {
    const c = checkSpeech('La cuenta, por favor.', ['la cuento por favor'], spell);
    expect(marks(c)).toEqual(['La:heard', 'cuenta:missed', 'por:heard', 'favor:heard']);
    expect(c).toMatchObject({ all: false, ok: true });
    expect(checkSpeech('Una mesa para dos', ['una misa para tos'], spell).ok).toBe(false);
    expect(checkSpeech('Por favor', ['por'], spell).ok).toBe(false);
  });

  it('reads digits and currency signs the way the phrase spells them', () => {
    expect(checkSpeech('Son cuatro euros con veinte.', ['son 4 € con 20'], spell).all).toBe(true);
    expect(checkSpeech('That’s four pounds twenty.', ["That's £4.20"], courseById('en').numbers.spell).all).toBe(true);
    expect(checkSpeech('Cien', ['100'], spell).all).toBe(true);
    expect(checkSpeech('Cento', ['100'], courseById('it').numbers.spell).all).toBe(true);
  });

  it('keeps the transcript that matches best', () => {
    const c = checkSpeech('¿Dónde está el baño?', ['dónde es el baño', 'dónde está el baño'], spell);
    expect(c).toMatchObject({ all: true, heard: 'dónde está el baño' });
  });

  it('takes either side of a pair, and an unsaid trailing word, as said', () => {
    const pair = checkSpeech('Soy francés / francesa', ['soy francesa'], spell);
    expect(marks(pair)).toEqual(['Soy:heard', 'francesa:heard']);
    expect(pair.all).toBe(true);
    expect(marks(checkSpeech('Soy francés / francesa', ['soy'], spell))).toEqual([
      'Soy:heard',
      'francés:missed',
      'francesa:missed',
    ]);
    expect(checkSpeech('Soy alérgico / alérgica a…', ['soy alérgica al marisco'], spell).all).toBe(true);
  });

  it('treats an elision as one word, whatever the apostrophe', () => {
    expect(checkSpeech('Dov’è il bagno?', ["dov'è il bagno"], courseById('it').numbers.spell).all).toBe(true);
  });
});

describe('streak, jokers and repair', () => {
  const active = (data: ReturnType<typeof blankData>, ...days: string[]) => {
    for (const d of days) data.days[d] = { ...blankDay(), xp: 20, sessions: 1 };
  };

  it('counts consecutive days ending today or yesterday', () => {
    const data = blankData();
    active(data, shiftDay(today, -2), shiftDay(today, -1));
    expect(streak(data, today)).toEqual({ days: 2, today: false });
    active(data, today);
    expect(streak(data, today)).toEqual({ days: 3, today: true });
  });

  it('spends a joker on a missed day', () => {
    const data = blankData();
    data.jokers = 1;
    active(data, shiftDay(today, -3), shiftDay(today, -2));
    spendJokers(data, today);
    expect(data.jokers).toBe(0);
    expect(streak(data, today).days).toBe(3);
  });

  it('offers a repair after one missed day and applies it at twice the goal', () => {
    const data = blankData();
    active(data, shiftDay(today, -4), shiftDay(today, -3), shiftDay(today, -2));
    expect(repairOffer(data, today, 20)?.streak).toBe(3);
    logSession(data, NOW, { xp: 25, sessions: 1 }, 20);
    expect(streak(data, today).days).toBe(1);
    logSession(data, NOW, { xp: 20, sessions: 1 }, 20);
    expect(streak(data, today).days).toBe(5);
  });

  it('earns a joker every seven days', () => {
    const data = blankData();
    active(data, ...Array.from({ length: 6 }, (_, i) => shiftDay(today, -6 + i)));
    logSession(data, NOW, { xp: 20, sessions: 1 }, 20);
    expect(data.jokers).toBe(1);
  });
});

describe('the daily goal', () => {
  it('starts a fifth done for travellers coming out of onboarding', () => {
    expect([20, 40, 60].map(welcomeXp)).toEqual([4, 8, 12]);
  });

  it('names XP shells, singular up to one as French does', () => {
    expect([0, 1, 2, 40].map(shells)).toEqual(['0 coquillage', '1 coquillage', '2 coquillages', '40 coquillages']);
  });

  it('counts its last few XP in phrases', () => {
    expect([0, 34, 35, 38, 39, 40, 45].map(xp => goalTitle(xp, 40))).toEqual([
      'Encore 40 coquillages aujourd’hui',
      'Encore 6 coquillages aujourd’hui',
      'Plus que 5 phrases pour ton objectif du jour',
      'Plus que 2 phrases pour ton objectif du jour',
      'Plus qu’une phrase pour ton objectif du jour',
      'Objectif du jour atteint',
      'Objectif du jour atteint',
    ]);
  });
});

describe('Bernard’s trip', () => {
  it('comes in postcards: his arrival once a leg begins, one more with each step, the last when it is done', () => {
    const [first, table] = es.units as [Unit, Unit];
    const data = blankData();
    const learn = (lessonId: string, all = true) => {
      const items = es.lessons.find(l => l.id === lessonId)!.items;
      for (const i of all ? items : items.slice(0, 1))
        data.mem[itemKey('es', i.id)] = review(undefined, 'good', NOW, i.id);
    };
    const card = () => postcard(es, table, data, 'barcelone');
    expect(card()).toBe('');
    learn('bar', false);
    expect(card()).toBe(STORY.table![0]);
    data.scenes[lessonKey('es', 'cafe')] = NOW;
    expect(card()).toBe(STORY.table![1]);
    data.scenes[lessonKey('es', 'tapas')] = NOW;
    expect(card()).toBe(STORY.table![2]);
    learn('bar');
    learn('resto');
    data.lessons[lessonKey('es', 'review:table')] = NOW;
    expect(card()).toBe(STORY.table![3]);
    learn('base', false);
    expect(postcard(es, first, data, 'barcelone')).toMatch(/^Me voilà à Barcelone\s!/);
  });
});

describe('travellers on one phone', () => {
  it('play as a team over the week, from Monday, highest first', () => {
    expect(['2026-11-16', '2026-11-19', '2026-11-22'].map(weekStart)).toEqual([
      '2026-11-16',
      '2026-11-16',
      '2026-11-16',
    ]);
    const traveller = (id: string, goal: number) => ({
      ...sanitize({ profiles: [{ id, name: id }] }).profiles[0]!,
      goal,
    });
    const day = (xp: number) => ({ ...blankDay(), xp });
    const data = {
      lea: { ...blankData(), days: { '2026-11-15': day(90), '2026-11-17': day(30), '2026-11-19': day(25) } },
      sam: { ...blankData(), days: { '2026-11-18': day(70) } },
    };
    expect(teamWeek([traveller('lea', 40), traveller('sam', 20)], data, '2026-11-19')).toEqual({
      goal: 300,
      xp: 125,
      members: [
        { id: 'sam', name: 'sam', color: '#1E5FD0', xp: 70 },
        { id: 'lea', name: 'lea', color: '#1E5FD0', xp: 55 },
      ],
    });
  });
});

describe('quests, stamps and forecast', () => {
  it('gives three stable quests per profile and day', () => {
    const a = dailyQuests('p1', today, 40);
    expect(a).toHaveLength(3);
    expect(dailyQuests('p1', today, 40)).toEqual(a);
    expect(new Set(a.map(q => q.id)).size).toBe(3);
  });

  it('awards the first-session stamp once', () => {
    const data = blankData();
    logSession(data, NOW, { xp: 10, sessions: 1 }, 20);
    const ctx = { data, course: es, region: 'autre', today };
    expect(newStamps(ctx)).toContain('first');
    data.stamps.first = NOW;
    expect(newStamps(ctx)).not.toContain('first');
  });

  it('forecasts more retention after more reviews, and less further in time', () => {
    const index = indexOf(es);
    const data = blankData();
    const key = itemKey('es', es.lessons[0]!.items[0]!.id);
    data.mem[key] = review(undefined, 'good', NOW, key);
    const soon = readiness(index, data, NOW + 2 * DAY_MS).score;
    const later = readiness(index, data, NOW + 30 * DAY_MS).score;
    expect(soon).toBeGreaterThan(later);
    data.mem[key] = review(data.mem[key], 'good', NOW + 3 * DAY_MS, key);
    expect(readiness(index, data, NOW + 30 * DAY_MS).score).toBeGreaterThan(later);
    expect(readiness(index, data, NOW).learned).toBe(1);
  });

  it('forecasts for noon on the departure day, a week ahead without a date, and for now once there', () => {
    const now = Date.parse('2026-11-18T09:00:00');
    expect(arrivalTime('2026-12-20', now)).toBe(Date.parse('2026-12-20T12:00:00'));
    expect(arrivalTime('', now)).toBe(now + 7 * DAY_MS);
    expect(arrivalTime('2026-11-18', now)).toBe(Date.parse('2026-11-18T12:00:00'));
    expect(arrivalTime('2026-10-01', now)).toBe(now);
  });
});

describe('prices by ear', () => {
  it('offers four distinct prices including the right one', () => {
    const rng = seeded(11);
    for (let i = 0; i < 50; i++) {
      const p = pricePuzzle(es, '€', rng);
      expect(p.options).toHaveLength(4);
      expect(new Set(p.options).size).toBe(4);
      expect(p.options).toContain(p.answer);
      expect(p.spoken).not.toMatch(/undefined/);
    }
  });

  it('says and shows prices in each country’s way and currency', () => {
    const pt = courseById('pt');
    const en = courseById('en');
    expect(pt.numbers.sayPrice(4, 20, false, '€')).toBe('São quatro euros e vinte.');
    expect(pt.numbers.sayPrice(4, 20, true, '€')).toBe('Quatro e vinte.');
    expect(pt.numbers.spell(16)).toBe('dezasseis');
    expect(en.numbers.sayPrice(4, 20, false, '£')).toBe('That’s four pounds twenty.');
    expect(en.numbers.spell(21)).toBe('twenty-one');
    expect(pricePuzzle(en, '£', seeded(3)).answer).toMatch(/^\d+,\d\d £$/);
    expect(pricePuzzle(pt, '€', seeded(3)).answer).toMatch(/^\d+,\d\d €$/);
  });

  it('pays in the destination’s money: euro in Dublin, dollars in New York', () => {
    const en = courseById('en');
    expect([currencyOf(en, 'londres'), currencyOf(en, 'dublin'), currencyOf(en, 'newyork')]).toEqual(['£', '€', '$']);
    expect(en.numbers.sayPrice(4, 20, false, '€')).toBe('That’s four euro twenty.');
    expect(en.numbers.sayPrice(4, 20, false, '$')).toBe('That’s four dollars and twenty cents.');
    expect(en.numbers.sayPrice(1, 0, false, '$')).toBe('That’s one dollar.');
    expect(en.numbers.sayPrice(4, 20, true, '$')).toBe('Four twenty.');
    expect(pricePuzzle(en, '$', seeded(3)).answer).toMatch(/^\d+,\d\d \$$/);
  });
});

describe('survival card sentences', () => {
  it('contract the preposition and agree with the speaker', () => {
    const pt = courseById('pt');
    expect(pt.say.allergy(['o marisco', 'os amendoins'], 'f')).toBe(
      'Sou alérgica ao marisco e aos amendoins. É muito importante.',
    );
    expect(courseById('en').say.allergy(['tree nuts', 'shellfish'], 'm')).toBe(
      'I’m allergic to tree nuts and shellfish. It’s very important.',
    );
  });
});

describe('phrase search', () => {
  it('finds course phrases from French words, accents optional', () => {
    const results = searchCourse('addition', indexOf(es));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => /cuenta/i.test(r.t))).toBe(true);
    expect(searchCourse('ou sont les toilettes', indexOf(es)).length).toBeGreaterThan(0);
  });

  it('filters the translation history', () => {
    const h = [
      {
        id: 'a',
        course: 'es',
        fr: 'un late checkout',
        t: 'salir más tarde',
        ph: '',
        note: '',
        alternatives: [],
        at: 1,
        saved: false,
      },
      {
        id: 'b',
        course: 'es',
        fr: 'une chambre calme',
        t: 'una habitación tranquila',
        ph: '',
        note: '',
        alternatives: [],
        at: 2,
        saved: true,
      },
    ];
    expect(searchHistory('checkout', h).map(t => t.id)).toEqual(['a']);
    expect(searchHistory('', h)).toHaveLength(2);
  });
});

describe('saved data', () => {
  it('repairs damaged records instead of failing', () => {
    expect(sanitize(null).profiles).toEqual([]);
    const db = sanitize({
      onboarded: true,
      profiles: [{ id: 'x', name: 'Léa', goal: 999, trip: 'demain' }],
      data: { x: { jokers: 9, counts: { answers: { reco: [3, 2, 2.5], guess: [1, 1, 1], speak: [1, 4, 1] } } } },
    });
    expect(db.profiles[0]).toMatchObject({
      goal: 40,
      trips: [{ id: 'es', course: 'es', region: 'autre', date: '', hotel: '', address: '' }],
      trip: 'es',
      gender: 'm',
    });
    expect(db.data.x!.jokers).toBe(2);
    expect(db.data.x!.mem).toEqual({});
    // Answers waiting to be counted keep the graded kinds with sound numbers only.
    expect(db.data.x!.counts.answers).toEqual({ reco: [3, 2, 2.5] });
    expect(sanitize({ profiles: [{ id: 'y', name: 'Sam' }] }).data.y!.counts.answers).toEqual({});
    // The streak shows unless switched off, and a damaged choice reads as on.
    expect(db.settings.showStreak).toBe(true);
    expect(sanitize({ settings: { showStreak: 'non' } }).settings.showStreak).toBe(true);
    expect(sanitize({ settings: { showStreak: false } }).settings.showStreak).toBe(false);
    // The first steps keep the known ones only, in their order, and a first day that is a day.
    expect(
      sanitize({ funnel: { day: 'hier', source: 'tv', reached: ['date', 'welcome', 'date', 'menu'], sent: 7 } }).funnel,
    ).toEqual({ day: '', source: '', reached: ['welcome', 'date'], sent: [] });
  });

  it('turns both older trip formats into the list, keeping the language in use in focus', () => {
    const single = sanitize({ profiles: [{ id: 'x', name: 'Léa', course: 'it', region: 'roma', trip: '2027-04-02' }] });
    expect(single.profiles[0]!.trips).toEqual([
      { id: 'it', course: 'it', region: 'roma', date: '2027-04-02', hotel: '', address: '' },
    ]);
    expect(tripOf(single.profiles[0]!)).toMatchObject({ course: 'it', region: 'roma' });
    const byLanguage = sanitize({
      profiles: [
        {
          id: 'y',
          name: 'Tom',
          course: 'it',
          trips: { es: { region: 'madrid', date: 'soon' }, it: { region: 'venezia', date: '2027-04-02' }, pt: 7 },
        },
      ],
    });
    const p = byLanguage.profiles[0]!;
    expect(p.trips.map(t => [t.id, t.course, t.region, t.date])).toEqual([
      ['es', 'es', 'madrid', ''],
      ['it', 'it', 'venezia', '2027-04-02'],
    ]);
    expect(tripOf(p).course).toBe('it');
  });

  it('moves the card’s single hotel and address to the trip in focus, once', () => {
    const raw = {
      profiles: [{ id: 'x', name: 'Léa', course: 'it', trips: { es: { region: 'madrid' }, it: { region: 'roma' } } }],
      data: { x: { card: { hotel: 'Sole', address: 'Via Roma 1', allergens: ['nuts'], diets: 7 } } },
    };
    const db = sanitize(raw);
    expect(db.profiles[0]!.trips.map(t => t.hotel)).toEqual(['', 'Sole']);
    expect(tripOf(db.profiles[0]!).address).toBe('Via Roma 1');
    expect(db.data.x!.card).toEqual({ allergens: ['nuts'], diets: [] });
    expect(sanitize(db)).toEqual(db);
  });

  it('keeps several trips, even in one language, and repairs a focus that points nowhere', () => {
    const trips = [
      { id: 'a', course: 'es', region: 'barcelone', date: '2026-12-20', hotel: 'Sol', address: '' },
      { id: 'b', course: 'es', region: 'andalousie', date: '2027-03-01', hotel: '', address: '' },
    ];
    const db = sanitize({ profiles: [{ id: 'x', name: 'Léa', trips, trip: 'gone' }] });
    expect(db.profiles[0]!.trips).toEqual(trips);
    expect(db.profiles[0]!.trip).toBe('a');
    const twice = sanitize({ profiles: [{ id: 'x', name: 'Léa', trips: [...trips, trips[0]], trip: 'a' }] });
    expect(new Set(twice.profiles[0]!.trips.map(t => t.id)).size).toBe(3);
  });

  it('lists upcoming trips first, the soonest on top, then undated ones, then past ones', () => {
    const t = (id: string, date: string) => ({ ...blankTrip('es', id), date });
    const order = orderTrips(
      [t('past', '2026-10-01'), t('later', '2027-03-01'), t('undated', ''), t('soon', '2026-12-20')],
      '2026-11-18',
    );
    expect(order.map(x => x.id)).toEqual(['soon', 'later', 'undated', 'past']);
  });

  it('keeps a traveller’s first day and what they counted, and counts nothing for older profiles', () => {
    const db = sanitize({
      profiles: [
        { id: 'x', name: 'Léa', since: '2026-12-01' },
        { id: 'y', name: 'Sam', since: 'hier' },
      ],
      data: { x: { counts: { sent: ['new', 'oops'], installed: 'yes', shared: true, source: 'carte' } } },
    });
    expect(db.profiles.map(p => p.since)).toEqual(['2026-12-01', '']);
    expect(db.data.x!.counts).toEqual({ sent: ['new'], installed: false, shared: true, source: 'carte', answers: {} });
    expect(db.data.y!.counts).toEqual({ sent: [], installed: false, shared: false, source: '', answers: {} });
    expect(
      sanitize({ profiles: [{ id: 'z', name: 'Zoé' }], data: { z: { counts: { source: 'spam' } } } }).data.z!.counts
        .source,
    ).toBe('');
    expect(db.settings.shareCounts).toBe(true);
  });

  it('fills in the counters a day log lacks and drops what is not one', () => {
    const db = sanitize({
      profiles: [{ id: 'x', name: 'Léa' }],
      data: { x: { days: { '2026-12-01': { xp: 12, sessions: 1 }, '2026-12-02': 'oops' } } },
    });
    expect(db.data.x!.days).toEqual({ '2026-12-01': { ...blankDay(), xp: 12, sessions: 1 } });
  });

  it('fills new settings in, keeps valid ones and drops wrong or unknown ones', () => {
    const db = sanitize({ settings: { autoplay: false, sfx: 'no', quietUntil: '12', legacy: 1 } });
    expect(db.settings).toMatchObject({ autoplay: false, sfx: true, quiet: false, quietUntil: 0, speechCheck: 'ask' });
    expect(db.settings).not.toHaveProperty('legacy');
    expect(sanitize({ settings: { speechCheck: 'on' } }).settings.speechCheck).toBe('on');
    expect(sanitize({ settings: { speechCheck: 'yes' } }).settings.speechCheck).toBe('ask');
  });

  it('quiet mode lasts until switched off, or for an hour from a session', () => {
    const s = sanitize(null).settings;
    expect(quietActive(s, NOW)).toBe(false);
    expect(quietActive({ ...s, quiet: true }, NOW)).toBe(true);
    const hour = { ...s, quietUntil: NOW + QUIET_MS };
    expect(quietActive(hour, NOW + QUIET_MS - 1)).toBe(true);
    expect(quietActive(hour, NOW + QUIET_MS)).toBe(false);
  });

  it('migrates a v3 record without losing progress', () => {
    const v3 = {
      v: 3,
      ob: true,
      profiles: [
        { id: 'p1', name: 'Adrien', g: 'o', color: '#2F6BFF' },
        { id: 'p2', name: 'Léa', g: 'a', color: '#E8458B' },
      ],
      active: 'p2',
      dest: 'barcelone',
      date: '2026-12-01',
      goal: 60,
      set: { auto: false, slow: true, ph: true, sfx: false },
      data: {
        p1: {
          p: { 'base.0': { l: 4, t: NOW - DAY_MS }, 'base.1': { l: 1, t: NOW } },
          sc: { cafe: true },
          days: { [today]: 35 },
          miss: { 'base.1': 2 },
          favs: { 'base.0': true },
          st: { rec: 7, prices: 3 },
          card: { hotel: 'Sol', addr: 'Calle Mayor 1', allergens: ['marisco'], diets: ['veg'] },
        },
      },
    };
    const db = migrateV3(v3, NOW)!;
    expect(db.active).toBe('p2');
    expect(db.profiles.map(p => p.gender)).toEqual(['m', 'f']);
    expect(db.profiles[0]).toMatchObject({
      trips: [
        { id: 'es', course: 'es', region: 'barcelone', date: '2026-12-01', hotel: 'Sol', address: 'Calle Mayor 1' },
      ],
      trip: 'es',
      goal: 60,
    });
    expect(db.settings).toMatchObject({ autoplay: false, slow: true, sfx: false });
    const p1 = db.data.p1!;
    expect(Object.keys(p1.mem).sort()).toEqual(['es:buenas', 'es:hola']);
    expect(p1.mem['es:hola']!.reps).toBe(3);
    expect(p1.scenes['es:cafe']).toBe(NOW);
    expect(p1.days[today]!.xp).toBe(35);
    expect(p1.mistakes['es:buenas']).toBe(2);
    expect(p1.favorites).toEqual(['es:hola']);
    expect(p1.stats).toMatchObject({ spoken: 7, prices: 3 });
    expect(p1.card).toEqual({ allergens: ['marisco'], diets: ['veg'] });
    expect(db.data.p2).toBeDefined();
    expect(migrateV3({ v: 2 }, NOW)).toBeNull();
  });
});

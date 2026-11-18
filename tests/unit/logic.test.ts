import { beforeAll, describe, expect, it } from 'vitest';
import { courseById, indexOf, itemKey } from '../../src/content';
import { grade, normalize, tokens } from '../../src/engine/grade';
import { initMemory, review } from '../../src/engine/memory';
import { pricePuzzle } from '../../src/engine/prices';
import {
  dailyQuests,
  dayKey,
  logSession,
  newStamps,
  readiness,
  repairOffer,
  shiftDay,
  spendJokers,
  streak,
} from '../../src/engine/progress';
import { checkSpeech, type SpeechCheck } from '../../src/engine/pronunciation';
import { seeded } from '../../src/engine/random';
import { DAY_MS } from '../../src/engine/time';
import { migrateV3 } from '../../src/state/migrate';
import { blankData, blankDay, QUIET_MS, quietActive, sanitize } from '../../src/state/schema';
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

  it('reads digits and the euro sign the way the phrase spells them', () => {
    expect(checkSpeech('Son cuatro euros con veinte.', ['son 4 € con 20'], spell).all).toBe(true);
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
});

describe('prices by ear', () => {
  it('offers four distinct prices including the right one', () => {
    const rng = seeded(11);
    for (let i = 0; i < 50; i++) {
      const p = pricePuzzle(es, rng);
      expect(p.options).toHaveLength(4);
      expect(new Set(p.options).size).toBe(4);
      expect(p.options).toContain(p.answer);
      expect(p.spoken).not.toMatch(/undefined/);
    }
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
      data: { x: { jokers: 9 } },
    });
    expect(db.profiles[0]).toMatchObject({ goal: 40, trip: '', course: 'es', gender: 'm' });
    expect(db.data.x!.jokers).toBe(2);
    expect(db.data.x!.mem).toEqual({});
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
    expect(db.profiles[0]).toMatchObject({ region: 'barcelone', trip: '2026-12-01', goal: 60, course: 'es' });
    expect(db.settings).toMatchObject({ autoplay: false, slow: true, sfx: false });
    const p1 = db.data.p1!;
    expect(Object.keys(p1.mem).sort()).toEqual(['es:buenas', 'es:hola']);
    expect(p1.mem['es:hola']!.reps).toBe(3);
    expect(p1.scenes['es:cafe']).toBe(NOW);
    expect(p1.days[today]!.xp).toBe(35);
    expect(p1.mistakes['es:buenas']).toBe(2);
    expect(p1.favorites).toEqual(['es:hola']);
    expect(p1.stats).toMatchObject({ spoken: 7, prices: 3 });
    expect(p1.card).toEqual({ hotel: 'Sol', address: 'Calle Mayor 1', allergens: ['marisco'], diets: ['veg'] });
    expect(db.data.p2).toBeDefined();
    expect(migrateV3({ v: 2 }, NOW)).toBeNull();
  });
});

import { capitalize, confusableNumbers, FIRST_WORDS, firstAnswer, genderAO, joinList, phrase } from '../shared';
import type { Course } from '../types';
import { card, extras, gloss, lessons, regions, scenes, sounds, tips } from './it.data';

const UNITS = [
  'zero',
  'uno',
  'due',
  'tre',
  'quattro',
  'cinque',
  'sei',
  'sette',
  'otto',
  'nove',
  'dieci',
  'undici',
  'dodici',
  'tredici',
  'quattordici',
  'quindici',
  'sedici',
  'diciassette',
  'diciotto',
  'diciannove',
];
const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];

/**
 * Italian number words up to 99: the tens lose their vowel before uno/otto, tre takes an accent.
 */
function numberWords(n: number): string {
  if (n < 20) return UNITS[n]!;
  const tens = TENS[Math.floor(n / 10)]!;
  const unit = n % 10;
  if (!unit) return tens;
  const head = unit === 1 || unit === 8 ? tens.slice(0, -1) : tens;
  return head + (unit === 3 ? 'tré' : UNITS[unit]);
}

/** a + article → contracted preposition (a + il = al, a + le = alle…). */
const withA = (noun: string) =>
  noun.replace(
    /^(il|lo|la|i|gli|le) /,
    (_, article: string) => `${{ il: 'al', lo: 'allo', la: 'alla', i: 'ai', gli: 'agli', le: 'alle' }[article]} `,
  );

export const it: Course = {
  id: 'it',
  lang: 'it-IT',
  name: 'Italien',
  native: 'Italiano',
  hello: 'Ciao!',
  greet: name => `Ciao, ${name}!`,
  flag: 'it',
  phonetics:
    'La syllabe accentuée est en capitales. « tch » = c devant e ou i, « dj » = g devant e ou i, ' +
    '« ly » = gli, « ch » = sc devant e ou i, « ts » et « dz » = z. Une consonne doublée se tient un instant. ' +
    'Un n ou un m doublé après une voyelle ne se prononce pas nasal.',
  phoneticExamples: [
    'piu-piano',
    'una-spremuta',
    'cosa-ci-consiglia',
    'un-bicchiere-dacqua',
    'un-biglietto-per-roma',
    'chiami-la-polizia',
    'possiamo-avere-il-conto',
  ],
  gender: genderAO,
  units: [
    FIRST_WORDS,
    {
      id: 'table',
      title: 'À table',
      steps: [
        { kind: 'lesson', id: 'bar' },
        { kind: 'scene', id: 'bar' },
        { kind: 'lesson', id: 'resto' },
        { kind: 'scene', id: 'ristorante' },
        { kind: 'review' },
      ],
    },
    {
      id: 'city',
      title: 'En ville',
      steps: [{ kind: 'lesson', id: 'ville' }, { kind: 'scene', id: 'stazione' }, { kind: 'review' }],
    },
    {
      id: 'unexpected',
      title: 'Imprévus',
      steps: [{ kind: 'lesson', id: 'urgences' }, { kind: 'scene', id: 'farmacia' }, { kind: 'review' }],
    },
  ],
  lessons,
  scenes,
  sounds,
  tips,
  extras,
  gloss,
  regions,
  packs: [],
  card,
  arrival: {
    coffee: { place: 'cafe', say: () => firstAnswer(scenes, 'bar') },
    lunch: { place: 'terrace', say: () => phrase(lessons, 'il-menu') },
    commute: { place: 'station', say: () => phrase(lessons, 'a-che-ora-parte') },
    evening: { place: 'hotel', say: name => `Ho una prenotazione a nome di ${name}.` },
  },
  say: {
    toHotel: hotel => `All’hotel ${hotel}, per favore.`,
    allergy: (allergens, g) =>
      genderAO(`Sono allergic{g} ${joinList(allergens.map(withA), 'e')}. È molto importante.`, g),
    myName: name => `Mi chiamo ${name}.`,
  },
  numbers: {
    currency: '€',
    spell: n => (n === 100 ? 'cento' : n < 100 ? numberWords(n) : String(n)),
    sayPrice(euros, cents, short) {
      const e = euros === 1 ? 'un' : numberWords(euros);
      const c = cents ? numberWords(cents) : '';
      if (!c) return euros === 1 ? 'Un euro.' : `Sono ${e} euro.`;
      return short ? `${capitalize(e)} e ${c}.` : `${euros === 1 ? 'Un euro' : `Sono ${e} euro`} e ${c}.`;
    },
    confusable: confusableNumbers,
  },
};

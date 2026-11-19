import { capitalize, confusableNumbers, FIRST_WORDS, firstAnswer, joinList, phrase } from '../shared';
import type { Course } from '../types';
import { card, extras, gloss, lessons, regions, scenes, sounds, tips } from './en.data';

const UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberWords(n: number): string {
  if (n < 20) return UNITS[n]!;
  const tens = TENS[Math.floor(n / 10)]!;
  return n % 10 ? `${tens}-${UNITS[n % 10]}` : tens;
}

export const en: Course = {
  id: 'en',
  lang: 'en-GB',
  name: 'Anglais',
  native: 'English',
  hello: 'Hello!',
  greet: name => `Hello, ${name}!`,
  flag: 'gb',
  phonetics:
    'La syllabe accentuée est en capitales. « th » se dit la langue entre les dents, « dh » de même en faisant ' +
    'vibrer la voix ; le « h » se souffle ; « w » = ou très bref ; le « r » ne se roule pas et se tait en fin ' +
    'de mot ; « eu » est un son neutre très bref ; « ii », « â » et « ô » sont des voyelles longues ; « ng » ' +
    'comme dans « parking ». Un n ou un m doublé après une voyelle ne se prononce pas nasal.',
  phoneticExamples: [
    'thank-you',
    'youre-welcome',
    'i-dont-understand',
    'the-underground',
    'where-is-the-nearest-pharmacy',
    'a-pint-of-lager',
    'good-morning',
  ],
  gender: text => text,
  units: [
    FIRST_WORDS,
    {
      id: 'table',
      title: 'À table',
      steps: [
        { kind: 'lesson', id: 'bar' },
        { kind: 'scene', id: 'cafe' },
        { kind: 'lesson', id: 'resto' },
        { kind: 'scene', id: 'pub' },
        { kind: 'review' },
      ],
    },
    {
      id: 'city',
      title: 'En ville',
      steps: [{ kind: 'lesson', id: 'ville' }, { kind: 'scene', id: 'station' }, { kind: 'review' }],
    },
    {
      id: 'unexpected',
      title: 'Imprévus',
      steps: [{ kind: 'lesson', id: 'urgences' }, { kind: 'scene', id: 'pharmacy' }, { kind: 'review' }],
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
    coffee: { place: 'cafe', say: () => firstAnswer(scenes, 'cafe') },
    lunch: { place: 'pub', say: () => phrase(lessons, 'what-do-you-recommend') },
    commute: { place: 'station', say: () => phrase(lessons, 'which-platform') },
    evening: { place: 'hotel', say: name => `I have a booking under the name ${name}.` },
  },
  say: {
    toHotel: hotel => `To the ${hotel} hotel, please.`,
    allergy: allergens => `I’m allergic to ${joinList(allergens, 'and')}. It’s very important.`,
    myName: name => `My name is ${name}.`,
  },
  numbers: {
    currency: '£',
    spell: n => (n === 100 ? 'one hundred' : n < 100 ? numberWords(n) : String(n)),
    sayPrice(pounds, pence, short) {
      const p = numberWords(pounds);
      const c = pence ? numberWords(pence) : '';
      if (pounds === 1) return c ? `One pound ${c}.` : 'One pound.';
      if (!c) return `That’s ${p} pounds.`;
      return short ? `${capitalize(p)} ${c}.` : `That’s ${p} pounds ${c}.`;
    },
    confusable: confusableNumbers,
  },
};

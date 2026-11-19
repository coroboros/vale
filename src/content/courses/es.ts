import { capitalize, confusableNumbers, FIRST_WORDS, firstAnswer, genderAO, joinList, phrase } from '../shared';
import type { Course } from '../types';
import { card, extras, gloss, lessons, packs, regions, scenes, sounds, tips } from './es.data';

const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

/** Spanish number words up to 99; `apocope` turns a final "uno" into "un" before a noun. */
function numberWords(n: number, apocope = false): string {
  const words = n < 30 ? UNITS[n]! : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` y ${UNITS[n % 10]}` : ''}`;
  return apocope ? words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un') : words;
}

export const es: Course = {
  id: 'es',
  lang: 'es-ES',
  name: 'Espagnol',
  native: 'Español',
  hello: '¡Hola!',
  greet: name => `¡Hola, ${name}!`,
  flag: 'es',
  phonetics:
    'La syllabe accentuée est en capitales. « th » se dit comme en anglais (z, ce, ci), « kh » est un j raclé, ' +
    '« y » remplace ll, « gn » remplace ñ, « r » est roulé une fois, « rr » longuement. ' +
    'Un n ou un m doublé après une voyelle ne se prononce pas nasal.',
  phoneticExamples: [
    'mas-despacio-por-favor',
    'un-zumo-de-naranja',
    'me-lo-llevo',
    'donde-esta-el-bano',
    'que-me-recomienda',
    'a-que-hora-es-el-desayuno',
    'puedo-dejar-la-maleta',
  ],
  gender: genderAO,
  units: [
    FIRST_WORDS,
    {
      id: 'table',
      title: 'À table',
      steps: [
        { kind: 'lesson', id: 'bar' },
        { kind: 'scene', id: 'cafe' },
        { kind: 'lesson', id: 'resto' },
        { kind: 'scene', id: 'tapas' },
        { kind: 'review' },
      ],
    },
    {
      id: 'city',
      title: 'En ville',
      steps: [
        { kind: 'lesson', id: 'ville' },
        { kind: 'scene', id: 'taxi' },
        { kind: 'scene', id: 'rue' },
        { kind: 'review' },
      ],
    },
    {
      id: 'stay',
      title: 'Dormir et acheter',
      steps: [
        { kind: 'lesson', id: 'hotel' },
        { kind: 'scene', id: 'hotel' },
        { kind: 'lesson', id: 'shopping' },
        { kind: 'review' },
      ],
    },
    {
      id: 'unexpected',
      title: 'Imprévus',
      steps: [
        { kind: 'lesson', id: 'urgences' },
        { kind: 'scene', id: 'pharma' },
        { kind: 'pack' },
        { kind: 'review' },
      ],
    },
  ],
  lessons,
  scenes,
  sounds,
  tips,
  extras,
  gloss,
  regions,
  packs,
  card,
  arrival: {
    coffee: { place: 'cafe', say: () => firstAnswer(scenes, 'cafe') },
    lunch: { place: 'terrace', say: () => phrase(lessons, 'la-carta-por-favor') },
    commute: { place: 'taxi', say: () => phrase(lessons, 'al-centro-por-favor') },
    evening: { place: 'hotel', say: name => `Tengo una reserva a nombre de ${name}.` },
  },
  say: {
    toHotel: hotel => `Al hotel ${hotel}, por favor.`,
    allergy(allergens, g) {
      const list = joinList(
        allergens.map(a => (a.startsWith('el ') ? `al ${a.slice(3)}` : `a ${a}`)),
        'y',
      );
      return genderAO(`Soy alérgic{g} ${list}. Es muy importante.`, g);
    },
    myName: name => `Me llamo ${name}.`,
  },
  numbers: {
    spell: n => (n === 100 ? 'cien' : n < 100 ? numberWords(n) : String(n)),
    sayPrice(euros, cents, short) {
      const e = numberWords(euros, true);
      const c = cents ? numberWords(cents) : '';
      if (euros === 1) return c ? `Un euro con ${c}.` : 'Un euro.';
      if (!c) return `Son ${e} euros.`;
      return short ? `${capitalize(e)} con ${c}.` : `Son ${e} euros con ${c}.`;
    },
    confusable: confusableNumbers,
  },
};

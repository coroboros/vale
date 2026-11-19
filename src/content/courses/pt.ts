import { capitalize, confusableNumbers, FIRST_WORDS, firstAnswer, genderAO, joinList, phrase } from '../shared';
import type { Course } from '../types';
import { card, extras, gloss, lessons, regions, scenes, sounds, tips } from './pt.data';

const UNITS = [
  'zero',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'catorze',
  'quinze',
  'dezasseis',
  'dezassete',
  'dezoito',
  'dezanove',
];
const TENS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];

/** European Portuguese number words up to 99 (dezasseis, where Brazil says dezesseis). */
function numberWords(n: number): string {
  if (n < 20) return UNITS[n]!;
  const tens = TENS[Math.floor(n / 10)]!;
  return n % 10 ? `${tens} e ${UNITS[n % 10]}` : tens;
}

/** a + article → contracted preposition (a + o = ao, a + as = às…). */
const withA = (noun: string) =>
  noun.replace(/^(o|os|a|as) /, (_, article: string) => `${{ o: 'ao', os: 'aos', a: 'à', as: 'às' }[article]} `);

export const pt: Course = {
  id: 'pt',
  lang: 'pt-PT',
  name: 'Portugais',
  native: 'Português',
  hello: 'Olá!',
  greet: name => `Olá, ${name}!`,
  flag: 'pt',
  phonetics:
    'La syllabe accentuée est en capitales. « ch » = le s en fin de syllabe (et souvent le x), « gn » = nh, ' +
    '« ly » = lh, « r » est roulé une fois, « rr » se dit comme le r français, « ou » = o sans accent et u, ' +
    '« eu » est un e à peine prononcé. Nasales : « an » et « on » comme en français, « ein » = em et en, ' +
    '« in » = un i nasal (pas celui de « vin »), « aon » = ão, un « an » qui glisse vers « ou ». ' +
    'Un n ou un m doublé après une voyelle ne se prononce pas nasal.',
  phoneticExamples: [
    'mais-devagar',
    'a-casa-de-banho',
    'um-bilhete-para',
    'sempre-em-frente',
    'a-estacao',
    'roubaram-me-a-carteira',
    'para-mim',
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
        { kind: 'scene', id: 'restaurante' },
        { kind: 'review' },
      ],
    },
    {
      id: 'city',
      title: 'En ville',
      steps: [{ kind: 'lesson', id: 'ville' }, { kind: 'scene', id: 'estacao' }, { kind: 'review' }],
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
    coffee: { place: 'cafe', say: () => firstAnswer(scenes, 'cafe') },
    lunch: { place: 'terrace', say: () => phrase(lessons, 'a-ementa') },
    commute: { place: 'station', say: () => phrase(lessons, 'onde-se-compra-o-bilhete') },
    evening: { place: 'hotel', say: name => `Tenho uma reserva em nome de ${name}.` },
  },
  say: {
    toHotel: hotel => `Para o hotel ${hotel}, por favor.`,
    allergy: (allergens, g) =>
      genderAO(`Sou alérgic{g} ${joinList(allergens.map(withA), 'e')}. É muito importante.`, g),
    myName: name => `Chamo-me ${name}.`,
  },
  numbers: {
    spell: n => (n === 100 ? 'cem' : n < 100 ? numberWords(n) : String(n)),
    sayPrice(euros, cents, short) {
      const e = numberWords(euros);
      const c = cents ? numberWords(cents) : '';
      if (euros === 1) return c ? `Um euro e ${c}.` : 'Um euro.';
      if (!c) return `São ${e} euros.`;
      return short ? `${capitalize(e)} e ${c}.` : `São ${e} euros e ${c}.`;
    },
    confusable: confusableNumbers,
  },
};

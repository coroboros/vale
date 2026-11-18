import type { Gender, Unit } from './types';

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Spanish and Italian share the -a/-o ending. */
export const genderAO = (text: string, g: Gender) => text.replaceAll('{g}', g === 'f' ? 'a' : 'o');

export const joinList = (items: string[], and: string) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`;

/**
 * Numbers a French ear confuses in Romance languages: a digit, its teen and its ten
 * (tres/trece/treinta, sei/sedici/sessanta…), plus sixty/seventy.
 */
export function confusableNumbers(n: number): number[] {
  const digit = n < 10 ? n : n < 20 ? n - 10 : n % 10 === 0 ? n / 10 : 0;
  const family = digit >= 2 && digit <= 9 ? [digit, 10 + digit, 10 * digit] : [];
  const extra = n === 60 ? [70] : n === 70 ? [60] : [];
  return [...family, ...extra].filter(x => x !== n);
}

export const FIRST_WORDS: Unit = {
  id: 'first-words',
  title: 'Premiers mots',
  steps: [
    { kind: 'sounds' },
    { kind: 'lesson', id: 'base' },
    { kind: 'lesson', id: 'parler' },
    { kind: 'lesson', id: 'cles' },
    { kind: 'lesson', id: 'nombres' },
    { kind: 'review' },
  ],
};

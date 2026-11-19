import type { Gender, Lesson, Scene, Unit } from './types';

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Spanish, Italian and Portuguese share the -o/-a ending. */
export const genderAO = (text: string, g: Gender) => text.replaceAll('{g}', g === 'f' ? 'a' : 'o');

/** A phrase the course teaches, by item id. A wrong id throws, so the content test catches it. */
export function phrase(lessons: readonly Lesson[], id: string): string {
  const item = lessons.flatMap(l => l.items).find(i => i.id === id);
  if (!item) throw new Error(`No phrase ${id}`);
  return item.t;
}

/** What the traveller says first in a scene: the right answer of its first turn. */
export function firstAnswer(scenes: readonly Scene[], id: string): string {
  const turn = scenes.find(s => s.id === id)?.lines.find(l => l.who === 'you');
  if (turn?.who !== 'you') throw new Error(`No first answer in scene ${id}`);
  return turn.options[0]!;
}

export const joinList = (items: string[], and: string) =>
  items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`;

/**
 * Numbers a French ear confuses: a digit, its teen and its ten (tres/trece/treinta,
 * three/thirteen/thirty…), plus sixty/seventy.
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

import type { Gender } from './types';

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Replaces `{g}` with the -a/-o gender ending shared by Spanish and Italian. */
export const genderAO = (text: string, g: Gender) => text.replaceAll('{g}', g === 'f' ? 'a' : 'o');

/** "a, b y c" with the language's own word for "and". */
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

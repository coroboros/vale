/** French wording the screens share: lists, days, articles before a language's name. */

const and = new Intl.ListFormat('fr-FR', { type: 'conjunction' });

export const andList = (items: readonly string[]) => and.format(items);

/** A title or a sentence carried on inside another: « Commander un café » after « En situation : ». */
export const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const DAYS = {
  weekday: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  day: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }),
  dayYear: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  short: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }),
};

/**
 * A YYYY-MM-DD day, read in local time. French writes the first of the month « 1er » and never
 * breaks a line between the day and its month.
 */
export function frenchDay(iso: string, style: keyof typeof DAYS = 'day'): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const parts = DAYS[style].formatToParts(new Date(y, m - 1, d));
  return parts
    .map((part, i) => {
      if (part.type === 'day' && part.value === '1') return '1er';
      return part.type === 'literal' && parts[i - 1]?.type === 'day' ? '\u00a0' : part.value;
    })
    .join('');
}

const elided = (word: string) => /^[aeiouyéèê]/i.test(word);

/** « l’espagnol », « le portugais ». */
export function theLanguage(name: string): string {
  const word = name.toLowerCase();
  return elided(word) ? `l’${word}` : `le ${word}`;
}

/** « d’espagnol », « de portugais ». */
export function ofLanguage(name: string): string {
  const word = name.toLowerCase();
  return elided(word) ? `d’${word}` : `de ${word}`;
}
